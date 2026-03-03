"use client"

import { useRouter } from "next/navigation"
import {
  Calendar,
  User as UserIcon,
  Scale,
  Ruler,
  Activity,
  Pill,
  Heart,
  Target,
  CheckCircle2,
  LogOut,
} from "lucide-react"
import { mockUser } from "@/lib/mock-data"
import { StarBackground } from "@/components/star-background"
import Image from "next/image"

const profileFields = [
  { icon: Calendar, label: "อายุ", value: `${mockUser.age} ปี` },
  { icon: UserIcon, label: "เพศ", value: mockUser.gender },
  { icon: Scale, label: "น้ำหนัก", value: `${mockUser.weight} kg` },
  { icon: Ruler, label: "ส่วนสูง", value: `${mockUser.height} cm` },
  { icon: Activity, label: "BMI", value: `${mockUser.bmi}` },
  { icon: Scale, label: "รอบเอว", value: `${mockUser.waist} ซม.` },
  { icon: Pill, label: "เบาหวาน", value: `${mockUser.diabetesYears} ปี` },
  { icon: Heart, label: "โค้ช", value: mockUser.coach },
]

export default function ProfilePage() {
  const router = useRouter()

  const handleLogout = () => {
    router.push("/")
  }

  return (
    <div className="relative">
      <StarBackground />
      <div className="relative z-10 px-4 pt-6">
        {/* Header */}
        <h1 className="text-center text-xl font-bold text-foreground">
          โปรไฟล์นักกีฬา
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          {mockUser.name} | HN: {mockUser.hn}
        </p>

        {/* Avatar */}
        <div className="mt-4 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#DBEAFE]">
            <UserIcon className="h-10 w-10 text-[#3B82F6]" />
          </div>
        </div>

        {/* Basic Info Card */}
        <div className="mt-4 card-soft overflow-hidden">
          <div className="bg-[#F0FDF4] px-4 py-2">
            <h2 className="text-center text-sm font-bold text-foreground">
              ข้อมูลพื้นฐาน
            </h2>
          </div>
          <div className="px-4 py-3">
            {profileFields.map((field) => {
              const Icon = field.icon
              return (
                <div
                  key={field.label}
                  className="flex items-center gap-3 py-1.5"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#DBEAFE]">
                    <Icon className="h-4 w-4 text-[#3B82F6]" />
                  </div>
                  <span className="text-sm text-foreground">
                    {field.label}: <span className="font-semibold">{field.value}</span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Assessment Results */}
        <div className="mt-4 card-soft overflow-hidden">
          <div className="bg-[#FEF9C3] px-4 py-2">
            <h2 className="text-center text-sm font-bold text-foreground">
              ผลการประเมิน
            </h2>
          </div>
          <div className="px-4 py-3">
            <div className="flex items-center gap-3 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#DCFCE7]">
                <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
              </div>
              <span className="text-sm text-foreground">
                PAM: ระดับ <span className="font-semibold">{mockUser.pamLevel} ({mockUser.pamLabel})</span>, คะแนน {mockUser.pamScore}
              </span>
            </div>
            <div className="flex items-center gap-3 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#DCFCE7]">
                <Heart className="h-4 w-4 text-[#EF4444]" />
              </div>
              <span className="text-sm text-foreground">
                PROMs: <span className="font-bold text-[#22C55E]">{mockUser.promsZone}</span>, {`"${mockUser.promsNote}"`}
              </span>
            </div>
            <div className="flex items-center gap-3 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#DCFCE7]">
                <Target className="h-4 w-4 text-[#EF4444]" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-foreground">
                  Confidence: {mockUser.confidence}, <span className="font-semibold text-[#22C55E]">{mockUser.confidenceStatus}</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {`"${mockUser.confidenceQuote}"`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mascot */}
        <div className="mt-4 flex justify-center gap-4">
          <Image
            src="/images/mascot-main.png"
            alt="DeMi+ Mascot"
            width={80}
            height={90}
            className="h-auto w-20"
          />
        </div>

        {/* Logout Button */}
        <div className="mt-4 pb-6">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#EF4444] bg-card px-8 py-3 text-base font-bold text-[#EF4444] transition-transform active:scale-95"
          >
            <LogOut className="h-5 w-5" />
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  )
}
