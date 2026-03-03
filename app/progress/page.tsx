import { Trophy, User, Utensils, Dumbbell, Moon, CheckCircle2, AlertTriangle } from "lucide-react"
import { mockProgress } from "@/lib/mock-data"
import { StarBackground } from "@/components/star-background"
import Image from "next/image"

function StatusBadge({ status }: { status: string }) {
  if (status === "excellent") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2 py-0.5 text-xs font-semibold text-[#16A34A]">
        ยอดเยี่ยม!
      </span>
    )
  }
  if (status === "good") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#DBEAFE] px-2 py-0.5 text-xs font-semibold text-[#3B82F6]">
        ดี
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF9C3] px-2 py-0.5 text-xs font-semibold text-[#CA8A04]">
      <AlertTriangle className="h-3 w-3" />
      ต้องปรับปรุง
    </span>
  )
}

function ProgressBar({ percentage }: { percentage: number }) {
  const color =
    percentage >= 80
      ? "bg-[#22C55E]"
      : percentage >= 50
        ? "bg-[#3B82F6]"
        : "bg-[#F59E0B]"

  return (
    <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-[#E0ECFF]">
      <div
        className={`h-full rounded-full ${color} transition-all duration-500`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

export default function ProgressPage() {
  const foodProgress = mockProgress.filter((p) => p.category === "food")
  const exerciseProgress = mockProgress.filter((p) => p.category === "exercise")
  const sleepProgress = mockProgress.filter((p) => p.category === "sleep")

  return (
    <div className="relative">
      <StarBackground />
      <div className="relative z-10 px-4 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-[#CA8A04]" />
            <h1 className="text-lg font-bold text-foreground">
              แดชบอร์ดนักกีฬา Champion
            </h1>
          </div>
          <div className="h-12 w-12 overflow-hidden rounded-full bg-[#DBEAFE]">
            <div className="flex h-full w-full items-center justify-center">
              <User className="h-6 w-6 text-[#3B82F6]" />
            </div>
          </div>
        </div>

        {/* Food Section */}
        <div className="mt-4 card-soft overflow-hidden">
          <div className="flex items-center gap-2 bg-[#F0FDF4] px-4 py-3">
            <Utensils className="h-5 w-5 text-[#22C55E]" />
            <span className="font-bold text-foreground">อาหาร</span>
          </div>
          <div className="divide-y divide-border px-4">
            {foodProgress.map((item) => (
              <div key={item.id} className="py-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                    <span className="text-sm font-semibold text-foreground">
                      {item.label}
                    </span>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="ml-6 mt-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {item.daysCompleted}/{item.totalDays} วัน - {item.percentage}%
                    </span>
                  </div>
                  <ProgressBar percentage={item.percentage} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exercise Section */}
        <div className="mt-4 card-soft overflow-hidden">
          <div className="flex items-center gap-2 bg-[#EFF6FF] px-4 py-3">
            <Dumbbell className="h-5 w-5 text-[#3B82F6]" />
            <span className="font-bold text-foreground">ออกกำลังกาย</span>
          </div>
          <div className="divide-y divide-border px-4">
            {exerciseProgress.map((item) => (
              <div key={item.id} className="py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {item.daysCompleted}/{item.totalDays} วัน - {item.percentage}%
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
                <ProgressBar percentage={item.percentage} />
              </div>
            ))}
          </div>
        </div>

        {/* Sleep Section */}
        <div className="mt-4 card-soft overflow-hidden">
          <div className="flex items-center justify-between bg-[#EDE9FE] px-4 py-3">
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-[#7C3AED]" />
              <span className="font-bold text-foreground">นอนหลับเพียงพอ</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {sleepProgress[0]?.daysCompleted}/{sleepProgress[0]?.totalDays} วัน - {sleepProgress[0]?.percentage}%
              </span>
              <StatusBadge status={sleepProgress[0]?.status ?? "good"} />
            </div>
          </div>
        </div>

        {/* Mascot Tip */}
        <div className="mt-6 flex items-end gap-3 pb-6">
          <Image
            src="/images/mascot-main.png"
            alt="DeMi+ Mascot"
            width={70}
            height={80}
            className="h-auto w-16"
          />
          <div className="card-soft flex-1 px-4 py-3">
            <p className="text-sm text-foreground">
              พยายามต่อไป! ลอง <span className="font-bold text-[#3B82F6]">Stretching</span>{" "}
              เพิ่มลักหน่อยไหม?
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
