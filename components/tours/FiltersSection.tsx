"use client";

import { useId } from "react";
import { FilterState } from "@/app/tours/page";
import { Button } from "@/components/ui/button";

const TOUR_TYPES = ["Adventure", "Cultural", "Family", "Wildlife"] as const;
const LOCATIONS = ["Asia", "Africa", "Europe", "North America", "South America", "Oceania"] as const;
const PRICE_RANGES = [
  { id: "under500", label: "Under $500" },
  { id: "500to1000", label: "$500 - $1,000" },
  { id: "1000to2000", label: "$1,000 - $2,000" },
  { id: "over2000", label: "Over $2,000" },
] as const;
const DURATIONS = [
  { id: "1to3", label: "1-3 days" },
  { id: "4to7", label: "4-7 days" },
  { id: "8to14", label: "8-14 days" },
  { id: "over14", label: "14+ days" },
] as const;
const ACTIVITIES = ["Hiking", "Safari", "Cultural Tours", "Beach", "City Tours", "Wildlife"] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <section className="border-b border-gray-200">
      <button
        className="w-full text-left px-4 py-3 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-controls={`section-${id}`}
        aria-expanded="true"
      >
        {title}
      </button>
      <div id={`section-${id}`} className="px-4 pb-4 space-y-2">
        {children}
      </div>
    </section>
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
    set.has(value) ? set.delete(value) : set.add(value);
    onFilterChange({ ...filters, [key]: Array.from(set) });
  };

  return (
    <div className="divide-y divide-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm text-gray-500">Select filters</h3>
        <Button variant="ghost" size="sm" onClick={onClearAll} aria-label="Clear all filters">
          Clear all
        </Button>
      </div>

      <Section title="Tour Type">
        <div className="space-y-2">
          {TOUR_TYPES.map((t) => (
            <label key={t} className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={filters.tourType.includes(t)}
                onChange={() => handleCheckbox("tourType", t)}
                aria-label={`Filter by tour type ${t}`}
              />
              <span>{t}</span>
            </label>
          ))}
        </div>
      </Section>

      <Section title="Location">
        <div className="space-y-2">
          {LOCATIONS.map((l) => (
            <label key={l} className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={filters.location.includes(l)}
                onChange={() => handleCheckbox("location", l)}
                aria-label={`Filter by location ${l}`}
              />
              <span>{l}</span>
            </label>
          ))}
        </div>
      </Section>

      <Section title="Price Range">
        <div className="space-y-2">
          {PRICE_RANGES.map((p) => (
            <label key={p.id} className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={filters.priceRange.includes(p.id)}
                onChange={() => handleCheckbox("priceRange", p.id)}
                aria-label={`Filter by price ${p.label}`}
              />
              <span>{p.label}</span>
            </label>
          ))}
        </div>
      </Section>

      <Section title="Duration">
        <div className="space-y-2">
          {DURATIONS.map((d) => (
            <label key={d.id} className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={filters.duration.includes(d.id)}
                onChange={() => handleCheckbox("duration", d.id)}
                aria-label={`Filter by duration ${d.label}`}
              />
              <span>{d.label}</span>
            </label>
          ))}
        </div>
      </Section>

      <Section title="Activities">
        <div className="space-y-2">
          {ACTIVITIES.map((a) => (
            <label key={a} className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={filters.activities.includes(a)}
                onChange={() => handleCheckbox("activities", a)}
                aria-label={`Filter by activity ${a}`}
              />
              <span>{a}</span>
            </label>
          ))}
        </div>
      </Section>
    </div>
  );
}

