"use client"

import React from "react";

export interface AnimatedThemeTogglerProps
  extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number;
}

// Minimal no-op theme toggler: renders nothing and performs no DOM access.
// Keeps the same named export and prop type so other imports don't break.
export const AnimatedThemeToggler: React.FC<AnimatedThemeTogglerProps> = () => {
  return null
}

export default AnimatedThemeToggler
