"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "../../src/components/ui/button";
import { Input } from "../../src/components/ui/input";
import { Label } from "../../src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "../../src/components/ui/sheet";
import { Slider } from "../../src/components/ui/slider";
import { Separator } from "../../src/components/ui/separator";

interface FilterState {
  searchTerm?: string;
  priceRange?: number[];
  duration?: string;
  difficulty?: string;
  location?: string;
}

interface SearchFilterProps {
  onFilterChange: (filters: FilterState) => void;
}

export default function SearchFilter({ onFilterChange }: SearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [duration, setDuration] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [location, setLocation] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = () => {
    onFilterChange({
      searchTerm,
      priceRange,
      duration,
      difficulty,
      location,
    });
  };

  const handleReset = () => {
    setSearchTerm("");
    setPriceRange([0, 5000]);
    setDuration("");
    setDifficulty("");
    setLocation("");
    onFilterChange({});
  };

  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search tours..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
        
        {/* Mobile Filter Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Refine your tour search
              </SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-6">
              <FilterContent
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                duration={duration}
                setDuration={setDuration}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                location={location}
                setLocation={setLocation}
              />
            </div>
            <SheetFooter>
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button onClick={() => {
                handleSearch();
                setIsOpen(false);
              }}>
                Apply Filters
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:block">
        <div className="grid grid-cols-5 gap-4">
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="europe">Europe</SelectItem>
              <SelectItem value="asia">Asia</SelectItem>
              <SelectItem value="africa">Africa</SelectItem>
              <SelectItem value="americas">Americas</SelectItem>
              <SelectItem value="oceania">Oceania</SelectItem>
            </SelectContent>
          </Select>

          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger>
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Duration</SelectItem>
              <SelectItem value="1-3">1-3 days</SelectItem>
              <SelectItem value="4-7">4-7 days</SelectItem>
              <SelectItem value="8-14">8-14 days</SelectItem>
              <SelectItem value="15+">15+ days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="difficult">Difficult</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Label className="text-sm">Price:</Label>
            <span className="text-sm font-medium">
              ${priceRange[0]} - ${priceRange[1]}
            </span>
          </div>

          <Button variant="outline" onClick={handleReset}>
            <X className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
}

function FilterContent({
  priceRange,
  setPriceRange,
  duration,
  setDuration,
  difficulty,
  setDifficulty,
  location,
  setLocation,
}: {
  priceRange: number[];
  setPriceRange: (value: number[]) => void;
  duration: string;
  setDuration: (value: string) => void;
  difficulty: string;
  setDifficulty: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Location</Label>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="europe">Europe</SelectItem>
            <SelectItem value="asia">Asia</SelectItem>
            <SelectItem value="africa">Africa</SelectItem>
            <SelectItem value="americas">Americas</SelectItem>
            <SelectItem value="oceania">Oceania</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Duration</Label>
        <Select value={duration} onValueChange={setDuration}>
          <SelectTrigger>
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Duration</SelectItem>
            <SelectItem value="1-3">1-3 days</SelectItem>
            <SelectItem value="4-7">4-7 days</SelectItem>
            <SelectItem value="8-14">8-14 days</SelectItem>
            <SelectItem value="15+">15+ days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Difficulty</Label>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="moderate">Moderate</SelectItem>
            <SelectItem value="difficult">Difficult</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Price Range</Label>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            min={0}
            max={5000}
            step={100}
            className="w-full"
          />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>
    </>
  );
}
