import { ComponentPropsWithoutRef } from "react"
import React from "react"

import { cn } from "@/lib/utils"

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Optional CSS class name to apply custom styles
   */
  className?: string
  /**
   * Whether to reverse the animation direction
   * @default false
   */
  reverse?: boolean
  /**
   * Whether to pause the animation on hover
   * @default false
   */
  pauseOnHover?: boolean
  /**
   * Content to be displayed in the marquee
   */
  children: React.ReactNode
  /**
   * Whether to animate vertically instead of horizontally
   * @default false
   */
  vertical?: boolean
  /**
   * Number of times to repeat the content
   * @default 4
   */
  repeat?: number
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  // duplicate children at least twice to allow the -50% translate technique
  repeat = 2,
  ...props
}: MarqueeProps) {
  const childArray = React.Children.toArray(children)

  // create duplicated array for continuous scroll
  const duplicated: React.ReactNode[] = []
  for (let i = 0; i < repeat; i++) {
    duplicated.push(...childArray)
  }

  return (
    <div
      {...props}
      className={cn(
        /* use the marquee helper so CSS rules apply reliably */
        "marquee group overflow-hidden p-2 [--duration:40s] [--gap:1rem]",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
          vertical: vertical,
          "pause-on-hover": pauseOnHover,
        },
        className
      )}
    >
      <div
        className={cn("marquee-track flex items-center [gap:var(--gap)]", {
          "flex-row": !vertical,
          "flex-col": vertical,
          reverse: reverse,
          // allow CSS-based pause-on-hover as fallback
          "pause-on-hover": pauseOnHover,
        })}
      >
        {duplicated.map((child, i) => (
          <React.Fragment key={i}>{child}</React.Fragment>
        ))}
      </div>
    </div>
  )
}
