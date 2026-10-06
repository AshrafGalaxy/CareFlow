export interface HumanAvatar {
  id: string;
  label: string;
  category: "Young" | "Adult" | "Senior" | "Clinician" | "Neutral";
  gender: "female" | "male" | "neutral";
  role?: "patient" | "doctor" | "all";
  path: string;
}

export const HUMAN_AVATARS: HumanAvatar[] = [
  { id: "female-young", label: "Young Woman", category: "Young", gender: "female", role: "all", path: "/avatars/peeps/female-young.svg" },
  { id: "male-young", label: "Young Man", category: "Young", gender: "male", role: "all", path: "/avatars/peeps/male-young.svg" },
  { id: "female-adult", label: "Adult Woman", category: "Adult", gender: "female", role: "all", path: "/avatars/peeps/female-adult.svg" },
  { id: "male-adult", label: "Adult Man", category: "Adult", gender: "male", role: "all", path: "/avatars/peeps/male-adult.svg" },
  { id: "female-elder", label: "Senior Woman", category: "Senior", gender: "female", role: "all", path: "/avatars/peeps/female-elder.svg" },
  { id: "male-elder", label: "Senior Man", category: "Senior", gender: "male", role: "all", path: "/avatars/peeps/male-elder.svg" },
  { id: "doctor-female", label: "Dr. Female", category: "Clinician", gender: "female", role: "doctor", path: "/avatars/peeps/doctor-female.svg" },
  { id: "doctor-male", label: "Dr. Male", category: "Clinician", gender: "male", role: "doctor", path: "/avatars/peeps/doctor-male.svg" },
  { id: "neutral", label: "Neutral", category: "Neutral", gender: "neutral", role: "all", path: "/avatars/peeps/neutral.svg" },
];

export function getAvatarById(id?: string | null): HumanAvatar {
  if (!id) return HUMAN_AVATARS[0];
  const found = HUMAN_AVATARS.find((a) => a.id === id);
  return found || HUMAN_AVATARS[0];
}

export function getDefaultAvatar(params: {
  role?: string;
  gender?: string | null;
  dob?: string | null;
  name?: string | null;
}): string {
  const { role, gender, dob, name } = params;

  if (role === "doctor") {
    if (gender === "female") return "doctor-female";
    return "doctor-male";
  }

  // Calculate age if date_of_birth is present
  let isSenior = false;
  if (dob) {
    try {
      const birthDate = new Date(dob);
      const ageDiff = Date.now() - birthDate.getTime();
      const ageDate = new Date(ageDiff);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      if (age >= 60) isSenior = true;
    } catch {
      // fallback
    }
  }

  if (isSenior) {
    if (gender === "female") return "female-elder";
    return "male-elder";
  }

  if (gender === "female") {
    return "female-young";
  }
  if (gender === "male") {
    return "male-young";
  }

  // Fallback: deterministic selection by name
  if (name) {
    const code = name.charCodeAt(0) + (name.length > 1 ? name.charCodeAt(1) : 0);
    const options = ["female-young", "male-young", "female-adult", "male-adult", "neutral"];
    return options[code % options.length];
  }

  return "female-young";
}
