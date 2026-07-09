import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type NotificationType = 'success' | 'info' | 'warning' | 'error' | 'security'

export interface AppNotification {
  id: string
  title: string
  message: string
  type: NotificationType
  timestamp: string // ISO string
  isRead: boolean
}

interface NotificationState {
  notifications: AppNotification[]
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      _hasHydrated: false,
      setHasHydrated: (state) => {
        set({ _hasHydrated: state })
      },
      addNotification: (notification) =>
        set((state) => {
          // Prevent exact duplicate unread notifications from clustering
          const isDuplicate = state.notifications.some(
            (n) => n.title === notification.title && !n.isRead
          )
          
          if (isDuplicate) return state

          return {
            notifications: [
              {
                ...notification,
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                isRead: false,
              },
              ...state.notifications,
            ].slice(0, 50), // Keep max 50 notifications
          }
        }),
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      clearAll: () => set({ notifications: [] }),
    }),
    {
      name: 'careflow-notifications',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
