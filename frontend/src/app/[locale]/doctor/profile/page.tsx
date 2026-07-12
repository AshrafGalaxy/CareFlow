"use client"

import { useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { User, CheckCircle2, Stethoscope, Building2, Phone, GraduationCap, AlertTriangle } from "lucide-react"
import api from "@/lib/api"
import { useTranslations } from "next-intl"
import { useNotificationStore } from "@/store/notificationStore"

export default function DoctorProfilePage() {
 const user = useAuthStore((state) => state.user)
 const t = useTranslations("Profile")

 // Base fields
 const [name, setName] = useState(user?.name || "")
 const [email, setEmail] = useState(user?.email || "")
 const [phone, setPhone] = useState(user?.phone || "")
 const [stateResidence, setStateResidence] = useState(user?.state_residence || "")

 // Doctor specific fields
 const provider = (user as any)?.provider_profile || {}
 const [nmcRegistrationNumber, setNmcRegistrationNumber] = useState(provider.nmc_registration_number || "")
 const [medicalCouncil, setMedicalCouncil] = useState(provider.medical_council || "")
 const [qualificationDegree, setQualificationDegree] = useState(provider.qualification_degree || "")
 const [specialization, setSpecialization] = useState(provider.specialization || "")
 const [hospitalAffiliation, setHospitalAffiliation] = useState(provider.hospital_affiliation || "")
 const [experienceYears, setExperienceYears] = useState<string>(provider.experience_years ? String(provider.experience_years) : "")
 const [contactNumber, setContactNumber] = useState(provider.contact_number || "")
 
 const [isUpdating, setIsUpdating] = useState(false)
 const [errors, setErrors] = useState<Record<string, string>>({})
 
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = "Full name is required"
    if (!phone.trim() || phone.length < 10) newErrors.phone = "Valid phone number is required"
    if (!specialization.trim()) newErrors.specialization = "Specialization is required"
    if (!qualificationDegree.trim()) newErrors.qualificationDegree = "Qualification degree is required"
    if (!hospitalAffiliation.trim()) newErrors.hospitalAffiliation = "Hospital affiliation is required"
    if (!nmcRegistrationNumber.trim()) newErrors.nmcRegistrationNumber = "NMC registration number is required"
    if (!medicalCouncil.trim()) newErrors.medicalCouncil = "Medical council is required"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
 
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error("Please fix the validation errors before saving.", {
        icon: <AlertTriangle className="w-5 h-5 text-amber-500" />
      })
      return
    }
    
    setIsUpdating(true)
    setErrors({})
    try {
      const res = await api.patch("/api/auth/profile", {
        name,
        phone,
        state_residence: stateResidence,
        nmc_registration_number: nmcRegistrationNumber,
        medical_council: medicalCouncil,
        qualification_degree: qualificationDegree,
        specialization,
        hospital_affiliation: hospitalAffiliation,
        experience_years: experienceYears ? parseInt(experienceYears) : null,
        contact_number: contactNumber
      })
      useAuthStore.getState().setAuth(res.data, useAuthStore.getState().token!, useAuthStore.getState().refreshToken!)
      toast.success("Profile updated successfully", {
        description: "Your provider details have been saved.",
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        className: "border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20"
      })
      useNotificationStore.getState().addNotification({
        title: "Profile Updated",
        message: "Your provider profile was updated successfully.",
        type: "system"
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
      toast.error(msg, {
        description: "Please try again later.",
        icon: <AlertTriangle className="w-5 h-5 text-rose-500" />,
        className: "border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20"
      })
    } finally {
      setIsUpdating(false)
    }
  }

 return (
  <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
   
   <div>
    <h1 className="text-3xl font-heading font-bold text-foreground">Provider Profile</h1>
    <p className="text-muted-foreground mt-1">Manage your personal and professional provider details.</p>
   </div>

   {/* Premium Identity Header */}
   <div className="bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
    <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
     <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/40 shrink-0">
      <User size={48} className="text-white" />
     </div>
     <div className="text-center sm:text-left">
      <h2 className="text-2xl sm:text-3xl font-bold mb-1">{name || "Dr. Said Sona"}</h2>
      <p className="text-sky-100 font-medium mb-3 flex items-center justify-center sm:justify-start gap-2">
       <Stethoscope size={16} /> {specialization || "Specialization"} &bull; {qualificationDegree || "Degree"}
      </p>
      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
       <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium border border-white/20 flex items-center gap-1.5">
        <Building2 size={12} /> {hospitalAffiliation || "Hospital Affiliation"}
       </span>
       {nmcRegistrationNumber && (
        <span className="px-3 py-1 bg-emerald-500/80 backdrop-blur-md rounded-full text-xs font-medium border border-emerald-400/50 flex items-center gap-1.5">
         <CheckCircle2 size={12} /> NMC: {nmcRegistrationNumber}
        </span>
       )}
      </div>
     </div>
    </div>
   </div>

   <div className="grid gap-6">
    
    {/* Professional Details Section */}
    <section className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
     <div className="p-6 border-b border-border bg-muted/30">
      <div className="flex items-center gap-3">
       <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
        <Stethoscope size={20} />
       </div>
       <h2 className="text-xl font-heading font-semibold text-foreground">Professional Credentials</h2>
      </div>
     </div>
     <div className="p-6">
      <form id="profile-form" onSubmit={handleUpdateProfile} className="space-y-6 max-w-xl">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
         <Label htmlFor="specialization">Specialization</Label>
         <div className="relative">
          <Stethoscope className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
           id="specialization" 
           value={specialization} 
           onChange={(e) => setSpecialization(e.target.value)} 
           placeholder="e.g. Cardiology"
           className={`bg-background pl-9 ${errors.specialization ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          />
         </div>
         {errors.specialization && <p className="text-xs text-red-500 mt-1">{errors.specialization}</p>}
        </div>
        <div className="space-y-2">
         <Label htmlFor="qualificationDegree">Qualification / Degree</Label>
         <div className="relative">
          <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
           id="qualificationDegree" 
           value={qualificationDegree} 
           onChange={(e) => setQualificationDegree(e.target.value)} 
           placeholder="e.g. MBBS, MD"
           className={`bg-background pl-9 ${errors.qualificationDegree ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          />
         </div>
         {errors.qualificationDegree && <p className="text-xs text-red-500 mt-1">{errors.qualificationDegree}</p>}
        </div>
       </div>

       <div className="space-y-2">
        <Label htmlFor="hospitalAffiliation">Hospital/Clinic Affiliation</Label>
        <div className="relative">
         <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
         <Input 
          id="hospitalAffiliation" 
          value={hospitalAffiliation} 
          onChange={(e) => setHospitalAffiliation(e.target.value)} 
          placeholder="e.g. City General Hospital"
          className={`bg-background pl-9 ${errors.hospitalAffiliation ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
         />
        </div>
        {errors.hospitalAffiliation && <p className="text-xs text-red-500 mt-1">{errors.hospitalAffiliation}</p>}
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
         <Label htmlFor="experienceYears">Years of Experience</Label>
         <Input 
          id="experienceYears" 
          type="number"
          value={experienceYears} 
          onChange={(e) => setExperienceYears(e.target.value)} 
          className="bg-background"
          placeholder="e.g. 10"
         />
        </div>
        <div className="space-y-2">
         <Label htmlFor="contactNumber">Clinic Contact Number</Label>
         <div className="relative">
          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
           id="contactNumber" 
           value={contactNumber} 
           onChange={(e) => setContactNumber(e.target.value)} 
           className="bg-background pl-9"
           placeholder="For patient appointments"
          />
         </div>
        </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="space-y-2">
         <Label htmlFor="nmcRegistrationNumber">NMC Registration Number</Label>
         <Input 
          id="nmcRegistrationNumber" 
          value={nmcRegistrationNumber} 
          onChange={(e) => setNmcRegistrationNumber(e.target.value)} 
          className={`bg-background ${errors.nmcRegistrationNumber ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
         />
         {errors.nmcRegistrationNumber && <p className="text-xs text-red-500 mt-1">{errors.nmcRegistrationNumber}</p>}
        </div>
        <div className="space-y-2">
         <Label htmlFor="medicalCouncil">Medical Council</Label>
         <Input 
          id="medicalCouncil" 
          value={medicalCouncil} 
          onChange={(e) => setMedicalCouncil(e.target.value)} 
          className={`bg-background ${errors.medicalCouncil ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
         />
         {errors.medicalCouncil && <p className="text-xs text-red-500 mt-1">{errors.medicalCouncil}</p>}
        </div>
       </div>
      </form>
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
      <div className="space-y-4 max-w-xl">
       <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input 
         id="name" 
         form="profile-form"
         value={name} 
         onChange={(e) => setName(e.target.value)} 
         className={`bg-background ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
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
         <Label htmlFor="phone">Personal Phone</Label>
         <Input 
          id="phone" 
          form="profile-form"
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
          className={`bg-background ${errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
         />
         {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>
        <div className="space-y-2">
         <Label htmlFor="state">State of Residence</Label>
         <Input 
          id="state" 
          form="profile-form"
          value={stateResidence} 
          onChange={(e) => setStateResidence(e.target.value)} 
          className="bg-background"
         />
        </div>
       </div>
       
       <Button type="submit" form="profile-form" disabled={isUpdating} className="bg-sky-500 hover:bg-sky-600 text-white mt-6">
        {isUpdating ? "Saving..." : "Save Changes"}
       </Button>
      </div>
     </div>
    </section>

   </div>
  </div>
 )
}
