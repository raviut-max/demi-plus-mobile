type HomeHeaderProps = {
  user: {
    name: string
    pamLevel: string
    pamLabel: string
  }
}

export function HomeHeader({ user }: HomeHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* Running figure icon */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          className="shrink-0 text-[#3B82F6]"
          aria-hidden="true"
        >
          <circle cx="14" cy="4" r="2" fill="currentColor" />
          <path
            d="M7 22l2-8 3 2v6h2v-7.5l-3-2.5 1-3.5c1.5 1.5 3.5 2.5 6 2.5v-2c-2 0-3.5-1-4.5-2l-1.5-2c-.5-.5-1-1-2-1s-1 0-1.5.5L4 10v4h2V11l2-2-1.5 6L7 22z"
            fill="currentColor"
          />
        </svg>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-foreground">
              {user.name}
            </span>
            <span className="text-sm text-muted-foreground">|</span>
            <span className="text-xs text-muted-foreground">
              {"นักกีฬาเบาหวาน"} {user.pamLevel}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            ({user.pamLabel})
          </span>
        </div>
      </div>
      {/* Elderly man avatar - matching mockup */}
      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#DBEAFE] ring-2 ring-[#FFFFFF]">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          aria-hidden="true"
        >
          {/* Head */}
          <circle cx="20" cy="14" r="8" fill="#F5D0A9" />
          {/* Hair / headband */}
          <path d="M12 12 Q16 6 20 6 Q24 6 28 12" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
          <line x1="12" y1="11" x2="28" y2="11" stroke="#EF4444" strokeWidth="1.5" />
          {/* Eyes */}
          <circle cx="17" cy="14" r="1" fill="#1E3A5F" />
          <circle cx="23" cy="14" r="1" fill="#1E3A5F" />
          {/* Smile */}
          <path d="M17 17 Q20 20 23 17" stroke="#1E3A5F" strokeWidth="1" fill="none" />
          {/* Body */}
          <rect x="15" y="22" width="10" height="12" rx="3" fill="#3B82F6" />
        </svg>
      </div>
    </div>
  )
}
