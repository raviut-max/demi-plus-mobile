import { Trophy, Scale, Droplets, Pill, Heart, CheckCircle2, XCircle, Utensils, Dumbbell, Moon } from "lucide-react"
import { mockUser } from "@/lib/mock-data"
import { StarBackground } from "@/components/star-background"
import Image from "next/image"

export default function GoalsPage() {
  return (
    <div className="relative">
      <StarBackground />
      <div className="relative z-10 px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-[#CA8A04]" />
            <h1 className="text-xl font-bold text-foreground">เป้าหมายของฉัน</h1>
          </div>
          <Image
            src="/images/mascot-main.png"
            alt="DeMi+ Mascot"
            width={60}
            height={70}
            className="h-auto w-14"
          />
        </div>

        {/* Level Badge */}
        <div className="mt-3 flex justify-center">
          <div className="flex items-center gap-2 rounded-full bg-[#DCFCE7] px-5 py-1.5">
            <span className="text-sm font-bold text-[#16A34A]">
              L4 Champion | Green Zone
            </span>
          </div>
        </div>

        {/* Main Goals Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {/* Weight Goal */}
          <div className="card-soft flex flex-col items-center gap-2 p-4">
            <Scale className="h-6 w-6 text-[#3B82F6]" />
            <p className="text-xs font-semibold text-foreground">{"น้ำหนักลด 5-10%"}</p>
            <div className="rounded-full bg-[#DCFCE7] px-3 py-1">
              <span className="text-xs font-bold text-[#16A34A]">
                {mockUser.weight} kg {">"} {mockUser.targetWeight} kg
              </span>
            </div>
            <button className="btn-green-gradient mt-1 rounded-full px-4 py-1 text-xs font-semibold text-[#FFFFFF]">
              เริ่มต้นวันนี้
            </button>
          </div>

          {/* Blood Sugar Goal */}
          <div className="card-soft flex flex-col items-center gap-2 p-4">
            <Droplets className="h-6 w-6 text-[#3B82F6]" />
            <p className="text-xs font-semibold text-foreground">{"น้ำตาล <100 mg/dL"}</p>
            <span className="text-2xl font-bold text-[#3B82F6]">
              {mockUser.currentBloodSugar}
            </span>
            <button className="btn-green-gradient rounded-full px-4 py-1 text-xs font-semibold text-[#FFFFFF]">
              เริ่มต้นวันนี้
            </button>
          </div>

          {/* Medication Goal */}
          <div className="card-soft flex flex-col items-center gap-2 p-4">
            <Pill className="h-6 w-6 text-[#3B82F6]" />
            <p className="text-xs font-semibold text-foreground">ลด/หยุดยา</p>
            <p className="text-xs text-muted-foreground">ลด 1 ชนิด</p>
            <button className="btn-green-gradient mt-1 rounded-full px-4 py-1 text-xs font-semibold text-[#FFFFFF]">
              เริ่มต้นวันนี้
            </button>
          </div>

          {/* HbA1c Goal */}
          <div className="card-soft flex flex-col items-center gap-2 rounded-xl border-2 border-[#FCA5A5] p-4">
            <XCircle className="h-6 w-6 text-[#EF4444]" />
            <p className="text-xs font-semibold text-foreground">{"ภาวะสงบ (HbA1c < 6.5%)"}</p>
            <span className="text-2xl font-bold text-[#EF4444]">{mockUser.hba1c}%</span>
            <button className="rounded-full border-2 border-[#CA8A04] bg-card px-4 py-1 text-xs font-semibold text-[#CA8A04]">
              เริ่มต้นวันนี้
            </button>
          </div>
        </div>

        {/* Weekly Goals - Food */}
        <div className="mt-4 card-soft overflow-hidden">
          <div className="flex items-center gap-2 bg-[#F0FDF4] px-4 py-2">
            <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 text-xs font-medium text-[#16A34A]">
              ต้องปรับปรุง
            </span>
            <span className="font-bold text-foreground">เป้าหมายรายสัปดาห์</span>
          </div>
          <div className="px-4 py-3">
            <WeeklyGoalItem label={"กินคาร์บ <5 คาร์บ/วัน"} completed={true} />
            <WeeklyGoalItem label={"กินโปรตีน > 3 หน่วย"} completed={true} />
            <WeeklyGoalItem label={"ดื่มน้ำ >1 ลิตร"} completed={false} />
          </div>
        </div>

        {/* Weekly Goals - Exercise */}
        <div className="mt-3 card-soft overflow-hidden">
          <div className="flex items-center gap-2 bg-[#EFF6FF] px-4 py-2">
            <span className="rounded-full bg-[#DBEAFE] px-2 py-0.5 text-xs font-medium text-[#3B82F6]">
              ต้องปรับปรุง
            </span>
            <span className="font-bold text-foreground">ออกกำลังกาย</span>
          </div>
          <div className="px-4 py-3">
            <WeeklyGoalItem label="Stretching" completed={true} />
            <WeeklyGoalItem label="Cardio" completed={false} />
            <WeeklyGoalItem label="Strengthening" completed={false} />
            <WeeklyGoalItem label="HIIT" completed={false} />
          </div>
        </div>

        {/* Sleep */}
        <div className="mt-3 card-soft overflow-hidden">
          <div className="flex items-center gap-2 bg-[#EDE9FE] px-4 py-3">
            <Moon className="h-5 w-5 text-[#7C3AED]" />
            <div>
              <span className="font-bold text-foreground">พักผ่อน</span>
              <p className="text-xs text-muted-foreground">นอนหลับเพียงพอ</p>
            </div>
          </div>
        </div>

        <div className="h-6" />
      </div>
    </div>
  )
}

function WeeklyGoalItem({ label, completed }: { label: string; completed: boolean }) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      {completed ? (
        <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />
      ) : (
        <div className="h-5 w-5 rounded-full border-2 border-border" />
      )}
      <span className="text-sm text-foreground">{label}</span>
      <div className="ml-auto h-2 w-24 overflow-hidden rounded-full bg-[#E0ECFF]">
        <div
          className={`h-full rounded-full ${completed ? "bg-[#22C55E]" : "bg-[#CBD5E1]"}`}
          style={{ width: completed ? "80%" : "30%" }}
        />
      </div>
    </div>
  )
}
