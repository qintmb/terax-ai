import { emit, listen } from "@tauri-apps/api/event";
import { create } from "zustand";
import {
  BUILTIN_AGENTS,
  loadAgents,
  newAgentId,
  saveActiveAgentId,
  saveAgentSkillIds,
  saveCustomAgents,
  type Agent,
} from "../lib/agents";

const CHANGED_EVENT = "terax://ai-agents-changed";

type AgentsState = {
  hydrated: boolean;
  customAgents: Agent[];
  activeId: string;
  agentSkillIds: Record<string, string[]>;
  /** All agents, builtin first. */
  all: () => Agent[];
  getSkillIds: (id: string) => string[];
  hydrate: () => Promise<void>;
  setActiveId: (id: string) => void;
  setAgentSkillIds: (id: string, skillIds: string[]) => void;
  upsert: (agent: Agent) => void;
  remove: (id: string) => void;
};

let initialized = false;

function broadcast(): void {
  void emit(CHANGED_EVENT);
}

export const useAgentsStore = create<AgentsState>((set, get) => ({
  hydrated: false,
  customAgents: [],
  activeId: BUILTIN_AGENTS[0].id,
  agentSkillIds: {},
  all: () => [...BUILTIN_AGENTS, ...get().customAgents],
  getSkillIds: (id) => get().agentSkillIds[id] ?? [],
  hydrate: async () => {
    if (initialized) return;
    initialized = true;
    const { custom, activeId, agentSkillIds } = await loadAgents();
    set({ customAgents: custom, activeId, agentSkillIds, hydrated: true });

    void listen(CHANGED_EVENT, async () => {
      const fresh = await loadAgents();
      set({
        customAgents: fresh.custom,
        activeId: fresh.activeId,
        agentSkillIds: fresh.agentSkillIds,
      });
    });
  },
  setActiveId: (id) => {
    set({ activeId: id });
    void saveActiveAgentId(id).then(broadcast);
  },
  setAgentSkillIds: (id, skillIds) => {
    const next = {
      ...get().agentSkillIds,
      [id]: Array.from(new Set(skillIds)),
    };
    set({ agentSkillIds: next });
    void saveAgentSkillIds(next).then(broadcast);
  },
  upsert: (agent) => {
    if (agent.builtIn) return;
    const list = get().customAgents;
    const idx = list.findIndex((a) => a.id === agent.id);
    const next =
      idx === -1 ? [...list, agent] : list.map((a) => (a.id === agent.id ? agent : a));
    set({ customAgents: next });
    void saveCustomAgents(next).then(broadcast);
  },
  remove: (id) => {
    const list = get().customAgents.filter((a) => a.id !== id);
    set({ customAgents: list });
    const nextSkillIds = { ...get().agentSkillIds };
    delete nextSkillIds[id];
    set({ agentSkillIds: nextSkillIds });
    let active = get().activeId;
    if (active === id) {
      active = BUILTIN_AGENTS[0].id;
      set({ activeId: active });
      void saveActiveAgentId(active);
    }
    void Promise.all([saveCustomAgents(list), saveAgentSkillIds(nextSkillIds)]).then(
      broadcast,
    );
  },
}));

export { newAgentId };
