"use client";

import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ViewMode = "grid" | "list" | "bento";

interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 border-2 border-gray-200 dark:border-gray-700">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewChange("grid")}
              className={cn(
                "h-9 w-9 p-0 rounded-lg transition-all duration-200",
                view === "grid"
                  ? "bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Grid View</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewChange("list")}
              className={cn(
                "h-9 w-9 p-0 rounded-lg transition-all duration-200",
                view === "list"
                  ? "bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <List className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>List View</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewChange("bento")}
              className={cn(
                "h-9 px-3 rounded-lg transition-all duration-200 text-xs font-semibold",
                view === "bento"
                  ? "bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              Bento
            </Button>
          </TooltipTrigger>
          <TooltipContent>Bento Grid View</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

