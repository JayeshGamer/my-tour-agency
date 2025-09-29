export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-8">
              Last updated: December 1, 2024
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using TravelAgency's services, you acknowledge that you have read, 
                understood, and agree to be bound by these Terms of Service. If you do not agree 
                with any part of these terms, you may not use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Booking and Payments</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>All bookings are subject to availability and confirmation</li>
                <li>Prices are listed in Indian Rupees (INR) and include applicable taxes</li>
                <li>Full payment is required at the time of booking</li>
                <li>We accept major credit cards and digital payment methods</li>
                <li>Booking confirmation will be sent via email within 24 hours</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Cancellation Policy</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Cancellations made 30+ days before departure: Full refund minus processing fee</li>
                <li>Cancellations made 15-29 days before departure: 50% refund</li>
                <li>Cancellations made 7-14 days before departure: 25% refund</li>
                <li>Cancellations made less than 7 days before departure: No refund</li>
                <li>Emergency cancellations may be considered on a case-by-case basis</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Traveler Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Ensure all travel documents (passport, visa, etc.) are valid and current</li>
                <li>Arrive at designated meeting points on time</li>
                <li>Follow local laws, customs, and tour guide instructions</li>
                <li>Respect other travelers and local communities</li>
                <li>Purchase appropriate travel insurance</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Liability and Insurance</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                TravelAgency acts as an intermediary between travelers and service providers. 
                We are not liable for any injuries, losses, or damages that may occur during your trip.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We strongly recommend purchasing comprehensive travel insurance to protect 
                against unforeseen circumstances, medical emergencies, and trip cancellations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Force Majeure</h2>
              <p className="text-gray-700 leading-relaxed">
                We are not responsible for any failure to perform our obligations due to 
                circumstances beyond our control, including but not limited to natural disasters, 
                government actions, strikes, or other emergencies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Modifications to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be 
                effective immediately upon posting. Your continued use of our services 
                constitutes acceptance of any modifications.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@travelagency.com<br />
                  <strong>Phone:</strong> +91 (234) 567-890<br />
                  <strong>Address:</strong> 123 Travel Street, Adventure City, AC 12345
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}