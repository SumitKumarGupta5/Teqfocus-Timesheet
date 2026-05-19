import React from 'react'

interface TeqfocusLogoProps {
  className?: string
}

export function TeqfocusLogo({ className }: TeqfocusLogoProps) {
  return (
    <div className={`flex items-center select-none ${className ?? ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/teqfocus-logo-rect.png"
        alt="Teqfocus Consulting LLC"
        className="h-12 w-auto object-contain py-0.5"
      />
    </div>
  )
}

