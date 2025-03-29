"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
  ToastAction,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed top-0 z-[100] flex flex-col gap-2 max-h-screen w-full p-4 md:bottom-0 md:right-0 md:top-auto md:flex-col-reverse md:max-w-[420px]">
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
    </div>
  )
} 