"use client";

import { useState, useEffect } from "react";
import TourCard from "../../components/tours/TourCard";
import SearchFilter from "../../components/tours/SearchFilter";
import { Skeleton } from "../../src/components/ui/skeleton";

export default function ToursPage() {
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with API call
  useEffect(() => {
    const mockTours = [
      {
        id: "1",
        title: "Explore the Swiss Alps",
        description: "Experience breathtaking mountain views and charming alpine villages.",
        price: 2499,
        duration: 7,
        location: "Switzerland",
        maxGroupSize: 12,
        difficulty: "Moderate",
        images: ["/api/placeholder/400/300"],
        rating: 4.8,
        reviewCount: 124,
      },
      {
        id: "2",
        title: "Japanese Cultural Journey",
        description: "Immerse yourself in the rich culture and traditions of Japan.",
        price: 3299,
        duration: 10,
        location: "Japan",
        maxGroupSize: 15,
        difficulty: "Easy",
        images: ["/api/placeholder/400/300"],
        rating: 4.9,
        reviewCount: 89,
      },
      {
        id: "3",
        title: "Safari Adventure in Kenya",
        description: "Witness the incredible wildlife of the African savanna.",
        price: 3999,
        duration: 8,
        location: "Kenya",
        maxGroupSize: 10,
        difficulty: "Moderate",
        images: ["/api/placeholder/400/300"],
        rating: 4.7,
        reviewCount: 156,
      },
      {
        id: "4",
        title: "Northern Lights in Iceland",
        description: "Chase the Aurora Borealis across Iceland's stunning landscapes.",
        price: 2899,
        duration: 5,
        location: "Iceland",
        maxGroupSize: 8,
        difficulty: "Easy",
        images: ["/api/placeholder/400/300"],
        rating: 4.9,
        reviewCount: 203,
      },
      {
        id: "5",
        title: "Trek to Machu Picchu",
        description: "Journey through the Inca Trail to the legendary lost city.",
        price: 2199,
        duration: 6,
        location: "Peru",
        maxGroupSize: 12,
        difficulty: "Difficult",
        images: ["/api/placeholder/400/300"],
        rating: 4.8,
        reviewCount: 342,
      },
      {
        id: "6",
        title: "Greek Island Hopping",
        description: "Sail through the beautiful Greek islands and ancient ruins.",
        price: 2799,
        duration: 9,
        location: "Greece",
        maxGroupSize: 16,
        difficulty: "Easy",
        images: ["/api/placeholder/400/300"],
        rating: 4.6,
        reviewCount: 178,
      },
    ];
    
    setTimeout(() => {
      setTours(mockTours);
      setFilteredTours(mockTours);
      setLoading(false);
    }, 1000);
  }, []);

  const handleFilterChange = (filters: any) => {
    let filtered = [...tours];

    // Apply search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(
        (tour) =>
          tour.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          tour.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          tour.location.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Apply price filter
    if (filters.priceRange) {
      filtered = filtered.filter(
        (tour) =>
          tour.price >= filters.priceRange[0] &&
          tour.price <= filters.priceRange[1]
      );
    }

    // Apply difficulty filter
    if (filters.difficulty && filters.difficulty !== "all") {
      filtered = filtered.filter(
        (tour) => tour.difficulty.toLowerCase() === filters.difficulty.toLowerCase()
      );
    }

    // Apply location filter
    if (filters.location && filters.location !== "all") {
      // This is simplified - in real app, you'd map locations to regions
      filtered = filtered.filter((tour) =>
        tour.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Apply duration filter
    if (filters.duration && filters.duration !== "all") {
      const [min, max] = filters.duration.split("-").map((d: string) => 
        d.includes("+") ? 15 : parseInt(d)
      );
      filtered = filtered.filter((tour) => {
        if (max) {
          return tour.duration >= min && tour.duration <= max;
        }
        return tour.duration >= min;
      });
    }

    setFilteredTours(filtered);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">All Tours</h1>
        <p className="text-muted-foreground">
          Discover our complete collection of expertly crafted adventures
        </p>
      </div>

      <SearchFilter onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : filteredTours.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground">
            Showing {filteredTours.length} of {tours.length} tours
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">
            No tours found matching your criteria.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Try adjusting your filters or search terms.
          </p>
        </div>
      )}
    </div>
  );
}
