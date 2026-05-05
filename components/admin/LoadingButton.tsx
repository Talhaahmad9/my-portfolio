import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface LoadingButtonProps {
  onClick: () => void;
  loading: boolean;
  children: ReactNode;
  loadingText?: string;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

export default function LoadingButton({
  onClick,
  loading,
  children,
  loadingText,
  className,
  type = "button",
  disabled = false,
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      aria-busy={loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {loading ? loadingText ?? children : children}
    </button>
  );
}
