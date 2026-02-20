import { create } from 'zustand'
import projectSettings from '../data/project_settings.json'
import { ArcScript } from '../logic/ArcScript'
import { createClient } from '@/utils/supabase/client'

const arcScript = new ArcScript(projectSettings)
const supabase = createClient()

export const useGameStore = create((set, get) => ({
    // State
    currentElementId: projectSettings.startingElement,
    visits: {},
    variables: { score: 0 },
    history: [],
    storyLog: [],
    loading: false,
    error: null,
    message: null,

    // Actions
    visitElement: (id) => {
        set((state) => {
            const newVisits = { ...state.visits };
            newVisits[id] = (newVisits[id] || 0) + 1;
            return { visits: newVisits };
        });
    },

    navigateTo: (targetId, choiceLabel = null) => {
        if (!targetId) return;

        let finalId = targetId;
        const jumper = projectSettings.jumpers[targetId];
        if (jumper) {
            finalId = jumper.elementId;
        }

        const branch = projectSettings.branches[finalId];
        if (branch) {
            const connId = get().resolveBranch(finalId);
            if (connId) {
                const conn = projectSettings.connections[connId];
                if (conn) {
                    get().navigateTo(conn.targetid, choiceLabel);
                    return;
                }
            }
        }

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
    saveGame: async () => {
        set({ loading: true, error: null, message: null });
        try {
            const { currentElementId, visits, variables, history, storyLog } = get();
            // Only persist minimal step data — titles/content are reconstructed from project on load
            const stepsToSave = storyLog.map(({ elementId, choiceMade }) => ({ elementId, choiceMade }));
            const gameState = { currentElementId, visits, variables, history, storyLog: stepsToSave };

            const { error } = await supabase.auth.updateUser({
                data: { game_state: gameState }
            });

            if (error) throw error;
            set({ message: 'Játékállás mentve!' });
        } catch (err) {
            set({ error: err.message });
        } finally {
            set({ loading: false });
        }
    },

    loadGame: async () => {
        set({ loading: true, error: null, message: null });
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;

            const gameState = user.user_metadata?.game_state;
            if (gameState) {
                set({
                    currentElementId: gameState.currentElementId,
                    visits: gameState.visits,
                    variables: gameState.variables,
                    history: gameState.history,
                    storyLog: gameState.storyLog || [],
                    message: 'Játékállás betöltve!'
                });
            } else {
                set({ error: 'Nincs mentett játékállás.' });
            }
        } catch (err) {
            set({ error: err.message });
        } finally {
            set({ loading: false });
        }
    },

    resetGame: () => {
        const startId = projectSettings.startingElement;
        set({
            currentElementId: startId,
            visits: {},
            variables: { score: 0 },
            history: [],
            storyLog: [{ elementId: startId, choiceMade: null }],
            error: null,
            message: null
        });
        get().visitElement(startId);
    }
}));
