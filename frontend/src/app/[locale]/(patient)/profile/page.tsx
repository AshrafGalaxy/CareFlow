"use client"

import { useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { User, Lock, AlertTriangle, CheckCircle2 } from "lucide-react"
import api from "@/lib/api"
import { useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { useNotificationStore } from "@/store/notificationStore"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProfilePage() {
 const user = useAuthStore((state) => state.user)
 const t = useTranslations("Profile")

 // Dummy state for forms
 const [name, setName] = useState(user?.name || "")
 const [email, setEmail] = useState(user?.email || "")
 const [phone, setPhone] = useState(user?.phone || "")
 const [abhaId, setAbhaId] = useState(user?.abha_id || "")
 const [dateOfBirth, setDateOfBirth] = useState(user?.date_of_birth || "")
 const [bloodGroup, setBloodGroup] = useState(user?.blood_group || "")
 const [height, setHeight] = useState<string>(user?.height ? String(user.height) : "")
 const [weight, setWeight] = useState<string>(user?.weight ? String(user.weight) : "")
 const [stateResidence, setStateResidence] = useState(user?.state_residence || "")
 const [emergencyContactName, setEmergencyContactName] = useState(user?.emergency_contact_name || "")
 const [emergencyContactPhone, setEmergencyContactPhone] = useState(user?.emergency_contact_phone || "")
 
 const [isUpdating, setIsUpdating] = useState(false)
 


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
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        state_residence: stateResidence,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone
      })
      useAuthStore.getState().setAuth(res.data, useAuthStore.getState().token!, useAuthStore.getState().refreshToken!)
      toast.success("Profile updated successfully", {
        description: "Your personal details have been saved.",
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      })
      useNotificationStore.getState().addNotification({
        title: "Profile Updated",
        message: "Your personal information was updated successfully.",
        type: "system",
        isRead: false,
        timestamp: new Date().toISOString()
      })
    } catch (error: any) {
      let msg = "Failed to update profile"
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail
        if (typeof detail === 'string') {
          msg = detail
        } else if (Array.isArray(detail)) {
          msg = detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ')
        } else {
          msg = JSON.stringify(detail)
        }
      }
      toast.error(msg)
    } finally {
      setIsUpdating(false)
    }
  }

 return (
  <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
   
   <div>
    <h1 className="text-3xl font-heading font-bold text-foreground">{t("title")}</h1>
    <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
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
         <Select value={bloodGroup} onValueChange={setBloodGroup}>
          <SelectTrigger id="bloodGroup" className="w-full bg-background">
           <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
           <SelectItem value="A+">A+</SelectItem>
           <SelectItem value="A-">A-</SelectItem>
           <SelectItem value="B+">B+</SelectItem>
           <SelectItem value="B-">B-</SelectItem>
           <SelectItem value="AB+">AB+</SelectItem>
           <SelectItem value="AB-">AB-</SelectItem>
           <SelectItem value="O+">O+</SelectItem>
           <SelectItem value="O-">O-</SelectItem>
          </SelectContent>
         </Select>
        </div>
        <div className="space-y-2">
         <Label htmlFor="height">Height (cm)</Label>
         <Input 
          id="height" 
          type="number"
          value={height} 
          onChange={(e) => setHeight(e.target.value)} 
          className="bg-background"
          placeholder="e.g. 175"
         />
        </div>
        <div className="space-y-2">
         <Label htmlFor="weight">Weight (kg)</Label>
         <Input 
          id="weight" 
          type="number"
          value={weight} 
          onChange={(e) => setWeight(e.target.value)} 
          className="bg-background"
          placeholder="e.g. 70"
         />
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



   </div>
  </div>
 )
}
