import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Requirement {
  id: string
  type: 'FR' | 'NFR'
  text: string
}

export interface ApiEndpoint {
  id: string
  method: string
  path: string
  desc: string
}

export interface DataModel {
  id: string
  name: string
  fields: string
}

interface BoardState {
  requirements: Requirement[]
  endpoints: ApiEndpoint[]
  models: DataModel[]
  addRequirement: (r: Requirement) => void
  addEndpoint: (e: ApiEndpoint) => void
  addModel: (m: DataModel) => void
  clearBoard: () => void
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      requirements: [],
      endpoints: [],
      models: [],

      addRequirement: (r) => {
        if (get().requirements.find(x => x.id === r.id)) return
        set(s => ({ requirements: [...s.requirements, r] }))
      },
      addEndpoint: (e) => {
        if (get().endpoints.find(x => x.id === e.id)) return
        set(s => ({ endpoints: [...s.endpoints, e] }))
      },
      addModel: (m) => {
        if (get().models.find(x => x.id === m.id)) return
        set(s => ({ models: [...s.models, m] }))
      },
      clearBoard: () => set({ requirements: [], endpoints: [], models: [] }),
    }),
    {
      name: 'sdt-board',
      partialize: (state) => ({
        requirements: state.requirements,
        endpoints: state.endpoints,
        models: state.models,
      }),
    }
  )
)
