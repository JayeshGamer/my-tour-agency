// Barrel export for UI components.
// Added to ensure `RainbowButton` is discoverable via `@/components/ui`
// NOTE: This file only exports the RainbowButton per request and does not modify any other files.

export { RainbowButton } from "./rainbow-button";
export type { RainbowButtonProps } from "./rainbow-button";
export { RainbowButtonDemo } from "./rainbow-button-demo";

// Export the animated theme toggler so it can be imported from `@/components/ui`
export { AnimatedThemeToggler } from "./animated-theme-toggler";
export type { AnimatedThemeTogglerProps } from "./animated-theme-toggler";
