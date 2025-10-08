"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = "md",
  showValue = true,
  interactive = false,
  onRatingChange,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const fillPercentage = interactive
            ? hoverRating >= starValue
              ? 100
              : hoverRating > index && hoverRating < starValue
              ? (hoverRating - index) * 100
              : rating >= starValue
              ? 100
              : rating > index && rating < starValue
              ? (rating - index) * 100
              : 0
            : rating >= starValue
            ? 100
            : rating > index && rating < starValue
            ? (rating - index) * 100
            : 0;

          return (
            <div
              key={index}
              className={cn(
                "relative",
                interactive && "cursor-pointer"
              )}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              onClick={() => handleClick(starValue)}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "text-gray-300 dark:text-gray-600"
                )}
              />
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercentage}%` }}
              >
                <Star
                  className={cn(
                    sizeClasses[size],
                    "text-yellow-500 fill-yellow-500"
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

