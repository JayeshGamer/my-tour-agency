import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Camera, Calendar } from "lucide-react";
import Link from "next/link";

const destinations = [
	{
		id: "paris",
		name: "Paris, France",
		description:
			"The City of Light offers world-class museums, iconic landmarks, and romantic charm.",
		image: "/api/placeholder/400/300",
		tours: 12,
		featured: true,
	},
	{
		id: "tokyo",
		name: "Tokyo, Japan",
		description:
			"A fascinating blend of ancient traditions and cutting-edge technology.",
		image: "/api/placeholder/400/300",
		tours: 8,
		featured: true,
	},
	{
		id: "bali",
		name: "Bali, Indonesia",
		description:
			"Tropical paradise with stunning beaches, temples, and rich culture.",
		image: "/api/placeholder/400/300",
		tours: 15,
		featured: true,
	},
	{
		id: "rome",
		name: "Rome, Italy",
		description:
			"Eternal city filled with ancient history, art, and incredible cuisine.",
		image: "/api/placeholder/400/300",
		tours: 10,
		featured: false,
	},
	{
		id: "santorini",
		name: "Santorini, Greece",
		description:
			"Stunning sunsets, white-washed buildings, and crystal-clear waters.",
		image: "/api/placeholder/400/300",
		tours: 6,
		featured: false,
	},
	{
		id: "new-york",
		name: "New York, USA",
		description:
			"The city that never sleeps, filled with iconic sights and experiences.",
		image: "/api/placeholder/400/300",
		tours: 9,
		featured: false,
	},
];

export default function DestinationsPage() {
	const featuredDestinations = destinations.filter((d) => d.featured);
	const otherDestinations = destinations.filter((d) => !d.featured);

	return (
		<div className="min-h-screen bg-gray-50 pt-24">
			<div className="max-w-7xl mx-auto px-6">
				{/* Hero Section */}
				<div className="text-center mb-16">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
						Explore Amazing Destinations
					</h1>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Discover breathtaking places around the world with our carefully
						curated tours
						<br className="hidden sm:inline" />
						and local expertise.
					</p>
				</div>

				{/* Featured Destinations */}
				<section className="mb-16">
					<h2 className="text-3xl font-bold text-gray-900 mb-8">
						Featured Destinations
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{featuredDestinations.map((destination) => (
							<Card
								key={destination.id}
								className="overflow-hidden hover:shadow-lg transition-shadow group"
							>
								<div className="relative h-64">
									<img
										src={destination.image}
										alt={destination.name}
										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
									/>
									<div className="absolute top-4 right-4">
										<div className="bg-black/70 text-white px-2 py-1 rounded text-sm">
											{destination.tours} tours
										</div>
									</div>
								</div>

								<CardContent className="p-6">
									<div className="flex items-center gap-2 mb-3">
										<MapPin className="h-5 w-5 text-primary" />
										<h3 className="text-xl font-semibold text-gray-900">
											{destination.name}
										</h3>
									</div>

									<p className="text-gray-600 mb-4 line-clamp-2">
										{destination.description}
									</p>

									<div className="flex items-center justify-between">
										<div className="flex items-center gap-4 text-sm text-gray-500">
											<div className="flex items-center gap-1">
												<Camera className="h-4 w-4" />
												<span>Photos</span>
											</div>
											<div className="flex items-center gap-1">
												<Calendar className="h-4 w-4" />
												<span>Available</span>
											</div>
										</div>

										<Button size="sm" asChild>
											<Link href={`/tours?destination=${destination.id}`}>
												View Tours
											</Link>
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</section>

				{/* All Destinations */}
				<section className="mb-16">
					<h2 className="text-3xl font-bold text-gray-900 mb-8">
						More Destinations
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{otherDestinations.map((destination) => (
							<Card
								key={destination.id}
								className="overflow-hidden hover:shadow-lg transition-shadow group"
							>
								<div className="relative h-64">
									<img
										src={destination.image}
										alt={destination.name}
										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
									/>
									<div className="absolute top-4 right-4">
										<div className="bg-black/70 text-white px-2 py-1 rounded text-sm">
											{destination.tours} tours
										</div>
									</div>
								</div>

								<CardContent className="p-6">
									<div className="flex items-center gap-2 mb-3">
										<MapPin className="h-5 w-5 text-primary" />
										<h3 className="text-xl font-semibold text-gray-900">
											{destination.name}
										</h3>
									</div>

									<p className="text-gray-600 mb-4 line-clamp-2">
										{destination.description}
									</p>

									<div className="flex items-center justify-between">
										<div className="flex items-center gap-4 text-sm text-gray-500">
											<div className="flex items-center gap-1">
												<Camera className="h-4 w-4" />
												<span>Photos</span>
											</div>
											<div className="flex items-center gap-1">
												<Calendar className="h-4 w-4" />
												<span>Available</span>
											</div>
										</div>

										<Button size="sm" asChild>
											<Link href={`/tours?destination=${destination.id}`}>
												View Tours
											</Link>
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</section>

				{/* CTA Section */}
				<section className="text-center bg-black text-white rounded-lg p-12 mb-16">
					<h2 className="text-3xl font-bold mb-4">
						Can't Find Your Dream Destination?
					</h2>
					<p className="text-gray-300 mb-6 max-w-2xl mx-auto">
						Contact us to create a custom tour package tailored to your
						preferences.
						<br className="hidden sm:inline" />
						Our travel experts will help you plan the perfect trip.
					</p>
					<Button
						size="lg"
						variant="outline"
						className="bg-white text-black hover:bg-gray-100"
						asChild
					>
						<Link href="/contact">Contact Us</Link>
					</Button>
				</section>
			</div>
		</div>
	);
}