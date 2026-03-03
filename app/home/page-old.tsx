import { mockUser } from "@/lib/mock-data"
import { HomeHeader } from "@/components/home/home-header"
import { ZoneBadge } from "@/components/home/zone-badge"
import { MenuGrid } from "@/components/home/menu-grid"
import { AppointmentBanner } from "@/components/home/appointment-banner"
import { HomeFooter } from "@/components/home/home-footer"
import { StarBackground } from "@/components/star-background"

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <StarBackground />
      <div className="relative z-10 px-4 pt-6 pb-4">
        <HomeHeader user={mockUser} />
        <ZoneBadge zone={mockUser.promsZone} />
        <MenuGrid />
        <AppointmentBanner date={mockUser.nextAppointment} coachName="สมชาย" />
        <HomeFooter />
      </div>
    </div>
  )
}
