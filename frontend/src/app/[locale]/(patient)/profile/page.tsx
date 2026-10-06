"use client"

import { useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { User, AlertTriangle, CheckCircle2 } from "lucide-react"
import api from "@/lib/api"
import { useTranslations } from "next-intl"
import { useNotificationStore } from "@/store/notificationStore"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OpenPeepAvatar } from "@/components/shared/OpenPeepAvatar"
import { HUMAN_AVATARS, getAvatarById, getDefaultAvatar } from "@/lib/avatars"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const t = useTranslations("Profile")

  // Personal state
  const [name, setName] = useState(user?.name || "")
  const [email] = useState(user?.email || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [gender, setGender] = useState(user?.gender || "")
  const [abhaId, setAbhaId] = useState(user?.abha_id || "")
  const [dateOfBirth, setDateOfBirth] = useState(user?.date_of_birth || "")
  const [bloodGroup, setBloodGroup] = useState(user?.blood_group || "")
  const [height, setHeight] = useState<string>(user?.height ? String(user.height) : "")
  const [weight, setWeight] = useState<string>(user?.weight ? String(user.weight) : "")
  const [stateResidence, setStateResidence] = useState(user?.state_residence || "")
  const [emergencyContactName, setEmergencyContactName] = useState(user?.emergency_contact_name || "")
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(user?.emergency_contact_phone || "")

  const [activeAvatarId, setActiveAvatarId] = useState(
    user?.avatar_id || getDefaultAvatar({ role: user?.role, gender: user?.gender, dob: user?.date_of_birth, name: user?.name })
  )

  const [isUpdating, setIsUpdating] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSelectAvatar = async (id: string) => {
    setActiveAvatarId(id)
    useAuthStore.getState().updateUser({ avatar_id: id })
    try {
      await api.patch("/api/auth/profile", { avatar_id: id })
      toast.success("Avatar updated", {
        description: "Your profile picture has been updated.",
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      })
    } catch {
      // Keep optimistic update in store
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = "Full name is required"
    if (!phone.trim() || phone.length < 10) newErrors.phone = "Valid phone number is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error("Please fix the validation errors before saving.", {
        icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      })
      return
    }

    setIsUpdating(true)
    setErrors({})
    try {
      const res = await api.patch("/api/auth/profile", {
        name,
        phone,
        gender: gender || null,
        avatar_id: activeAvatarId,
        abha_id: abhaId,
        date_of_birth: dateOfBirth || null,
        blood_group: bloodGroup || null,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        state_residence: stateResidence,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
      })
      useAuthStore.getState().setAuth(res.data, useAuthStore.getState().token!, useAuthStore.getState().refreshToken!)
      toast.success("Profile updated successfully", {
        description: "Your personal details have been saved.",
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        className: "border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20",
      })
      useNotificationStore.getState().addNotification({
        title: "Profile Updated",
        message: "Your personal information was updated successfully.",
        type: "system",
      })
    } catch (error: any) {
      let msg = "Failed to update profile"
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail
        if (typeof detail === "string") {
          msg = detail
        } else if (Array.isArray(detail)) {
          msg = detail.map((errItem: any) => errItem.msg || JSON.stringify(errItem)).join(", ")
        } else {
          msg = JSON.stringify(detail)
        }
      }
      toast.error(msg, {
        description: "Please try again later.",
        icon: <AlertTriangle className="w-5 h-5 text-rose-500" />,
        className: "border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Avatar Selection Card */}
        <section className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-lg">
                <User size={20} />
              </div>
              <div>
                <h2 className="text-xl font-heading font-semibold text-foreground">Profile Portrait</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Hand-drawn minimalist avatar automatically matched to your profile. Click any portrait to switch.
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 flex flex-col md:flex-row items-center gap-8">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="relative ring-4 ring-sky-500/20 rounded-full p-1 bg-white dark:bg-slate-900 shadow-md">
                <OpenPeepAvatar
                  avatarId={activeAvatarId}
                  name={user?.name}
                  gender={gender}
                  role={user?.role}
                  dob={dateOfBirth}
                  size="xl"
                />
              </div>
              <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                {getAvatarById(activeAvatarId).label}
              </span>
            </div>

            <div className="flex-1 w-full">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Choose Portrait
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-5 gap-3">
                {HUMAN_AVATARS.map((av) => {
                  const isSelected = activeAvatarId === av.id
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => handleSelectAvatar(av.id)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all text-center group cursor-pointer",
                        isSelected
                          ? "border-sky-500 bg-sky-50/60 dark:bg-sky-950/30 ring-2 ring-sky-500/30 shadow-sm"
                          : "border-border hover:border-slate-300 dark:hover:border-slate-700 hover:bg-muted/40"
                      )}
                    >
                      <img
                        src={av.path}
                        alt={av.label}
                        className="w-11 h-11 rounded-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="text-[11px] font-medium text-foreground truncate max-w-full">
                        {av.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

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
                  className={`bg-background ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
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
                    className={`bg-background ${errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={gender}
                    onValueChange={(v) => {
                      setGender(v || "")
                      // Auto-update avatar if not already customized
                      if (v === "female" && !user?.avatar_id) {
                        handleSelectAvatar("female-young")
                      } else if (v === "male" && !user?.avatar_id) {
                        handleSelectAvatar("male-young")
                      }
                    }}
                  >
                    <SelectTrigger id="gender" className="w-full bg-background">
                      <SelectValue placeholder="Select gender..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="other">Other / Non-binary</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Select value={bloodGroup} onValueChange={(v) => setBloodGroup(v || "")}>
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
