import * as React from "react"

export interface ToastProps {
  id: string
  className?: string
  title?: string
  description?: string
  action?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export interface ToastActionElement {
  altText?: string
  onClick: () => void
  children: React.ReactNode
}