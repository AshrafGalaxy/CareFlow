"use client"

import { useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { User, Lock, AlertTriangle } from "lucide-react"
import api from "@/lib/api"
import { useRouter } from "@/i18n/routing"

export default function ProfilePage() {
 const user = useAuthStore((state) => state.user)

 // Dummy state for forms
 const [name, setName] = useState(user?.name || "")
 const [email, setEmail] = useState(user?.email || "")
 const [phone, setPhone] = useState(user?.phone || "")
 const [abhaId, setAbhaId] = useState(user?.abha_id || "")
 const [dateOfBirth, setDateOfBirth] = useState(user?.date_of_birth || "")
 const [bloodGroup, setBloodGroup] = useState(user?.blood_group || "")
 const [stateResidence, setStateResidence] = useState(user?.state_residence || "")
 const [emergencyContactName, setEmergencyContactName] = useState(user?.emergency_contact_name || "")
 const [emergencyContactPhone, setEmergencyContactPhone] = useState(user?.emergency_contact_phone || "")
 
 const [isUpdating, setIsUpdating] = useState(false)
 
 const [currentPassword, setCurrentPassword] = useState("")
 const [newPassword, setNewPassword] = useState("")
 const [confirmPassword, setConfirmPassword] = useState("")

  const router = useRouter()

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      const res = await api.patch("/api/auth/profile", {
        name,
        phone,
        abha_id: abhaId,
        date_of_birth: dateOfBirth,
        blood_group: bloodGroup,
        state_residence: stateResidence,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone
      })
      useAuthStore.getState().setAuth(res.data, useAuthStore.getState().accessToken!, useAuthStore.getState().refreshToken!)
      toast.success("Profile updated successfully")
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update profile")
    } finally {
      setIsUpdating(false)
    }
  }

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
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
         <Label htmlFor="phone">Phone Number</Label>
         <Input 
          id="phone" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
          className="bg-background"
         />
        </div>
        <div className="space-y-2">
         <Label htmlFor="dob">Date of Birth</Label>
         <Input 
          id="dob" 
          type="date"
          value={dateOfBirth} 
          onChange={(e) => setDateOfBirth(e.target.value)} 
          className="bg-background"
         />
        </div>
        <div className="space-y-2">
         <Label htmlFor="abha">ABHA ID</Label>
         <Input 
          id="abha" 
          value={abhaId} 
          onChange={(e) => setAbhaId(e.target.value)} 
          className="bg-background"
         />
        </div>
        <div className="space-y-2">
         <Label htmlFor="bloodGroup">Blood Group</Label>
         <select
          id="bloodGroup"
          value={bloodGroup}
          onChange={(e) => setBloodGroup(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
         >
          <option value="">Select...</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
         </select>
        </div>
        <div className="space-y-2">
         <Label htmlFor="state">State of Residence</Label>
         <Input 
          id="state" 
          value={stateResidence} 
          onChange={(e) => setStateResidence(e.target.value)} 
          className="bg-background"
         />
        </div>
       </div>
       
       <div className="pt-2">
        <h3 className="text-sm font-medium text-foreground mb-2">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="space-y-2">
          <Label htmlFor="emergencyName">Name</Label>
          <Input 
           id="emergencyName" 
           value={emergencyContactName} 
           onChange={(e) => setEmergencyContactName(e.target.value)} 
           className="bg-background"
          />
         </div>
         <div className="space-y-2">
          <Label htmlFor="emergencyPhone">Phone Number</Label>
          <Input 
           id="emergencyPhone" 
           value={emergencyContactPhone} 
           onChange={(e) => setEmergencyContactPhone(e.target.value)} 
           className="bg-background"
          />
         </div>
        </div>
       </div>
       <Button type="submit" disabled={isUpdating} className="bg-sky-500 hover:bg-sky-600 text-white mt-4">
        {isUpdating ? "Saving..." : "Save Changes"}
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
