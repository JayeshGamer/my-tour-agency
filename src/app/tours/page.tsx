"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { TourCard } from "@/components/tours/TourCard";
import { BentoTourCard } from "@/components/tours/BentoTourCard";
import { TourListCard } from "@/components/tours/TourListCard";
import { FiltersSection } from "@/components/tours/FiltersSection";
import { FeaturedToursCarousel } from "@/components/tours/FeaturedToursCarousel";
import { QuickFilterChips } from "@/components/tours/QuickFilterChips";
import { ViewToggle, ViewMode } from "@/components/tours/ViewToggle";
import { RecentlyViewedTours } from "@/components/tours/RecentlyViewedTours";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, Map, Filter, X, SlidersHorizontal, Search, Loader2, Sparkles, TrendingUp, Grid3x3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface Tour {
  id: string;
  name?: string;
  title?: string;
  description: string;
  price?: string;
  pricePerPerson?: string;
  duration: number;
  maxGroupSize: number;
  difficulty: string;
  location: string;
  category?: string;
  startDates: string[];
  images: string[];
  imageUrl?: string | null;
  included: string[];
  notIncluded: string[];
  itinerary: { day: number; title: string; description: string }[];
  featured: boolean;
  status?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  discount?: number;
  isNew?: boolean;
  isPopular?: boolean;
}

