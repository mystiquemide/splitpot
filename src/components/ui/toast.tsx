"use client"
import { createContext, useContext, useState, useCallback } from "react"

interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info"
}

const ToastContext = createContext<{
  toasts: Toast[]
  toast: (message: string, type?: Toast["type"]) => void
}>({ toasts: [], toast: () => {} })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const add = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast: add }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`border-2 border-black px-4 py-3 text-xs font-mono uppercase tracking-wider shadow-[3px_3px_0_0_#0a0a0a] ${
              t.type === "error"
                ? "bg-black text-white"
                : t.type === "success"
                  ? "bg-white text-black"
                  : "bg-neutral-100 text-black"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
