import Header from "@/components/Client/Header"
import Footer from "@/components/Footer"
import { Card } from "@/components/ui/card"
import { Edit } from "lucide-react"

export default function ClientFAQ() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section with FAQ Banner */}
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-black text-white rounded-3xl overflow-hidden relative">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden">
              <img
                src="/images/image-2014-12-2025-20at-205.jpeg"
                alt="Sports car"
                className="h-full w-full object-cover opacity-90"
              />
            </div>
            <div className="relative z-10 p-12">
              <button className="mb-6 p-3 bg-white/10 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-colors">
                <Edit className="w-6 h-6" />
              </button>
              <h1 className="text-5xl font-bold mb-4">
                Frequently
                <br />
                Asked <span className="text-red-600">Questions</span>
              </h1>
              <p className="text-white/90 text-lg max-w-md">
                Find quick answers to the most common questions about booking, payments, and our vehicles.
              </p>
            </div>
          </Card>
        </div>

        {/* FAQ Sections */}
        <div className="container mx-auto px-4 py-12">
          {/* Booking & Reservations */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold mb-8">Booking & Reservations</h2>

            <Card className="bg-white p-6 rounded-xl mb-4">
              <h3 className="font-bold text-lg mb-2">1. What documents do I need to rent a car?</h3>
              <p className="text-gray-600">
                You will need a valid driver's license from your home country, a major credit card in the renter's name,
                and proof of identity (like a passport or national ID card).
              </p>
            </Card>

            <Card className="bg-white p-6 rounded-xl">
              <h3 className="font-bold text-lg mb-2">2. What is the minimum age to rent a vehicle?</h3>
              <p className="text-gray-600">
                The minimum age to rent is 21 years old. Renters under the age of 25 may be subject to a daily young
                driver surcharge.
              </p>
            </Card>
          </section>

          {/* Payment & Fees */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold mb-8">Payment & Fees</h2>

            <Card className="bg-white p-6 rounded-xl mb-4">
              <h3 className="font-bold text-lg mb-2">3. What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept payment by El dhahabia card. Debit cards may be accepted under certain conditions, please
                check our full Rental Policy for details.
              </p>
            </Card>

            <Card className="bg-white p-6 rounded-xl">
              <h3 className="font-bold text-lg mb-2">4. What is the security deposit for?</h3>
              <p className="text-gray-600">
                A security deposit is temporarily held on your credit card to cover potential incidentals like fuel
                replacement, excess mileage fees, or minor damages not covered by insurance. The hold is released upon
                the vehicle's safe return.
              </p>
            </Card>
          </section>

          {/* Vehicle Use & Return */}
          <section className="mb-16">
            <h2 className="text-4xl font-bold mb-8">Vehicle Use & Return</h2>

            <Card className="bg-white p-6 rounded-xl mb-4">
              <h3 className="font-bold text-lg mb-2">
                5. Can I pick up the car in one city and drop it off in another?
              </h3>
              <p className="text-gray-600">
                Yes, we offer one-way rentals between select RentoGo locations. A one-way fee will apply and is
                calculated during the booking process.
              </p>
            </Card>

            <Card className="bg-white p-6 rounded-xl">
              <h3 className="font-bold text-lg mb-2">6. What is your policy on late returns?</h3>
              <p className="text-gray-600">
                We allow a grace period of 59 minutes past the scheduled return time. Returns exceeding this grace
                period may incur an additional full-day rental charge.
              </p>
            </Card>
          </section>

          {/* Support CTA */}
          <Card className="bg-gray-100 p-8 rounded-xl text-center">
            <p className="text-lg mb-4">
              Can't find your answer?{" "}
              <a href="/client/contact" className="text-red-600 font-semibold hover:underline">
                Contact our support team
              </a>{" "}
              for personalized help!
            </p>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
