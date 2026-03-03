import Image from "next/image"
import { Sparkles } from "lucide-react"

export function HomeFooter() {
  return (
    <div className="mt-5 flex flex-col items-center gap-5 pb-6">
      {/* Motivational message */}
      <div className="card-soft flex w-full items-start gap-2.5 px-4 py-3">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
        <p className="text-xs leading-relaxed text-foreground">
          {"คุณทำได้ดีมาก! วันนี้ลองเพิ่มผัก 1 จาน ได้ไหม?"}
        </p>
      </div>

      {/* Mascot and logo */}
      <div className="flex items-end gap-6">
        <Image
          src="/images/mascot-main.png"
          alt="DeMi+ Mascot"
          width={90}
          height={100}
          className="h-auto w-[90px]"
        />
        <Image
          src="/images/logo-full.png"
          alt="DeMi+ Development for Mind and Health"
          width={140}
          height={70}
          className="h-auto w-[140px]"
        />
      </div>
    </div>
  )
}