export interface FilterState {
  tourType: string[];
  location: string[];
  priceRange: string[];
  duration: string[];
  activities: string[];
}

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [allTours, setAllTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [activeCategory, setActiveCategory] = useState("all");
  const observerTarget = useRef(null);

  const [filters, setFilters] = useState<FilterState>({
    tourType: [],
    location: [],
    priceRange: [],
    duration: [],
    activities: [],
  });
  
  const toursPerPage = 12;
  const [displayedCount, setDisplayedCount] = useState(toursPerPage);

  // Categories for tab navigation
  const categories = [
    { id: "all", label: "All Tours", icon: Grid3x3 },
    { id: "featured", label: "Featured", icon: Sparkles },
    { id: "popular", label: "Popular", icon: TrendingUp },
    { id: "adventure", label: "Adventure", icon: Map },
  ];

  // Fetch all tours
  const fetchTours = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tours?limit=100');
      if (response.ok) {
        const data = await response.json();
        setAllTours(data);
        setTours(data.slice(0, toursPerPage));
        setHasMore(data.length > toursPerPage);
      } else {
        // Fallback mock data
        const mockTours: Tour[] = [
          {
            id: "1",
            name: "Explore the Swiss Alps",
            title: "Explore the Swiss Alps",
            description: "Experience breathtaking mountain views and charming alpine villages.",
            price: "2499",
            pricePerPerson: "2499",
            duration: 7,
            location: "Switzerland",
            maxGroupSize: 12,
            difficulty: "Moderate",
            images: ["/images/tours/everest-trek.jpg"],
            startDates: ["2024-06-15", "2024-07-20", "2024-08-10"],
            included: ["Professional guide", "Accommodation", "Meals"],
            notIncluded: ["Flights", "Insurance"],
            itinerary: [],
            featured: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            discount: 15,
            isPopular: true
          },
          {
            id: "2",
            name: "Japanese Cultural Journey",
            title: "Japanese Cultural Journey",
            description: "Immerse yourself in the rich culture and traditions of Japan.",
            price: "3299",
            pricePerPerson: "3299",
            duration: 10,
            location: "Japan",
            maxGroupSize: 15,
            difficulty: "Easy",
            images: ["/images/tours/japan.jpg"],
            startDates: ["2024-05-01", "2024-09-15"],
            included: ["Temple visits", "Cultural experiences", "Local cuisine"],
            notIncluded: ["Flights", "Personal expenses"],
            itinerary: [],
            featured: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isNew: true
          },
          {
            id: "3",
            name: "Safari Adventure in Kenya",
            title: "Safari Adventure in Kenya",
            description: "Witness the incredible wildlife of the African savanna.",
            price: "3999",
            pricePerPerson: "3999",
            duration: 8,
            location: "Kenya",
            maxGroupSize: 10,
            difficulty: "Moderate",
            images: ["/images/tours/serengeti.jpg"],
            startDates: ["2024-06-01", "2024-08-15", "2024-10-01"],
            included: ["Safari drives", "Park fees", "Expert guides"],
            notIncluded: ["Flights", "Visas"],
            itinerary: [],
            featured: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isPopular: true
          },
          {
            id: "4",
            name: "Santorini Sunset Experience",
            title: "Santorini Sunset Experience",
            description: "Discover the beauty of Greek islands and stunning sunsets.",
            price: "1999",
            pricePerPerson: "1999",
            duration: 5,
            location: "Greece",
            maxGroupSize: 20,
            difficulty: "Easy",
            images: ["/images/tours/santorini.jpg"],
            startDates: ["2024-05-15", "2024-06-20"],
            included: ["Island tours", "Boat rides", "Wine tasting"],
            notIncluded: ["Flights", "Meals"],
            itinerary: [],
            featured: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "5",
            name: "Iceland Northern Lights",
            title: "Iceland Northern Lights",
            description: "Chase the aurora borealis in the land of fire and ice.",
            price: "2799",
            pricePerPerson: "2799",
            duration: 6,
            location: "Iceland",
            maxGroupSize: 15,
            difficulty: "Moderate",
            images: ["/images/tours/iceland.jpg"],
            startDates: ["2024-09-01", "2024-10-15"],
            included: ["Northern lights tours", "Hot springs", "Glacier walks"],
            notIncluded: ["Flights", "Some meals"],
            itinerary: [],
            featured: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isNew: true
          },
          {
            id: "6",
            name: "Machu Picchu Trek",
            title: "Machu Picchu Trek",
            description: "Hike the ancient Inca trail to the lost city of Machu Picchu.",
            price: "2199",
            pricePerPerson: "2199",
            duration: 8,
            location: "Peru",
            maxGroupSize: 12,
            difficulty: "Hard",
            images: ["/images/tours/machu-picchu.jpg"],
            startDates: ["2024-05-01", "2024-09-01"],
            included: ["Professional guide", "Camping equipment", "Meals"],
            notIncluded: ["Flights", "Travel insurance"],
            itinerary: [],
            featured: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isPopular: true
          },
        ];
        setAllTours(mockTours);
        setTours(mockTours.slice(0, toursPerPage));
        setHasMore(mockTours.length > toursPerPage);
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  // Filter and sort tours
  const filteredAndSortedTours = useMemo(() => {
    let filtered = [...allTours];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(tour => {
        const tourName = tour.name || tour.title || "";
        return tourName.toLowerCase().includes(searchQuery.toLowerCase()) ||
               tour.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
               tour.location.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Category filter
    if (activeCategory !== "all") {
      if (activeCategory === "featured") {
        filtered = filtered.filter(tour => tour.featured);
      } else if (activeCategory === "popular") {
        filtered = filtered.filter(tour => tour.isPopular);
      } else if (activeCategory === "adventure") {
        filtered = filtered.filter(tour => tour.difficulty === "Hard" || tour.difficulty === "Moderate");
      }
    }

    // Apply filters
    if (filters.location.length > 0) {
      filtered = filtered.filter(tour => filters.location.includes(tour.location));
    }
    if (filters.tourType.length > 0) {
      filtered = filtered.filter(tour => filters.tourType.includes(tour.difficulty));
    }
    if (filters.priceRange.length > 0) {
      filtered = filtered.filter(tour => {
        const price = parseFloat(tour.pricePerPerson || tour.price || "0");
        return filters.priceRange.some(range => {
          if (range === 'under500') return price < 500;
          if (range === '500to1000') return price >= 500 && price <= 1000;
          if (range === '1000to2000') return price >= 1000 && price <= 2000;
          if (range === 'over2000') return price > 2000;
          return false;
        });
      });
    }
    if (filters.duration.length > 0) {
      filtered = filtered.filter(tour => {
        return filters.duration.some(range => {
          if (range === '1-3') return tour.duration >= 1 && tour.duration <= 3;
          if (range === '4-7') return tour.duration >= 4 && tour.duration <= 7;
          if (range === '8+') return tour.duration >= 8;
          return false;
        });
      });
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => parseFloat(a.pricePerPerson || a.price || "0") - parseFloat(b.pricePerPerson || b.price || "0"));
        break;
      case "price-high":
        filtered.sort((a, b) => parseFloat(b.pricePerPerson || b.price || "0") - parseFloat(a.pricePerPerson || a.price || "0"));
        break;
      case "duration-short":
        filtered.sort((a, b) => a.duration - b.duration);
        break;
      case "duration-long":
        filtered.sort((a, b) => b.duration - a.duration);
        break;
      case "popular":
        filtered.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
        break;
      case "featured":
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return filtered;
  }, [allTours, searchQuery, activeCategory, filters, sortBy]);

  // Update displayed tours
  useEffect(() => {
    setTours(filteredAndSortedTours.slice(0, displayedCount));
    setHasMore(filteredAndSortedTours.length > displayedCount);
  }, [filteredAndSortedTours, displayedCount]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreTours();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadingMore]);

  const loadMoreTours = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    setTimeout(() => {
      setDisplayedCount(prev => prev + toursPerPage);
      setLoadingMore(false);
    }, 500);
  };

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setDisplayedCount(toursPerPage);
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      tourType: [],
      location: [],
      priceRange: [],
      duration: [],
      activities: [],
    });
    setSearchQuery("");
    setActiveCategory("all");
    setDisplayedCount(toursPerPage);
  }, []);

  // Quick filter handlers
  const handleQuickFilterSelect = (category: string, value: string) => {
    if (category === "sort") {
      setSortBy(value);
    } else {
      setFilters(prev => ({
        ...prev,
        [category]: [...prev[category as keyof FilterState], value],
      }));
    }
  };

  const handleQuickFilterRemove = (category: string, value: string) => {
    if (category === "sort") {
      setSortBy("featured");
    } else {
      setFilters(prev => ({
        ...prev,
        [category]: prev[category as keyof FilterState].filter(v => v !== value),
      }));
    }
  };

  const activeFiltersCount = Object.values(filters).flat().length;
  const activeQuickFilters = [
    ...Object.entries(filters).flatMap(([category, values]) =>
      values.map(value => ({ category, value }))
    ),
    ...(sortBy !== "featured" ? [{ category: "sort", value: sortBy }] : []),
  ];

  const progressValue = (tours.length / filteredAndSortedTours.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Sticky Header Bar */}
      <section className="sticky top-16 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b-2 border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left: Title and breadcrumb */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <a href="/" className="hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Home</a>
                <span>/</span>
                <span className="text-gray-900 dark:text-white font-semibold">All Tours</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Map className="h-7 w-7 sm:h-8 sm:w-8 text-purple-600" />
                Browse All Tours
                {filteredAndSortedTours.length > 0 && (
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm sm:text-base font-bold px-3 py-1 border-0">
                    {filteredAndSortedTours.length}
                  </Badge>
                )}
              </h1>
            </div>

            {/* Right: Search and View Toggle */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search tours..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 h-11 text-sm bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-purple-600 dark:focus:border-purple-400"
                />
              </div>
              <ViewToggle view={viewMode} onViewChange={setViewMode} />
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
                className="lg:hidden h-11 px-4 border-2 border-gray-900 dark:border-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 rounded-xl whitespace-nowrap font-semibold"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs border-0">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mt-4">
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 rounded-lg font-semibold"
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {category.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Featured Tours Carousel */}
          {!loading && allTours.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <FeaturedToursCarousel tours={allTours} />
            </motion.div>
          )}

          {/* Recently Viewed Tours */}
          {!loading && allTours.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8"
            >
              <RecentlyViewedTours tours={allTours} />
            </motion.div>
          )}

          {/* Quick Filter Chips */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <QuickFilterChips
                onFilterSelect={handleQuickFilterSelect}
                activeFilters={activeQuickFilters}
                onFilterRemove={handleQuickFilterRemove}
              />
            </motion.div>
          )}

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Filters Sidebar */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="lg:w-80 flex-shrink-0"
                >
                  <div className="lg:sticky lg:top-36 space-y-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                      <div className="p-5 border-b-2 border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                            <SlidersHorizontal className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h2 className="font-bold text-base text-gray-900 dark:text-white">Filters</h2>
                            {activeFiltersCount > 0 && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">{activeFiltersCount} active</p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowFilters(false)}
                          className="lg:flex hidden p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                      <FiltersSection
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClearAll={clearAllFilters}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggle Button when filters are hidden (Desktop) */}
            {!showFilters && (
              <div className="hidden lg:block flex-shrink-0">
                <Button
                  onClick={() => setShowFilters(true)}
                  variant="outline"
                  size="lg"
                  className="sticky top-36 h-14 w-14 rounded-2xl border-2 border-purple-600 dark:border-purple-400 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-400 dark:hover:text-gray-900 p-0 shadow-lg"
                >
                  <SlidersHorizontal className="h-6 w-6" />
                </Button>
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Controls Bar */}
              <div className="mb-6 bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-5 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-gray-900 dark:text-white font-bold text-base sm:text-lg">
                      {loading ? "Loading tours..." : `${filteredAndSortedTours.length} ${filteredAndSortedTours.length === 1 ? 'Tour' : 'Tours'} Found`}
                    </p>
                    <div className="flex items-center gap-2">
                      <Progress value={progressValue} className="w-32 h-2" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Showing {tours.length} of {filteredAndSortedTours.length}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <label htmlFor="sort-select" className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      Sort by:
                    </label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger id="sort-select" className="w-full sm:w-52 h-11 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="duration-short">Duration: Short to Long</SelectItem>
                        <SelectItem value="duration-long">Duration: Long to Short</SelectItem>
                        <SelectItem value="popular">Most Popular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Tours Display */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(9)].map((_, index) => (
                    <div
                      key={index}
                      className="bg-gray-200 dark:bg-gray-800 rounded-2xl h-[500px] animate-pulse"
                    />
                  ))}
                </div>
              ) : tours.length > 0 ? (
                <>
                  <AnimatePresence mode="wait">
                    {viewMode === "grid" && (
                      <motion.div
                        key="grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                      >
                        {tours.map((tour, index) => (
                          <motion.div
                            key={tour.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <TourCard tour={tour} />
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                    {viewMode === "list" && (
                      <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        {tours.map((tour, index) => (
                          <motion.div
                            key={tour.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <TourListCard tour={tour} />
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                    {viewMode === "bento" && (
                      <motion.div
                        key="bento"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr"
                      >
                        {tours.map((tour, index) => {
                          // Make every 4th and 5th item large in bento grid
                          const isLarge = (index % 7 === 3 || index % 7 === 4);
                          return (
                            <motion.div
                              key={tour.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className={cn(isLarge && "md:col-span-2")}
                            >
                              <BentoTourCard
                                tour={tour}
                                featured={tour.featured}
                                large={isLarge}
                              />
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Infinite Scroll Trigger & Load More */}
                  {hasMore && (
                    <div ref={observerTarget} className="mt-10 flex justify-center">
                      {loadingMore ? (
                        <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span className="font-semibold">Loading more tours...</span>
                        </div>
                      ) : (
                        <Button
                          onClick={loadMoreTours}
                          size="lg"
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 rounded-xl px-8 h-12 font-bold shadow-lg hover:shadow-xl transition-all"
                        >
                          Load More Tours
                          <Sparkles className="ml-2 h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 flex items-center justify-center">
                    <Map className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    No tours found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    We couldn't find any tours matching your criteria. Try adjusting your filters or search query.
                  </p>
                  <Button
                    onClick={clearAllFilters}
                    className="h-12 px-8 text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 rounded-xl font-bold shadow-lg"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Clear All Filters
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
