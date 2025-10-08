// Example usage of Magic UI components for reference

import { AnimatedList } from "@/components/ui/animated-list"
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"
import { Marquee } from "@/components/ui/marquee"

// Example 1: Animated List with notifications
export function AnimatedListExample() {
  return (
    <AnimatedList delay={2000}>
      <div className="p-4 bg-card rounded-lg border">Notification 1</div>
      <div className="p-4 bg-card rounded-lg border">Notification 2</div>
      <div className="p-4 bg-card rounded-lg border">Notification 3</div>
    </AnimatedList>
  )
}

// Example 2: Bento Grid for features
export function BentoGridExample() {
  return (
    <BentoGrid>
      <BentoCard
        name="Secure Booking"
        className="col-span-3 lg:col-span-1"
        background={<div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 opacity-20" />}
        Icon={Shield}
        description="Book your tours with confidence"
        href="/tours"
        cta="Learn more"
      />
    </BentoGrid>
  )
}

// Example 3: Marquee with tour destinations
export function MarqueeExample() {
  return (
    <Marquee pauseOnHover>
      <span className="mx-4">Paris</span>
      <span className="mx-4">Tokyo</span>
      <span className="mx-4">New York</span>
      <span className="mx-4">London</span>
    </Marquee>
  )
}

