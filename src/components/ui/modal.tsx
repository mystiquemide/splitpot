"use client"
import { useEffect } from "react"
import { X } from "lucide-react"

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg border-2 border-black bg-white p-6 shadow-[6px_6px_0_0_#0a0a0a]">
        <div className="flex items-start justify-between gap-4 mb-5 border-b-2 border-black pb-3">
          {title && (
            <h2 className="font-display text-2xl leading-tight text-black pr-4">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="border-2 border-black p-1 text-black hover:bg-black hover:text-white shrink-0"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
