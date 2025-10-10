import React from "react";
import { RainbowButton } from "@/components/ui/rainbow-button";

export function RainbowButtonDemo() {
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center gap-3">
        <RainbowButton variant="white">White Variant</RainbowButton>
        <RainbowButton variant="black">Black Variant</RainbowButton>
      </div>
      <div className="flex items-center gap-3">
        <RainbowButton variant="green">Green Variant</RainbowButton>
        <RainbowButton variant="red">Red Variant</RainbowButton>
      </div>
    </div>
  );
}

export default RainbowButtonDemo;
