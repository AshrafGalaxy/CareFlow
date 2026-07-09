import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SidebarState = 'expanded' | 'collapsed' | 'hidden'

interface SidebarStore {
  state: SidebarState
  setState: (state: SidebarState) => void
  toggle: () => void
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      state: 'expanded',
      setState: (newState) => set({ state: newState }),
      toggle: () =>
        set((prev) => ({
          state: prev.state === 'expanded' ? 'collapsed' : 'expanded',
        })),
    }),
    {
      name: 'careflow-sidebar-state',
    }
  )
)
