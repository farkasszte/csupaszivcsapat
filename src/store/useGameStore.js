import { create } from 'zustand'
import projectSettings from '../data/project_settings.json'
import { ArcScript } from '../logic/ArcScript'
import { createClient } from '@/utils/supabase/client'

const arcScript = new ArcScript(projectSettings)
const supabase = createClient()
let saveTimer = null;


export const useGameStore = create((set, get) => ({
    // State
    currentElementId: projectSettings.startingElement,
    visits: {},
    variables: { score: 0 },
    history: [],
    storyLog: [],
    discoveredComponents: [],
    recentDiscoveries: [],
    loading: false,
    error: null,
    message: null,
    isStarted: false,

    // Settings
    volume: 0.5,
    isMuted: false,
    typewriterSpeed: 30,
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

            return {
                visits: newVisits,
                discoveredComponents: newDiscovered,
                recentDiscoveries: newRecents
            };
        });
    },

    clearRecentDiscovery: (compId) => {
        set((state) => ({
            recentDiscoveries: (state.recentDiscoveries || []).filter(d => d.id !== compId)
        }));
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
                    volume, isMuted, typewriterSpeed, transitionsEnabled, colorFilter
                } = get();

                const stepsToSave = storyLog.map(({ elementId, choiceMade }) => ({ elementId, choiceMade }));

                const gameState = {
                    currentElementId, visits, variables, history,
                    storyLog: stepsToSave, discoveredComponents,
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
            variables: { score: 0 },
            history: [],
            storyLog: [{ elementId: startId, choiceMade: null }],
            discoveredComponents: [],
            recentDiscoveries: [],
            error: null,
            message: null,
            isStarted: false
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


