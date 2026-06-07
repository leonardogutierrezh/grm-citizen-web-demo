'use client'

import {useState} from 'react'
import {ChevronDown, Check} from 'lucide-react'

export type Option = {id: number | string; name: string}

export function Dropdown({
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled,
}: {
  label?: string
  placeholder: string
  options: Option[]
  value?: Option | null
  onChange: (o: Option) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-4">
      {label && (
        <p className="mb-2 text-base font-bold text-[#4A4A4A]">{label}</p>
      )}
      <button
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between rounded-[10px] border border-[#dedede] bg-white px-4 py-3 text-left disabled:opacity-50"
      >
        <span className={value ? 'text-[#4A4A4A]' : 'text-[#707070]'}>
          {value?.name || placeholder}
        </span>
        <ChevronDown size={20} color="#707070" />
      </button>

      {open && (
        <div
          className="absolute inset-0 z-40 flex items-end bg-black/40 animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[70%] w-full overflow-y-auto rounded-t-2xl bg-white p-2 no-scrollbar"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white px-3 py-2 text-sm font-semibold text-[#707070]">
              {placeholder}
            </div>
            {options.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-[#9ca3af]">—</p>
            )}
            {options.map(o => (
              <button
                key={o.id}
                onClick={() => {
                  onChange(o)
                  setOpen(false)
                }}
                className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-[#1f2937] active:bg-gray-100"
              >
                {o.name}
                {value?.id === o.id && <Check size={18} color="#24c38b" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
