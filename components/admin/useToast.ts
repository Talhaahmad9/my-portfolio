"use client";

import { useState } from "react";

export type ToastType = "success" | "error";

export interface ToastState {
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type: ToastType): void => {
    setToast({ message, type });
  };

  const hideToast = (): void => {
    setToast(null);
  };

  return { toast, showToast, hideToast };
}
