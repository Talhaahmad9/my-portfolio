"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import type { ToastState } from "@/components/admin/useToast";

interface ToastProps {
  toast: ToastState;
  onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const inTimer = window.setTimeout(() => setIsVisible(true), 20);
    const hideTimer = window.setTimeout(() => setIsVisible(false), 3000);
    const closeTimer = window.setTimeout(onClose, 3250);

    return () => {
      window.clearTimeout(inTimer);
      window.clearTimeout(hideTimer);
      window.clearTimeout(closeTimer);
    };
  }, [onClose, toast]);

  const isSuccess = toast.type === "success";

  return (
    <div
      className={`fixed bottom-5 right-5 z-100 w-[calc(100%-2.5rem)] max-w-sm rounded-md border-l-4 bg-oxfordBlue p-4 shadow-2xl transition-all duration-200 ${
        isSuccess ? "border-l-green-500" : "border-l-red-500"
      } ${isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {isSuccess ? (
          <CheckCircle className="mt-0.5 h-5 w-5 text-green-400" aria-hidden="true" />
        ) : (
          <XCircle className="mt-0.5 h-5 w-5 text-red-400" aria-hidden="true" />
        )}

        <div>
          <p className="text-sm font-semibold text-white">{isSuccess ? "Success" : "Error"}</p>
          <p className="mt-1 text-sm text-platinum">{toast.message}</p>
        </div>
      </div>
    </div>
  );
}
