"use client";

import * as React from "react";
import { Chip } from "@/components/ui/chip";
import { MapPin, Clock, DollarSign, Activity, TrendingUp, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuickFilter {
  id: string;
  label: string;
  category: string;
  value: string;
  icon?: React.ReactNode;
}

interface QuickFilterChipsProps {
  onFilterSelect: (category: string, value: string) => void;
  activeFilters: { category: string; value: string }[];
  onFilterRemove: (category: string, value: string) => void;
}

const quickFilters: QuickFilter[] = [
  { id: "1", label: "Popular", category: "sort", value: "popular", icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { id: "2", label: "Featured", category: "sort", value: "featured", icon: <Sparkles className="h-3.5 w-3.5" /> },
  { id: "3", label: "Under $500", category: "priceRange", value: "under500", icon: <DollarSign className="h-3.5 w-3.5" /> },
  { id: "4", label: "$500 - $1000", category: "priceRange", value: "500to1000", icon: <DollarSign className="h-3.5 w-3.5" /> },
  { id: "5", label: "1-3 Days", category: "duration", value: "1-3", icon: <Clock className="h-3.5 w-3.5" /> },
  { id: "6", label: "4-7 Days", category: "duration", value: "4-7", icon: <Clock className="h-3.5 w-3.5" /> },
  { id: "7", label: "Adventure", category: "activities", value: "adventure", icon: <Activity className="h-3.5 w-3.5" /> },
  { id: "8", label: "Europe", category: "location", value: "Europe", icon: <MapPin className="h-3.5 w-3.5" /> },
  { id: "9", label: "Asia", category: "location", value: "Asia", icon: <MapPin className="h-3.5 w-3.5" /> },
];

export function QuickFilterChips({
  onFilterSelect,
  activeFilters,
  onFilterRemove,
}: QuickFilterChipsProps) {
  const isActive = (category: string, value: string) => {
    return activeFilters.some(
      (filter) => filter.category === category && filter.value === value
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-5 shadow-lg">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-purple-500" />
        Quick Filters
      </h3>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {quickFilters.map((filter) => {
            const active = isActive(filter.category, filter.value);
            return (
              <motion.div
                key={filter.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Chip
                  label={filter.label}
                  icon={filter.icon}
                  variant={active ? "primary" : "default"}
                  onRemove={
                    active
                      ? () => onFilterRemove(filter.category, filter.value)
                      : undefined
                  }
                  onClick={() => {
                    if (!active) {
                      onFilterSelect(filter.category, filter.value);
                    }
                  }}
                  className="cursor-pointer hover:scale-105 transition-transform"
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

