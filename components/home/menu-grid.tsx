"use client"

import Link from "next/link"
import { ClipboardList, BarChart3, Target, BookOpen } from "lucide-react"

const menuItems = [
  {
    href: "/record",
    label: "บันทึกรายวัน",
    sublabel: "ทำตามกฎทอง 5 ข้อ",
    icon: ClipboardList,
    iconBg: "bg-[#FEF9C3]",
    iconColor: "text-[#CA8A04]",
  },
  {
    href: "/progress",
    label: "ดูความคืบหน้า",
    sublabel: "ผลลัพธ์ 7 วันล่าสุด",
    icon: BarChart3,
    iconBg: "bg-[#DBEAFE]",
    iconColor: "text-[#3B82F6]",
  },
  {
    href: "/goals",
    label: "เป้าหมายของฉัน",
    sublabel: "สัปดาห์นี้ & ระยะยาว",
    icon: Target,
    iconBg: "bg-[#DCFCE7]",
    iconColor: "text-[#16A34A]",
  },
  {
    href: "/knowledge",
    label: "ความรู้สำหรับนักกีฬา",
    sublabel: "เคล็ดลับง่ายๆ ทุกวัน",
    icon: BookOpen,
    iconBg: "bg-[#E0E7FF]",
    iconColor: "text-[#6366F1]",
  },
]

export function MenuGrid() {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3">
      {menuItems.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className="card-soft flex flex-col items-center gap-2 px-3 py-5 text-center transition-all active:scale-95 hover:shadow-md"
          >
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.iconBg}`}
            >
              <Icon className={`h-7 w-7 ${item.iconColor}`} />
            </div>
            <span className="text-sm font-bold leading-tight text-foreground">
              {item.label}
            </span>
            <span className="text-[11px] leading-tight text-muted-foreground">
              {item.sublabel}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
