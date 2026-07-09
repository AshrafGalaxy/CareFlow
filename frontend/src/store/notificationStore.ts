import { create } from 'zustand'

export type NotificationType = 'success' | 'info' | 'warning' | 'error' | 'security'

export interface AppNotification {
  id: string
  title: string
  message: string
  type: NotificationType
  timestamp: string
  isRead: boolean
}

const MAX_NOTIFICATIONS = 50
const storageKey = (userId: string) => `careflow-notifications-${userId}`

function readFromStorage(userId: string): AppNotification[] {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeToStorage(userId: string, notifications: AppNotification[]) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(notifications))
  } catch {
    // localStorage full or unavailable
  }
}

function deleteFromStorage(userId: string) {
  try {
    localStorage.removeItem(storageKey(userId))
  } catch {
    // ignore
  }
}

interface NotificationState {
  notifications: AppNotification[]
  currentUserId: string | null
  _hasHydrated: boolean

  /**
   * Called immediately after a user successfully logs in.
   * Reads this user's saved notifications from their personal localStorage key
   * and hydrates the in-memory store.
   */
  loadForUser: (userId: string) => void

  /**
   * Called on logout. Writes current in-memory notifications to the user's
   * personal localStorage key (so they survive the session), then clears
   * the in-memory state. The data is NOT deleted — it will be reloaded
   * on the user's next login.
   */
  saveAndEject: () => void

  /**
   * Called ONLY on account deletion. Permanently removes the user's
   * notification data from localStorage and clears in-memory state.
   * There is no recovery after this.
   */
  purgeForUser: (userId: string) => void

  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
  setHasHydrated: (state: boolean) => void
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  currentUserId: null,
  _hasHydrated: false,

  setHasHydrated: (state) => set({ _hasHydrated: state }),

  loadForUser: (userId) => {
    const notifications = readFromStorage(userId)
    set({ notifications, currentUserId: userId, _hasHydrated: true })
  },

  saveAndEject: () => {
    const { notifications, currentUserId } = get()
    if (currentUserId) {
      writeToStorage(currentUserId, notifications)
    }
    // Clear in-memory state — data is safe in localStorage
    set({ notifications: [], currentUserId: null, _hasHydrated: false })
  },

  purgeForUser: (userId) => {
    deleteFromStorage(userId)
    set({ notifications: [], currentUserId: null, _hasHydrated: false })
  },

  addNotification: (notification) =>
    set((state) => {
      // Prevent exact duplicate unread notifications
      const isDuplicate = state.notifications.some(
        (n) => n.title === notification.title && !n.isRead
      )
      if (isDuplicate) return state

      const newNotifications = [
        {
          ...notification,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          isRead: false,
        },
        ...state.notifications,
      ].slice(0, MAX_NOTIFICATIONS)

      // Auto-persist every time a notification is added
      if (state.currentUserId) {
        writeToStorage(state.currentUserId, newNotifications)
      }

      return { notifications: newNotifications }
    }),

  markAsRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      )
      if (state.currentUserId) writeToStorage(state.currentUserId, notifications)
      return { notifications }
    }),

  markAllAsRead: () =>
    set((state) => {
      const notifications = state.notifications.map((n) => ({ ...n, isRead: true }))
      if (state.currentUserId) writeToStorage(state.currentUserId, notifications)
      return { notifications }
    }),

  removeNotification: (id) =>
    set((state) => {
      const notifications = state.notifications.filter((n) => n.id !== id)
      if (state.currentUserId) writeToStorage(state.currentUserId, notifications)
      return { notifications }
    }),

  clearAll: () => set({ notifications: [] }),
}))
