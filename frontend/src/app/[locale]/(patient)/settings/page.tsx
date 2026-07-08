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

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user)
  
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

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

    {/* Notifications Section */}
    <section className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
     <div className="p-6 border-b border-border bg-muted/30">
      <div className="flex items-center gap-3">
       <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
        <Bell size={20} />
       </div>
       <h2 className="text-xl font-heading font-semibold text-foreground">Medication Alarms</h2>
      </div>
     </div>
     <div className="p-6 space-y-4">
      <p className="text-sm text-muted-foreground mb-4">Enable browser push notifications to receive medication reminders even when the app is closed.</p>
      <Button variant="outline" className="border-sky-200 hover:bg-sky-50 hover:text-sky-700 dark:border-sky-900 dark:hover:bg-sky-900/50 dark:hover:text-sky-300">
       <Bell className="w-4 h-4 mr-2" />
       Enable Push Notifications
      </Button>
     </div>
    </section>

    {/* Security Section */}
    <section className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
     <div className="p-6 border-b border-border bg-muted/30">
      <div className="flex items-center gap-3">
       <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
        <Lock size={20} />
       </div>
       <h2 className="text-xl font-heading font-semibold text-foreground">Security</h2>
      </div>
     </div>
     <div className="p-6">
      <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
       <div className="space-y-2">
        <Label htmlFor="current-password">Current Password</Label>
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
        <Label htmlFor="new-password">New Password</Label>
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
        <Label htmlFor="confirm-password">Confirm New Password</Label>
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
    </section>

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
