import { BottomNav } from "./bottom-nav";

export function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-16">
      {children}
      <BottomNav />
    </div>
  );
}