"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export function Switch({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  className,
  ...props
}: SwitchProps) {
  const [internalChecked, setInternalChecked] = React.useState(!!defaultChecked);
  const isControlled = typeof checked === "boolean";
  const isOn = isControlled ? !!checked : internalChecked;

  const toggle = () => {
    if (disabled) return;
    const next = !isOn;
    if (!isControlled) setInternalChecked(next);
    onCheckedChange?.(next);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-disabled={disabled || undefined}
      onClick={toggle}
      className={cn(
        "inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        isOn ? "bg-primary" : "bg-gray-300",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
          isOn ? "translate-x-5" : "translate-x-1"
        )}
      />
    </button>
  );
}

export default Switch;

