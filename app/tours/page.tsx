"use client";

import { useState, useEffect } from "react";
import { TourCard } from "../../components/tours/TourCard";
import { FiltersSection } from "../../components/tours/FiltersSection";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    tourType: [],
    location: [],
    priceRange: [],
    duration: [],
    activities: [],
  });

  useEffect(() => {
    fetchTours();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, tours]);

  const fetchTours = async () => {
    try {
      const response = await fetch('/api/tours');
      if (response.ok) {
        const data = await response.json();
        setTours(data);
        setFilteredTours(data);
      } else {
        // Use mock data as fallback
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
            images: ["/api/placeholder/400/300"],
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
            images: ["/api/placeholder/400/300"],
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
            images: ["/api/placeholder/400/300"],
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
        setFilteredTours(mockTours);
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tours];

    // Filter by tour type
    if (filters.tourType.length > 0) {
      filtered = filtered.filter(tour =>
        filters.tourType.some(type => 
          tour.difficulty.toLowerCase().includes(type.toLowerCase())
        )
      );
    }

    // Filter by location
    if (filters.location.length > 0) {
      filtered = filtered.filter(tour =>
        filters.location.some(loc => 
          tour.location.toLowerCase().includes(loc.toLowerCase())
        )
      );
    }

    // Filter by price range
    if (filters.priceRange.length > 0) {
      filtered = filtered.filter(tour => {
        const price = parseFloat(tour.price);
        return filters.priceRange.some(range => {
          switch (range) {
            case 'under500':
              return price < 500;
            case '500to1000':
              return price >= 500 && price <= 1000;
            case '1000to2000':
              return price > 1000 && price <= 2000;
            case 'over2000':
              return price > 2000;
            default:
              return true;
          }
        });
      });
    }

    // Filter by duration
    if (filters.duration.length > 0) {
      filtered = filtered.filter(tour => {
        return filters.duration.some(dur => {
          switch (dur) {
            case '1to3':
              return tour.duration >= 1 && tour.duration <= 3;
            case '4to7':
              return tour.duration >= 4 && tour.duration <= 7;
            case '8to14':
              return tour.duration >= 8 && tour.duration <= 14;
            case 'over14':
              return tour.duration > 14;
            default:
              return true;
          }
        });
      });
    }

    // Filter by activities
    if (filters.activities.length > 0) {
      filtered = filtered.filter(tour =>
        filters.activities.some(activity => {
          const tourText = `${tour.title} ${tour.description} ${tour.included.join(' ')}`.toLowerCase();
          return tourText.includes(activity.toLowerCase());
        })
      );
    }

    setFilteredTours(filtered);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const clearAllFilters = () => {
    setFilters({
      tourType: [],
      location: [],
      priceRange: [],
      duration: [],
      activities: [],
    });
  };

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
                Showing <span className="font-semibold">{filteredTours.length}</span> of{" "}
                <span className="font-semibold">{tours.length}</span> tours
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
            {loading ? (
              <div className="grid grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-gray-200 rounded-lg h-96 animate-pulse"
                    role="status"
                    aria-label="Loading tour"
                  />
                ))}
              </div>
            ) : filteredTours.length > 0 ? (
              <div className="grid grid-cols-3 gap-6">
                {filteredTours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} />
                ))}
              </div>
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
  );
}
