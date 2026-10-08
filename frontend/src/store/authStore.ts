import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ProviderProfile {
  nmc_registration_number?: string
  medical_council?: string
  qualification_degree?: string
  specialization?: string
  hospital_affiliation?: string
  experience_years?: number
  contact_number?: string
  is_verified?: boolean
}

interface User {
  id: string
  email: string
  name: string
  role: string
  phone?: string
  abha_id?: string
  date_of_birth?: string
  blood_group?: string
  height?: number
  weight?: number
  state_residence?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  gender?: string
  avatar_id?: string
  push_subscription?: string
  provider_profile?: ProviderProfile
}

interface AuthStore {
  user: User | null
  token: string | null
  refreshToken: string | null
  _hasHydrated: boolean
  setAuth: (user: User, token: string, refreshToken: string) => void
  updateUser: (fields: Partial<User>) => void
  logout: () => void
  setHasHydrated: (state: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      _hasHydrated: false,
      setAuth: (user, token, refreshToken) => set({ user, token, refreshToken }),
      updateUser: (fields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...fields } : (fields as User),
        })),
      logout: () => set({ user: null, token: null, refreshToken: null }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'careflow-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
