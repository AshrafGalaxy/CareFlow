import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
 id: string
 email: string
 name: string
 role: string
 phone?: string
 abha_id?: string
 date_of_birth?: string
 blood_group?: string
 state_residence?: string
 emergency_contact_name?: string
 emergency_contact_phone?: string
 push_subscription?: string
}

interface AuthStore {
 user: User | null
 token: string | null
 refreshToken: string | null
 _hasHydrated: boolean
 setAuth: (user: User, token: string, refreshToken: string) => void
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
