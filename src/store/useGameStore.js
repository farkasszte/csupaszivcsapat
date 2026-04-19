import { create } from 'zustand'
import projectSettings from '../data/project_settings.json'
import { ArcScript } from '../logic/ArcScript'
import { createClient } from '@/utils/supabase/client'

const arcScript = new ArcScript(projectSettings)
const supabase = createClient()
let saveTimer = null;


const getInitialVariables = () => {
    return Object.entries(projectSettings.variables || {}).reduce((acc, [id, v]) => {
        if (!v.root && v.name) acc[v.name] = v.value !== undefined ? v.value : false;
        return acc;
    }, {});
};

export const useGameStore = create((set, get) => ({
    // State
    currentElementId: projectSettings.startingElement,
    visits: {},
    variables: getInitialVariables(),
    history: [],
    storyLog: [],
    discoveredComponents: [],
    recentDiscoveries: [],
    loading: false,
    error: null,
    message: null,
    isStarted: true,
    finishedStories: [], // Track indices of finished stories

    // Settings
    volume: 0.5,
    isMuted: false,
    typewriterSpeed: 0,
    transitionsEnabled: true,
    colorFilter: 'none',


    // Actions
    visitElement: (id) => {
        set((state) => {
            const newVisits = { ...state.visits };
            newVisits[id] = (newVisits[id] || 0) + 1;

            // Collect discovered components
            const element = projectSettings.elements[id];
            const newDiscovered = [...state.discoveredComponents];
            const newRecents = [...(state.recentDiscoveries || [])];
            if (element?.components) {
                element.components.forEach(compId => {
                    if (!newDiscovered.includes(compId)) {
                        newDiscovered.push(compId);
                        newRecents.push({ id: compId, timestamp: Date.now() });
                    }
                });
            }

            // Handle story completion points
            const storyEndpoints = [
                { id: 'c37401ef-7dba-4848-9b65-28f4373ded2d', points: 10, index: 1 },
                { id: '5e0dfb24-8471-4a72-b626-83a41a8e4ffd', points: 15, index: 2 },
                { id: '8f6d180f-ef83-41ac-bcaa-fe5bb5b10a77', points: 25, index: 3 }
            ];

            const endpoint = storyEndpoints.find(e => e.id === id);
            const newFinishedStories = [...(state.finishedStories || [])];
            const newVariables = { ...state.variables };

            // EXECUTE SCRIPTS FROM CONTENT
            if (element?.content) {
                const tempState = { visits: newVisits, variables: newVariables };
                arcScript.parseRichText(element.content, tempState, id);
                // Variables might be updated by parseRichText -> executeScript
            }

            if (endpoint && !newFinishedStories.includes(endpoint.index)) {
                newFinishedStories.push(endpoint.index);
                newVariables.score = (newVariables.score || 0) + endpoint.points;
                newVariables[`selected_${endpoint.index}`] = true;
            }

            return {
                visits: newVisits,
                discoveredComponents: newDiscovered,
                recentDiscoveries: newRecents,
                finishedStories: newFinishedStories,
                variables: newVariables
            };
        });

        // AUTO-TRANSITION LOGIC
        setTimeout(() => {
            const state = get();
            const element = projectSettings.elements[id];
            if (element?.outputs && element.outputs.length === 1) {
                const connId = element.outputs[0];
                const conn = projectSettings.connections[connId];
                // If it's a straight connection with no label (or empty p tag), it's automatic
                const hasLabel = conn?.label && conn.label.replace(/<[^>]*>/g, '').trim().length > 0;
                if (!hasLabel) {
                    state.navigateTo(connId); // navigateTo handles resolution
                }
            }
        }, 100);
    },

    clearRecentDiscovery: (compId) => {
        set((state) => ({
            recentDiscoveries: (state.recentDiscoveries || []).filter(d => d.id !== compId)
        }));
    },

    resolveTarget: (targetId, currentLabel = null) => {
        if (!targetId) return { id: null, label: currentLabel };

        let label = currentLabel;

        // Check for Jumper
        const jumper = projectSettings.jumpers[targetId];
        if (jumper) {
            return get().resolveTarget(jumper.elementId, label);
        }

        // Check for Branch
        const branch = projectSettings.branches[targetId];
        if (branch) {
            const connId = get().resolveBranch(targetId);
            if (connId) {
                const conn = projectSettings.connections[connId];
                if (conn) {
                    // If we don't have a label yet, and this connection has one, use it
                    if (!label && conn.label) {
                        const stripped = conn.label.replace(/<[^>]*>/g, '').trim();
                        if (stripped.length > 0) {
                            label = conn.label;
                        }
                    }
                    return get().resolveTarget(conn.targetid, label);
                }
            }
            return { id: null, label };
        }

        // Must be an element
        return { id: targetId, label };
    },

    navigateTo: (targetId, choiceLabel = null) => {
        if (!targetId) return;

        // targetId can be a connectionId or a direct elementId/branchId/jumperId
        let actualTarget = targetId;
        const connection = projectSettings.connections[targetId];
        if (connection) {
            actualTarget = connection.targetid;
        }

        const { id: finalId } = get().resolveTarget(actualTarget);
        if (!finalId) return;

        const currentId = get().currentElementId;

        set((state) => {
            // Mark the current log entry's choiceMade
            const updatedLog = state.storyLog.map((entry, idx) =>
                idx === state.storyLog.length - 1
                    ? { ...entry, choiceMade: choiceLabel }
                    : entry
            );

            // Add new entry for the element we're navigating to
            updatedLog.push({
                elementId: finalId,
                choiceMade: null,
            });

            return {
                history: [...state.history, state.currentElementId],
                currentElementId: finalId,
                storyLog: updatedLog,
            };
        });
        get().visitElement(finalId);
    },

    startStory: (boardId) => {
        const board = projectSettings.boards[boardId];
        if (!board || board.elements.length === 0) return;

        const startId = board.elements[0];
        set({
            currentElementId: startId,
            visits: {},
            variables: { score: 0 },
            history: [],
            storyLog: [{ elementId: startId, choiceMade: null }],
            discoveredComponents: [],
            recentDiscoveries: [],
            isStarted: true,
            error: null,
            message: null
        });

        get().visitElement(startId);
        get().saveGame(true);
    },

    executeScript: (script) => {
        const { visits, variables, currentElementId } = get();
        const tempState = { visits, variables };
        arcScript.executeScript(script, tempState);
        set({ variables: tempState.variables });
    },

    evaluate: (condition) => {
        const { visits, variables, currentElementId } = get();
        return arcScript.evaluateCondition(condition, { visits, variables }, currentElementId);
    },

    resolveBranch: (branchId) => {
        const branch = projectSettings.branches[branchId];
        if (!branch) return null;

        const ifCondId = branch.conditions?.ifCondition;
        if (ifCondId) {
            const ifCond = projectSettings.conditions[ifCondId];
            if (get().evaluate(ifCond.script)) {
                return ifCond.output;
            }
        }

        const elseCondId = branch.conditions?.elseCondition;
        if (elseCondId) {
            const elseCond = projectSettings.conditions[elseCondId];
            return elseCond.output;
        }

        return null;
    },

    // Initialize first log entry
    initStoryLog: () => {
        const currentId = get().currentElementId;
        if (get().storyLog.length === 0) {
            set({
                storyLog: [{
                    elementId: currentId,
                    choiceMade: null,
                }]
            });
        }
    },

    // Persistence Actions
    saveGame: async (immediate = false) => {
        // Clear any pending save
        if (saveTimer) {
            clearTimeout(saveTimer);
            saveTimer = null;
        }

        const performSave = async () => {
            set({ loading: true, error: null, message: null });
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const {
                    currentElementId, visits, variables, history, storyLog, discoveredComponents,
                    finishedStories,
                    volume, isMuted, typewriterSpeed, transitionsEnabled, colorFilter
                } = get();

                const stepsToSave = storyLog.map(({ elementId, choiceMade }) => ({ elementId, choiceMade }));

                const gameState = {
                    currentElementId, visits, variables, history, storyLog, discoveredComponents,
                    finishedStories,
                    settings: { volume, isMuted, typewriterSpeed, transitionsEnabled, colorFilter }
                };

                const { error } = await supabase
                    .from('game_saves')
                    .upsert({
                        user_id: session.user.id,
                        game_state: gameState,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id' });

                if (error) {
                    if (error.status === 429) {
                        set({ error: 'Túl sok mentési kérés. Kérlek várj pár másodpercet.' });
                    } else {
                        throw error;
                    }
                }
            } catch (err) {
                console.error('Save error:', err);
                set({ error: err.message });
            } finally {
                set({ loading: false });
            }
        };

        if (immediate) {
            await performSave();
        } else {
            saveTimer = setTimeout(performSave, 3000);
        }
    },




    loadGame: async () => {
        set({ loading: true, error: null, message: null });
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;
            if (!session) throw new Error('Bejelentkezés szükséges.');

            const { data, error } = await supabase
                .from('game_saves')
                .select('game_state')
                .eq('user_id', session.user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 means no row found

            const gameState = data?.game_state;
            if (gameState) {
                const s = gameState.settings || {};
                set({
                    currentElementId: gameState.currentElementId,
                    visits: gameState.visits,
                    variables: gameState.variables,
                    history: gameState.history,
                    storyLog: gameState.storyLog || [],
                    discoveredComponents: gameState.discoveredComponents || [],
                    volume: s.volume ?? 0.5,
                    isMuted: s.isMuted ?? false,
                    typewriterSpeed: s.typewriterSpeed ?? 30,
                    transitionsEnabled: s.transitionsEnabled ?? true,
                    colorFilter: s.colorFilter ?? 'none',
                    isStarted: true,
                });
            } else {
                set({ error: 'Nincs mentett játékállás.' });
            }
        } catch (err) {
            console.error('Load error:', err);
            set({ error: err.message });
        } finally {
            set({ loading: false });
        }
    },

    // Silent auto-load on app startup (no error UI)
    autoLoad: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data, error } = await supabase
                .from('game_saves')
                .select('game_state')
                .eq('user_id', session.user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            const gameState = data?.game_state;
            if (gameState) {
                const s = gameState.settings || {};
                set({
                    currentElementId: gameState.currentElementId,
                    visits: gameState.visits,
                    variables: gameState.variables,
                    history: gameState.history,
                    storyLog: gameState.storyLog || [],
                    discoveredComponents: gameState.discoveredComponents || [],
                    finishedStories: gameState.finishedStories || [],
                    volume: s.volume ?? 0.5,
                    isMuted: s.isMuted ?? false,
                    typewriterSpeed: s.typewriterSpeed ?? 30,
                    transitionsEnabled: s.transitionsEnabled ?? true,
                    colorFilter: s.colorFilter ?? 'none',
                    isStarted: true,
                });
            }
        } catch (err) {
            console.error('Auto-load error:', err);
        }
    },



    resetGame: () => {
        const startId = projectSettings.startingElement;
        set({
            currentElementId: startId,
            visits: {},
            variables: getInitialVariables(),
            history: [],
            storyLog: [{ elementId: startId, choiceMade: null }],
            discoveredComponents: [],
            recentDiscoveries: [],
            finishedStories: [],
            error: null,
            message: null,
            isStarted: true
        });

        get().visitElement(startId);
    },

    setStarted: (val) => set({ isStarted: val }),

    // Setting Setters (each triggers a debounced save)
    setVolume: (volume) => { set({ volume }); get().saveGame(); },
    setIsMuted: (isMuted) => { set({ isMuted }); get().saveGame(); },
    setTypewriterSpeed: (typewriterSpeed) => { set({ typewriterSpeed }); get().saveGame(); },
    setTransitionsEnabled: (transitionsEnabled) => { set({ transitionsEnabled }); get().saveGame(); },
    setColorFilter: (colorFilter) => { set({ colorFilter }); get().saveGame(); },
    clearMessage: () => set({ error: null, message: null }),
}));


