"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  onRemove?: () => void;
  variant?: "default" | "primary" | "secondary";
  icon?: React.ReactNode;
}

const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ className, label, onRemove, variant = "default", icon, ...props }, ref) => {
    const variantStyles = {
      default: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700",
      primary: "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-800",
      secondary: "bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 border-purple-200 dark:border-purple-800",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all duration-200 hover:shadow-md",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {icon && <span className="flex items-center">{icon}</span>}
        <span>{label}</span>
        {onRemove && (
          <button
            onClick={onRemove}
            className="flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
            aria-label={`Remove ${label}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }
);
Chip.displayName = "Chip";

export { Chip };

