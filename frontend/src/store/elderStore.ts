import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ElderStore {
  isElderMode: boolean
  highContrast: boolean
  fontSize: 'normal' | 'large' | 'xlarge'
  toggleElderMode: () => void
  toggleHighContrast: () => void
  setFontSize: (size: 'normal' | 'large' | 'xlarge') => void
  resetDefaults: () => void
}

export const useElderStore = create<ElderStore>()(
  persist(
    (set) => ({
      isElderMode: false,
      highContrast: false,
      fontSize: 'normal',
      toggleElderMode: () => set((state) => ({ isElderMode: !state.isElderMode })),
      toggleHighContrast: () => set((state) => ({ highContrast: !state.highContrast })),
      setFontSize: (fontSize) => set({ fontSize }),
      resetDefaults: () => set({ isElderMode: false, highContrast: false, fontSize: 'normal' }),
    }),
    {
      name: 'careflow-elder-mode',
    }
  )
)
