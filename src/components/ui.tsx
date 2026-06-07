'use client'

import React from 'react'
import {Loader2} from 'lucide-react'

export function Spinner({color = '#24c38b', size = 28}: {color?: string; size?: number}) {
  return <Loader2 className="spinner" size={size} color={color} />
}

export function FullScreenLoader() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
      <Spinner color="#24c38b" />
    </div>
  )
}

type ButtonProps = {
  label: string
  onClick?: () => void
  backgroundColor?: string
  textColor?: string
  disabled?: boolean
  icon?: React.ReactNode
  outline?: boolean
  className?: string
  type?: 'button' | 'submit'
  fullWidth?: boolean
}

export function CustomButton({
  label,
  onClick,
  backgroundColor = '#24c38b',
  textColor = 'white',
  disabled,
  icon,
  outline,
  className = '',
  type = 'button',
  fullWidth = true,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`my-2 flex ${fullWidth ? 'w-full' : ''} items-center justify-center gap-2 rounded-[10px] px-4 py-3.5 text-base font-semibold transition active:scale-[0.98] disabled:opacity-50 ${className}`}
      style={
        outline
          ? {
              backgroundColor: 'transparent',
              color: backgroundColor,
              border: `1.5px solid ${backgroundColor}`,
            }
          : {backgroundColor, color: textColor}
      }
    >
      {icon}
      {label}
    </button>
  )
}

type InputProps = {
  label?: string
  optional?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  error?: string
  secure?: boolean
  onToggleSecure?: () => void
  rightIcon?: React.ReactNode
}

export function Field({
  label,
  optional,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  rightIcon,
}: InputProps) {
  return (
    <div className="mb-4">
      {label && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-base font-bold text-[#4A4A4A]">{label}</span>
          {optional && <span className="text-sm text-[#707070]">{optional}</span>}
        </div>
      )}
      <div className="relative">
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          type={type}
          className="w-full rounded-[10px] border border-[#dedede] bg-white px-4 py-3 text-[#4A4A4A] outline-none transition focus:border-[#24c38b]"
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-3 flex items-center">{rightIcon}</div>
        )}
      </div>
      {error && <span className="mt-1 block text-sm text-[#ef6a78]">{error}</span>}
    </div>
  )
}

export function Header({
  title,
  onBack,
  right,
}: {
  title: string
  onBack?: () => void
  right?: React.ReactNode
}) {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3.5">
      {onBack && (
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#4A4A4A] active:bg-gray-100"
          aria-label="Back"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
      )}
      <h1 className="flex-1 text-lg font-bold text-[#1f2937]">{title}</h1>
      {right}
    </div>
  )
}
