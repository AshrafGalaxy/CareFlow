"use client"

import { useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Lock, AlertTriangle, Settings, Bell, Palette } from "lucide-react"
import api from "@/lib/api"
import { useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"

// Utility to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user)
  const t = useTranslations("Settings")
  
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  const router = useRouter()

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    try {
      await api.put("/api/auth/password", {
        current_password: currentPassword,
        new_password: newPassword
      })
      toast.success("Password changed successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to change password")
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.")
    if (confirmed) {
      try {
        await api.delete("/api/auth/account")
        toast.success("Account deleted successfully")
        useAuthStore.getState().logout()
        router.push("/")
      } catch (error: any) {
        toast.error(error.response?.data?.detail || "Failed to delete account")
      }
    }
  }

  const handleSubscribePush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast.error("Push notifications are not supported by your browser.")
      return
    }

    setIsSubscribing(true)
    try {
      // Request permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        toast.error("You blocked push notifications. Please enable them in browser settings.")
        return
      }

      // Register SW if not already
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // Subscribe
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) throw new Error("VAPID public key not found")
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      })

      // Send to backend
      await api.post("/api/notifications/subscribe", subscription.toJSON())
      toast.success("Successfully subscribed to alarms!")
    } catch (error: any) {
      console.error(error)
      toast.error("Failed to enable push notifications")
    } finally {
      setIsSubscribing(false)
    }
  }

  const handleTestAlarm = async () => {
    setIsTesting(true)
    try {
      await api.post("/api/notifications/test")
      toast.success("Test alarm triggered. Check your device notifications.")
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to trigger test alarm")
    } finally {
      setIsTesting(false)
    }
  }

 return (
  <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
   
   <div>
    <h1 className="text-3xl font-heading font-bold text-foreground">App Settings</h1>
    <p className="text-muted-foreground mt-1">Manage your application preferences, security, and notifications.</p>
   </div>

   <div className="grid gap-6">

    {/* Preferences Section */}
    <section className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
     <div className="p-6 border-b border-border bg-muted/30">
      <div className="flex items-center gap-3">
       <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
        <Palette size={20} />
       </div>
       <h2 className="text-xl font-heading font-semibold text-foreground">Preferences</h2>
      </div>
     </div>
     <div className="p-6 space-y-4">
      <p className="text-sm text-muted-foreground">App preferences like theme and language will be available here.</p>
      {/* Placeholder for future theme/language toggles */}
     </div>
    </section>

    {/* Notifications & Push */}
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mt-6">
      <div className="p-6 border-b border-border bg-muted/20">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5 text-sky-600" />
          {t("notifications")}
        </h2>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="space-y-4 max-w-md">
          <h3 className="font-medium text-slate-700 dark:text-slate-300">{t("pushAlarms")}</h3>
          <p className="text-sm text-slate-500">
            {t("pushDesc")}
          </p>
          <div className="flex gap-4">
            <Button 
              onClick={handleSubscribePush} 
              disabled={isSubscribing || !!user?.push_subscription}
            >
              {isSubscribing ? "Setting up..." : user?.push_subscription ? "Alarms Enabled ✅" : t("enableAlarms")}
            </Button>

            {user?.push_subscription && (
              <Button 
                variant="outline" 
                onClick={handleTestAlarm} 
                disabled={isTesting}
              >
                {isTesting ? "Sending..." : t("testAlarm")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Security & Password */}
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border bg-muted/20">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Lock className="w-5 h-5 text-sky-600" />
          {t("security")}
        </h2>
      </div>
      <div className="p-6 space-y-6">
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <h3 className="font-medium text-slate-700 dark:text-slate-300">{t("changePassword")}</h3>
          <div className="space-y-2">
            <Label>{t("currentPassword")}</Label>
            <Input 
              id="current-password" 
              type="password" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-background"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{t("newPassword")}</Label>
            <Input 
              id="new-password" 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-background"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input 
              id="confirm-password" 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-background"
              required
            />
          </div>
          <Button type="submit" variant="outline" className="border-border hover:bg-muted">
            Update Password
          </Button>
        </form>
      </div>
    </div>

    {/* Danger Zone */}
    <section className="bg-card border border-destructive/20 rounded-2xl shadow-sm overflow-hidden">
     <div className="p-6 border-b border-destructive/20 bg-destructive/5">
      <div className="flex items-center gap-3">
       <div className="p-2 bg-destructive/10 text-destructive rounded-lg">
        <AlertTriangle size={20} />
       </div>
       <h2 className="text-xl font-heading font-semibold text-destructive">Danger Zone</h2>
      </div>
     </div>
     <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
       <div>
        <h3 className="font-semibold text-foreground">Delete Account</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-lg">
         Permanently remove your account and all of its contents from the CareFlow AI platform. This action is not reversible.
        </p>
       </div>
       <Button 
        variant="destructive" 
        onClick={handleDeleteAccount}
        className="shrink-0"
       >
        Delete my account
       </Button>
      </div>
     </div>
    </section>

   </div>
  </div>
 )
}
