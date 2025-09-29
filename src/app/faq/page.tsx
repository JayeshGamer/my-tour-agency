"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const faqs = [
	{
		id: "booking",
		question: "How do I book a tour?",
		answer:
			"You can book a tour by browsing our available tours, selecting your preferred dates, and completing the booking process online. Payment is required at the time of booking to confirm your reservation.",
	},
	{
		id: "payment",
		question: "What payment methods do you accept?",
		answer:
			"We accept major credit cards (Visa, MasterCard, American Express), debit cards, and popular digital payment methods. All prices are listed in Indian Rupees (INR).",
	},
	{
		id: "cancellation",
		question: "What is your cancellation policy?",
		answer:
			"Cancellation fees depend on timing: 30+ days before departure (full refund minus processing fee), 15-29 days (50% refund), 7-14 days (25% refund), less than 7 days (no refund).",
	},
	{
		id: "documents",
		question: "What travel documents do I need?",
		answer:
			"You'll need a valid passport with at least 6 months remaining validity. Visa requirements vary by destination. We recommend checking with the relevant embassy or consulate for specific requirements.",
	},
	{
		id: "insurance",
		question: "Is travel insurance included?",
		answer:
			"Travel insurance is not included in tour prices but is highly recommended. We can help you find appropriate coverage for your trip including medical, trip cancellation, and baggage protection.",
	},
	{
		id: "group-size",
		question: "What are your typical group sizes?",
		answer:
			"Our group sizes typically range from 8-16 people for most tours. This ensures a personalized experience while maintaining the social aspects of group travel.",
	},
	{
		id: "dietary",
		question: "Can you accommodate dietary restrictions?",
		answer:
			"Yes, we can accommodate most dietary restrictions including vegetarian, vegan, gluten-free, and religious dietary requirements. Please inform us during booking.",
	},
	{
		id: "luggage",
		question: "What are the luggage restrictions?",
		answer:
			"Luggage restrictions vary by tour type and transportation method. Generally, we recommend one suitcase plus carry-on. Specific requirements will be provided in your pre-departure information.",
	},
	{
		id: "solo-travel",
		question: "Do you accept solo travelers?",
		answer:
			"Absolutely! We welcome solo travelers. Many of our guests travel alone and make lasting friendships. Single supplement fees may apply for private accommodations.",
	},
	{
		id: "weather",
		question: "What if the weather affects my tour?",
		answer:
			"We monitor weather conditions closely and have contingency plans. Minor itinerary changes may occur due to weather, but we'll ensure you get the full tour experience regardless.",
	},
];

export default function FAQPage() {
	const [openFAQ, setOpenFAQ] = useState<string | null>(null);

	const toggleFAQ = (id: string) => {
		setOpenFAQ(openFAQ === id ? null : id);
	};

	return (
		<div className="min-h-screen bg-gray-50 pt-24">
			<div className="max-w-4xl mx-auto px-6 pb-16">
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">
						Frequently Asked Questions
					</h1>
					<p className="text-xl text-gray-600">
						Find answers to common questions about our tours and services
					</p>
				</div>

				<div className="space-y-4">
					{faqs.map((faq) => (
						<Card key={faq.id} className="overflow-hidden">
							<CardContent className="p-0">
								<button
									onClick={() => toggleFAQ(faq.id)}
									className="w-full text-left p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
								>
									<h3 className="text-lg font-semibold text-gray-900 pr-4">
										{faq.question}
									</h3>
									{openFAQ === faq.id ? (
										<ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
									) : (
										<ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
									)}
								</button>

								{openFAQ === faq.id && (
									<div className="px-6 pb-6">
										<p className="text-gray-700 leading-relaxed">
											{faq.answer}
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>

				{/* Contact Section */}
				<div className="mt-16 text-center bg-white rounded-lg p-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">
						Still have questions?
					</h2>
					<p className="text-gray-600 mb-6">
						Our travel experts are here to help you plan the perfect trip.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<a
							href="/contact"
							className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
						>
							Contact Us
						</a>
						<a
							href="tel:+91234567890"
							className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
						>
							Call +91 (234) 567-890
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}