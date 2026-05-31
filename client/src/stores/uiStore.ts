import { create } from 'zustand'

type BottomPanel = 'score' | 'tradeoffs' | 'board' | null

interface UIState {
  activeBottomPanel: BottomPanel
  selectedNodeId: string | null
  setBottomPanel: (panel: BottomPanel) => void
  selectNode: (id: string | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  activeBottomPanel: 'score',
  selectedNodeId: null,
  setBottomPanel: (panel) => set((s) => ({ activeBottomPanel: s.activeBottomPanel === panel ? null : panel })),
  selectNode: (id) => set({ selectedNodeId: id }),
}))
