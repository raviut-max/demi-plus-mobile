import { MobileShell } from "@/components/mobile-shell"

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <MobileShell>{children}</MobileShell>
}
