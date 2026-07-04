"use client"

import { useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { User, Lock, AlertTriangle } from "lucide-react"

export default function ProfilePage() {
 const user = useAuthStore((state) => state.user)

 // Dummy state for forms
 const [name, setName] = useState(user?.name || "")
 const [email, setEmail] = useState("patient@example.com")
 
 const [currentPassword, setCurrentPassword] = useState("")
 const [newPassword, setNewPassword] = useState("")
 const [confirmPassword, setConfirmPassword] = useState("")

 const handleUpdateProfile = (e: React.FormEvent) => {
  e.preventDefault()
  // Here we would typically call an API to update the profile
  toast.success("Profile updated successfully")
 }

 const handleChangePassword = (e: React.FormEvent) => {
  e.preventDefault()
  if (newPassword !== confirmPassword) {
   toast.error("New passwords do not match")
   return
  }
  // Mock API call
  toast.success("Password changed successfully")
  setCurrentPassword("")
  setNewPassword("")
  setConfirmPassword("")
 }

 const handleDeleteAccount = () => {
  // In a real app, you'd show a confirmation dialog first
  const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.")
  if (confirmed) {
   toast.success("Account deleted (mocked)")
   // logout()
  }
 }

 return (
  <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
   
   <div>
    <h1 className="text-3xl font-heading font-bold text-foreground">Profile Settings</h1>
    <p className="text-muted-foreground mt-1">Manage your account details and security preferences.</p>
   </div>

   <div className="grid gap-6">
    
    {/* Personal Details Section */}
    <section className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
     <div className="p-6 border-b border-border bg-muted/30">
      <div className="flex items-center gap-3">
       <div className="p-2 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-lg">
        <User size={20} />
       </div>
       <h2 className="text-xl font-heading font-semibold text-foreground">Personal Details</h2>
      </div>
     </div>
     <div className="p-6">
      <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl">
       <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input 
         id="name" 
         value={name} 
         onChange={(e) => setName(e.target.value)} 
         className="bg-background"
        />
       </div>
       <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input 
         id="email" 
         type="email" 
         value={email} 
         onChange={(e) => setEmail(e.target.value)} 
         disabled
         className="bg-muted text-muted-foreground border-transparent"
        />
        <p className="text-xs text-muted-foreground">Contact support to change your email address.</p>
       </div>
       <Button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white">
        Save Changes
       </Button>
      </form>
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
