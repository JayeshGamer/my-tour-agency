"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Globe, Filter, X } from "lucide-react";
import { format } from "date-fns";

export default function DashboardFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [country, setCountry] = useState(searchParams.get("country") || "");
  const [dateFrom, setDateFrom] = useState(searchParams.get("from") || "");
  const [dateTo, setDateTo] = useState(searchParams.get("to") || "");

  const countries = [
    { value: "all", label: "All Countries" },
    { value: "USA", label: "United States" },
    { value: "UK", label: "United Kingdom" },
    { value: "FR", label: "France" },
    { value: "DE", label: "Germany" },
    { value: "ES", label: "Spain" },
    { value: "IT", label: "Italy" },
    { value: "JP", label: "Japan" },
    { value: "AU", label: "Australia" },
    { value: "CA", label: "Canada" },
  ];

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (country && country !== "all") {
      params.set("country", country);
    }
    if (dateFrom) {
      params.set("from", dateFrom);
    }
    if (dateTo) {
      params.set("to", dateTo);
    }

    const queryString = params.toString();
    router.push(`/admin/dashboard${queryString ? `?${queryString}` : ""}`);
  };

  const clearFilters = () => {
    setCountry("");
    setDateFrom("");
    setDateTo("");
    router.push("/admin/dashboard");
  };

  const hasActiveFilters = country || dateFrom || dateTo;

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Country Filter */}
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Country
              </Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Date Range
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="From"
                  className="h-9"
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="To"
                  className="h-9"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={applyFilters}
            size="sm"
            className="w-full"
            disabled={!country && !dateFrom && !dateTo}
          >
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
