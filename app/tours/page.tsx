"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { TourCard } from "../../components/tours/TourCard";
import { FiltersSection } from "../../components/tours/FiltersSection";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export interface Tour {
  id: string;
  title: string;
  description: string;
  price: string;
  duration: number;
  maxGroupSize: number;
  difficulty: string;
  location: string;
  startDates: string[];
  images: string[];
  included: string[];
  notIncluded: string[];
  itinerary: { day: number; title: string; description: string }[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
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
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTours, setTotalTours] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    tourType: [],
    location: [],
    priceRange: [],
    duration: [],
    activities: [],
  });
  
  const toursPerPage = 9;
  const totalPages = Math.ceil(totalTours / toursPerPage);

  // Fetch tours with filters and pagination
  const fetchTours = useCallback(async (page = 1, filtersToApply = filters) => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        limit: toursPerPage.toString(),
        offset: ((page - 1) * toursPerPage).toString(),
      });

      // Add filter parameters
      if (filtersToApply.location.length > 0) {
        params.append('location', filtersToApply.location[0]);
      }
      if (filtersToApply.tourType.length > 0) {
        params.append('difficulty', filtersToApply.tourType[0]);
      }
      if (filtersToApply.priceRange.length > 0) {
        const priceRange = filtersToApply.priceRange[0];
        if (priceRange === 'under500') {
          params.append('maxPrice', '500');
        } else if (priceRange === '500to1000') {
          params.append('minPrice', '500');
          params.append('maxPrice', '1000');
        } else if (priceRange === '1000to2000') {
          params.append('minPrice', '1000');
          params.append('maxPrice', '2000');
        } else if (priceRange === 'over2000') {
          params.append('minPrice', '2000');
        }
      }

      const response = await fetch(`/api/tours?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTours(data);
        
        // For pagination, we need total count - in a real app, this would come from the API
        // For now, estimate based on returned results
        if (data.length < toursPerPage && page === 1) {
          setTotalTours(data.length);
        } else if (data.length === toursPerPage) {
          // This is an estimation - in real app, API should return total count
          setTotalTours(Math.max(totalTours, page * toursPerPage + 1));
        }
      } else {
        // Fallback mock data but only 3 items for performance
        const mockTours: Tour[] = [
          {
            id: "1",
            title: "Explore the Swiss Alps",
            description: "Experience breathtaking mountain views and charming alpine villages.",
            price: "2499",
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
            title: "Japanese Cultural Journey",
            description: "Immerse yourself in the rich culture and traditions of Japan.",
            price: "3299",
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
            title: "Safari Adventure in Kenya",
            description: "Witness the incredible wildlife of the African savanna.",
            price: "3999",
            duration: 8,
            location: "Kenya",
            maxGroupSize: 10,
            difficulty: "Moderate",
            images: ["/images/tours/santorini.jpg"],
            startDates: ["2024-06-01", "2024-08-15", "2024-10-01"],
            included: ["Safari drives", "Park fees", "Expert guides"],
            notIncluded: ["Flights", "Visas"],
            itinerary: [],
            featured: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isPopular: true
          },
        ];
        setTours(mockTours);
        setTotalTours(3);
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
      setTours([]);
      setTotalTours(0);
    } finally {
      setLoading(false);
    }
  }, [filters, toursPerPage, totalTours]);

  // Initial load
  useEffect(() => {
    fetchTours(1);
  }, []);

  // Handle filter changes
  useEffect(() => {
    if (currentPage === 1) {
      fetchTours(1, filters);
    } else {
      setCurrentPage(1); // Reset to first page when filters change
    }
  }, [filters]);

  // Handle page changes
  useEffect(() => {
    if (currentPage > 1) {
      fetchTours(currentPage, filters);
    }
  }, [currentPage]);

  // Memoized pagination controls
  const paginationControls = useMemo(() => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return { pages, startPage, endPage };
  }, [currentPage, totalPages]);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      tourType: [],
      location: [],
      priceRange: [],
      duration: [],
      activities: [],
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-6">
        {/* Page Header */}
        <div className="py-8 border-b border-gray-200 bg-white -mx-6 px-6 mb-8">
          <div className="max-w-[1440px] mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">Explore Our Tours</h1>
            <p className="text-gray-600 mt-2">
              Discover amazing destinations with our carefully curated tour packages
            </p>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div
            className={`transition-all duration-300 ${
              showFilters ? 'w-72' : 'w-0'
            } overflow-hidden`}
          >
            <div className="w-72">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="font-semibold text-lg">Filters</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="p-1"
                    aria-label={showFilters ? 'Hide filters' : 'Show filters'}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
                <FiltersSection
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearAll={clearAllFilters}
                />
              </div>
            </div>
          </div>

          {/* Toggle Button when filters are hidden */}
          {!showFilters && (
            <div className="w-12">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(true)}
                className="p-2 sticky top-24"
                aria-label="Show filters"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Results Summary */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-700">
                Showing <span className="font-semibold">{tours.length}</span> of{" "}
                <span className="font-semibold">{totalTours}</span> tours
                {totalPages > 1 && (
                  <span className="text-sm text-gray-500 ml-2">
                    (Page {currentPage} of {totalPages})
                  </span>
                )}
              </p>
              <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Sort tours">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Duration: Short to Long</option>
                <option>Duration: Long to Short</option>
              </select>
            </div>

            {/* Tours Grid */}
            <div className="space-y-8">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(9)].map((_, index) => (
                    <div
                      key={index}
                      className="bg-gray-200 rounded-lg h-96 animate-pulse"
                      role="status"
                      aria-label="Loading tour"
                    />
                  ))}
                </div>
              ) : tours.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {tours.map((tour) => (
                      <TourCard key={tour.id} tour={tour} />
                    ))}
                  </div>
                  
                  {/* Pagination Controls */}
                  {paginationControls && (
                    <div className="flex items-center justify-center space-x-2 pt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage <= 1 || loading}
                        className="flex items-center"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      
                      {paginationControls.startPage > 1 && (
                        <>
                          <Button
                            variant={1 === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(1)}
                            disabled={loading}
                          >
                            1
                          </Button>
                          {paginationControls.startPage > 2 && (
                            <span className="text-gray-500">...</span>
                          )}
                        </>
                      )}
                      
                      {paginationControls.pages.map((page) => (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          disabled={loading}
                        >
                          {page}
                        </Button>
                      ))}
                      
                      {paginationControls.endPage < totalPages && (
                        <>
                          {paginationControls.endPage < totalPages - 1 && (
                            <span className="text-gray-500">...</span>
                          )}
                          <Button
                            variant={totalPages === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={loading}
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage >= totalPages || loading}
                        className="flex items-center"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No tours found matching your criteria.
                  </p>
                  <Button
                    onClick={clearAllFilters}
                    className="mt-4"
                    variant="outline"
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
