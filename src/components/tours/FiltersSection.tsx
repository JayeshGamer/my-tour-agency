"use client";

import { useState, useId } from "react";
import { FilterState } from "@/app/tours/page";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TOUR_TYPES = ["Adventure", "Cultural", "Family", "Wildlife"] as const;
const LOCATIONS = ["Asia", "Africa", "Europe", "North America", "South America", "Oceania"] as const;
const PRICE_RANGES = [
  { id: "under40k", label: "Under ₹40,000" },
  { id: "40to80k", label: "₹40,000 - ₹80,000" },
  { id: "80to150k", label: "₹80,000 - ₹1,50,000" },
  { id: "over150k", label: "Over ₹1,50,000" },
] as const;
const DURATIONS = [
  { id: "1to3", label: "1-3 days" },
  { id: "4to7", label: "4-7 days" },
  { id: "8to14", label: "8-14 days" },
  { id: "over14", label: "14+ days" },
] as const;
const ACTIVITIES = ["Hiking", "Safari", "Cultural Tours", "Beach", "City Tours", "Wildlife"] as const;

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <section className="border-b-2 border-gray-200 dark:border-gray-700 last:border-b-0">
      <button
        className="w-full text-left px-6 py-4 font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-colors flex items-center justify-between group"
        onClick={() => setIsOpen(!isOpen)}
        aria-controls={`section-${id}`}
        aria-expanded={isOpen}
      >
        <span className="text-base">{title}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
        )}
      </button>
      {isOpen && (
        <div id={`section-${id}`} className="px-6 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </section>
  );
}

function CheckboxItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group py-1">
      <div className="relative">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={onChange}
          aria-label={`Filter by ${label}`}
        />
        <div className="h-5 w-5 rounded-md border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 peer-checked:bg-gray-900 dark:peer-checked:bg-white peer-checked:border-gray-900 dark:peer-checked:border-white transition-all peer-focus:ring-2 peer-focus:ring-gray-900 dark:peer-focus:ring-white peer-focus:ring-offset-2">
          <svg
            className={`absolute inset-0 m-auto h-3 w-3 text-white dark:text-gray-900 transition-opacity ${
              checked ? "opacity-100" : "opacity-0"
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
        {label}
      </span>
    </label>
  );
}

export function FiltersSection({
  filters,
  onFilterChange,
  onClearAll,
}: {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClearAll: () => void;
}) {
  const handleCheckbox = (key: keyof FilterState, value: string) => {
    const set = new Set(filters[key]);
    if (set.has(value)) {
      set.delete(value);
    } else {
      set.add(value);
    }
    onFilterChange({ ...filters, [key]: Array.from(set) });
  };

  const activeFiltersCount = Object.values(filters).flat().length;

  return (
    <div className="divide-y-2 divide-gray-200 dark:divide-gray-700">
      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="p-6 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Active Filters ({activeFiltersCount})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="h-8 px-3 text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, values]) =>
              values.map((value: string) => (
                <Badge
                  key={`${key}-${value}`}
                  className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 cursor-pointer pl-2 pr-1 py-1 text-xs font-medium"
                  onClick={() => handleCheckbox(key as keyof FilterState, value)}
                >
                  {value}
                  <X className="h-3 w-3 ml-1 inline" />
                </Badge>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tour Type Filter */}
      <Section title="Tour Type">
        <div className="space-y-2">
          {TOUR_TYPES.map((t) => (
            <CheckboxItem
              key={t}
              label={t}
              checked={filters.tourType.includes(t)}
              onChange={() => handleCheckbox("tourType", t)}
            />
          ))}
        </div>
      </Section>

      {/* Location Filter */}
      <Section title="Location">
        <div className="space-y-2">
          {LOCATIONS.map((l) => (
            <CheckboxItem
              key={l}
              label={l}
              checked={filters.location.includes(l)}
              onChange={() => handleCheckbox("location", l)}
            />
          ))}
        </div>
      </Section>

      {/* Price Range Filter */}
      <Section title="Price Range">
        <div className="space-y-2">
          {PRICE_RANGES.map((p) => (
            <CheckboxItem
              key={p.id}
              label={p.label}
              checked={filters.priceRange.includes(p.id)}
              onChange={() => handleCheckbox("priceRange", p.id)}
            />
          ))}
        </div>
      </Section>

      {/* Duration Filter */}
      <Section title="Duration">
        <div className="space-y-2">
          {DURATIONS.map((d) => (
            <CheckboxItem
              key={d.id}
              label={d.label}
              checked={filters.duration.includes(d.id)}
              onChange={() => handleCheckbox("duration", d.id)}
            />
          ))}
        </div>
      </Section>

      {/* Activities Filter */}
      <Section title="Activities">
        <div className="space-y-2">
          {ACTIVITIES.map((a) => (
            <CheckboxItem
              key={a}
              label={a}
              checked={filters.activities.includes(a)}
              onChange={() => handleCheckbox("activities", a)}
            />
          ))}
        </div>
      </Section>

      {/* Clear All Button at Bottom */}
      <div className="p-6">
        <Button
          onClick={onClearAll}
          variant="outline"
          className="w-full h-11 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 font-bold rounded-xl"
          disabled={activeFiltersCount === 0}
        >
          <X className="h-5 w-5 mr-2" />
          Reset All Filters
        </Button>
      </div>
    </div>
  );
}
