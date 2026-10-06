import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ElderStore {
  isElderMode: boolean
  highContrast: boolean
  fontSize: 'normal' | 'large' | 'xlarge'
  toggleElderMode: () => void
  toggleHighContrast: () => void
  setFontSize: (size: 'normal' | 'large' | 'xlarge') => void
}

export const useElderStore = create<ElderStore>()(
  persist(
    (set) => ({
      isElderMode: true, // Default to true for Phase 1 Elder Core emphasis
      highContrast: false,
      fontSize: 'large',
      toggleElderMode: () => set((state) => ({ isElderMode: !state.isElderMode })),
      toggleHighContrast: () => set((state) => ({ highContrast: !state.highContrast })),
      setFontSize: (fontSize) => set({ fontSize }),
    }),
    {
      name: 'careflow-elder-mode',
    }
  )
)
