import { CalendarDays } from "lucide-react"

type AppointmentBannerProps = {
  date: string
  coachName: string
}

export function AppointmentBanner({ date, coachName }: AppointmentBannerProps) {
  return (
    <div className="card-soft mt-5 flex items-center gap-3 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DCFCE7]">
        <CalendarDays className="h-5 w-5 text-[#16A34A]" />
      </div>
      <p className="text-xs leading-relaxed text-foreground">
        <span className="font-semibold">{"นัดพบโค้ช"}{coachName}</span>
        <span className="mx-1.5 text-muted-foreground">|</span>
        <span className="text-muted-foreground">{date}</span>
      </p>
    </div>
  )
}
