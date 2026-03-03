import { ShieldCheck } from "lucide-react"

type ZoneBadgeProps = {
  zone: string
}

export function ZoneBadge({ zone }: ZoneBadgeProps) {
  const isGreen = zone.toLowerCase().includes("green")

  return (
    <div className="mt-5 flex flex-col items-center gap-1">
      <div
        className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 shadow-sm ${
          isGreen
            ? "border-[#BBF7D0] bg-[#DCFCE7] text-[#16A34A]"
            : "border-[#FECACA] bg-[#FEE2E2] text-[#EF4444]"
        }`}
      >
        <ShieldCheck className="h-5 w-5" />
        <span className="text-base font-bold">{zone}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        {isGreen ? "สุขภาพดี ควบคุมได้ดีมาก!" : "ต้องระวังสุขภาพเพิ่มเติม"}
      </p>
    </div>
  )
}
