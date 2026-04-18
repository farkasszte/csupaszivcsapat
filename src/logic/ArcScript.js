
/**
 * Simple ArcScript evaluator for the Arcweave project.
 * Handles:
 * - visits(elementId)
 * - variable assignments (score += 1, foo = "bar")
 * - variable retrieval (show(score))
 * - comparison operators (==, >, <, >=, <=, !=)
 */
export class ArcScript {
    constructor(projectData) {
        this.projectData = projectData;
        // Map helpful labels/names to IDs for easier referencing if needed, 
        // though the JSON mostly uses IDs or internal names.
        this.nameToId = {};
        Object.entries(projectData.elements).forEach(([id, el]) => {
            // Normalize name for "mention" lookups if necessary
            // el.title might contain HTML, so this is an approximation
        });
    }

    /**
     * Evaluates a condition string against the current state.
     * @param {string} condition - e.g. "visits(element_id) > 0"
     * @param {object} state - { visits: {id: count}, variables: {name: value} }
     * @param {string} currentElementId - The ID of the current element for visits() context
     * @returns {boolean}
     */
    evaluateCondition(condition, state, currentElementId) {
        if (!condition) return true;

        // Simple sanitization
        let expr = condition.trim();

        // Replace visits(id) or visits() with actual values
        // Case 1: visits(some_id)
        expr = expr.replace(/visits\(([^)]+)\)/g, (match, idRef) => {
            const id = this.resolveId(idRef);
            return state.visits[id] || 0;
        });

        // Case 2: visits() - refers to current element
        expr = expr.replace(/visits\(\)/g, () => {
            return state.visits[currentElementId] || 0;
        });

        // Replace variables
        // This is a naive regex, might need to be more robust for complex expressions
        Object.keys(state.variables).forEach(VarName => {
            const regex = new RegExp(`\\b${VarName}\\b`, 'g');
            expr = expr.replace(regex, state.variables[VarName]);
        });

        try {
            // eslint-disable-next-line no-new-func
            return Function('"use strict";return (' + expr + ')')();
        } catch (e) {
            console.error("Failed to evaluate condition:", condition, e);
            return false;
        }
    }

    /**
     * Executes a script statement to update state.
     * @param {string} script - e.g. "score += 5"
     * @param {object} state - Mutable state object
     */
    executeScript(script, state) {
        if (!script) return;

        const statements = script.split(';');
        statements.forEach(stmt => {
            stmt = stmt.trim();
            if (!stmt) return;

            // Assignments: var += val, var -= val, var = val
            const assignMatch = stmt.match(/([a-zA-Z0-9_]+)\s*(\+|-)?=\s*(.+)/);
            if (assignMatch) {
                const [, varName, op, valExpr] = assignMatch;
                // Evaluate the value expression
                let val = valExpr.trim();
                // Resolve simple variables in value
                if (!Number.isNaN(Number(val)) && val !== '') {
                    val = Number(val);
                } else if (val === 'true') {
                    val = true;
                } else if (val === 'false') {
                    val = false;
                } else if (val.startsWith('"') || val.startsWith("'")) {
                    val = val.slice(1, -1);
                } else {
                    // Try to resolve variable
                    if (state.variables[val] !== undefined) {
                        val = state.variables[val];
                    }
                }

                if (op === '+') {
                    state.variables[varName] = (state.variables[varName] || 0) + val;
                } else if (op === '-') {
                    state.variables[varName] = (state.variables[varName] || 0) - val;
                } else {
                    state.variables[varName] = val;
                }
            }
        });
    }

    /**
     * Parses HTML content for embedded ArcScript logic and returns segments.
     * @param {string} html
     * @param {object} state
     * @param {string} currentElementId
     * @returns {Array<{type: string, content: string}>}
     */
    parseRichText(html, state, currentElementId, { readOnly = false } = {}) {
        if (typeof window === 'undefined') return [];

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const nodes = Array.from(doc.body.childNodes);

        const results = [];
        const conditionStack = [];

        nodes.forEach((node) => {
            if (node.nodeName === 'PRE') {
                const code = node.textContent?.trim();
                if (code) {
                    if (code.startsWith('if ')) {
                        const condition = code.substring(3).trim();
                        const result = this.evaluateCondition(condition, state, currentElementId);
                        conditionStack.push(result);
                    } else if (code.startsWith('elseif ')) {
                        const condition = code.substring(7).trim();
                        const prevResult = conditionStack.pop();
                        if (prevResult === true) {
                            conditionStack.push(false);
                        } else {
                            conditionStack.push(this.evaluateCondition(condition, state, currentElementId));
                        }
                    } else if (code === 'else') {
                        const prevResult = conditionStack.pop();
                        conditionStack.push(!prevResult);
                    } else if (code === 'endif') {
                        conditionStack.pop();
                    } else {
                        if (conditionStack.every(r => r === true)) {
                            if (code.startsWith('show(')) {
                                const match = code.match(/show\((.*)\)/);
                                if (match) {
                                    const args = match[1].split(',').map(s => s.trim());
                                    const rendered = args.map(arg => {
                                        if (arg.startsWith('"') || arg.startsWith("'")) return arg.slice(1, -1);
                                        let val = state.variables[arg];
                                        if (val === undefined) val = "";
                                        return val;
                                    }).join('');
                                    results.push({ type: 'text', content: rendered });
                                }
                            } else if (!readOnly) {
                                // Only execute scripts in normal (non-readOnly) mode
                                this.executeScript(code, state);
                            }
                            // In readOnly mode, script blocks are silently skipped
                        }
                    }
                }
            } else {
                if (conditionStack.every(r => r === true)) {
                    if (node.nodeType === 1) { // ELEMENT_NODE
                        results.push({ type: 'html', content: node.outerHTML });
                    } else if (node.nodeType === 3 && node.textContent.trim()) { // TEXT_NODE
                        results.push({ type: 'text', content: node.textContent });
                    }
                }
            }
        });

        return results;
    }

    /**
     * Renders rich text to a single (mostly) plain-text string for things like labels.
     */
    renderRichText(html, state, currentElementId) {
        const segments = this.parseRichText(html, state, currentElementId);
        return segments.map(seg => {
            if (seg.type === 'html') {
                // Strip HTML tags for labels
                return seg.content.replace(/<[^>]*>?/gm, '');
            }
            return seg.content;
        }).join('').trim();
    }

    resolveId(ref) {
        // If it looks like a GUID, return it
        if (ref.match(/^[0-9a-f-]{36}$/)) return ref;
        // Handle the Mention type references if possible: 
        // <span data-id="..."> is in HTML, but here we likely have raw text "the_crusader"
        // checks if projectData has this mapping or if it's a variable.

        // For this specific JSON, we might need a mapping lookup if the user writes logic with names.
        // However, looking at the JSON provided (line 359): 
        // if visits(<span ... data-id="188e6385...">the_crusader</span>)
        // The parser needs to strip the HTML span and grab the data-id OR the text content.
        // Actually, standard Arcweave output often keeps the ID in the reference.

        // Let's rely on the caller to extract the ID from the HTML span before passing here, 
        // or handle the span regex here.
        const spanMatch = ref.match(/data-id="([^"]+)"/);
        if (spanMatch) return spanMatch[1];

        return ref;
    }
}
