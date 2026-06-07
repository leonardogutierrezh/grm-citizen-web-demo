'use client'

import React, {useEffect, useState} from 'react'

// Renders the app inside a realistic phone shell on desktop, and full-screen
// on actual mobile devices.
export function PhoneFrame({children}: {children: React.ReactNode}) {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      )
    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-0 sm:p-6">
      {/* Phone device */}
      <div className="relative h-[100dvh] w-full overflow-hidden bg-white sm:h-[860px] sm:max-h-[92vh] sm:w-[400px] sm:rounded-[3rem] sm:border-[10px] sm:border-black sm:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)]">
        {/* Notch (desktop only) */}
        <div className="pointer-events-none absolute left-1/2 top-0 z-30 hidden h-7 w-40 -translate-x-1/2 rounded-b-2xl bg-black sm:block" />

        {/* Status bar */}
        <div className="relative z-20 flex items-center justify-between bg-white px-6 pb-1 pt-2 text-[13px] font-semibold text-black sm:pt-3">
          <span className="tabular-nums">{time || '9:41'}</span>
          <div className="flex items-center gap-1.5">
            {/* signal */}
            <svg width="18" height="12" viewBox="0 0 18 12" fill="black">
              <rect x="0" y="8" width="3" height="4" rx="1" />
              <rect x="5" y="5" width="3" height="7" rx="1" />
              <rect x="10" y="2" width="3" height="10" rx="1" />
              <rect x="15" y="0" width="3" height="12" rx="1" opacity="0.35" />
            </svg>
            {/* wifi */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="black">
              <path d="M8 11.5l2-2.5a3 3 0 00-4 0l2 2.5z" />
              <path d="M8 6a6 6 0 014.2 1.7l1.3-1.4A8 8 0 008 4a8 8 0 00-5.5 2.3l1.3 1.4A6 6 0 018 6z" />
            </svg>
            {/* battery */}
            <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
              <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="black" opacity="0.5" />
              <rect x="2" y="2" width="16" height="8" rx="1.5" fill="black" />
              <rect x="23" y="3.5" width="2" height="5" rx="1" fill="black" opacity="0.5" />
            </svg>
          </div>
        </div>

        {/* App viewport */}
        <div className="relative h-[calc(100%-28px)] w-full overflow-hidden bg-[#f8fafc] sm:h-[calc(100%-32px)]">
          {children}
        </div>
      </div>
    </div>
  )
}
