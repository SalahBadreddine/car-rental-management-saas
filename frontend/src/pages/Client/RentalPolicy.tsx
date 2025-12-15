import Header from "@/components/Client/Header"
import Footer from "@/components/Footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"

export default function ClientRentalPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero Banner */}
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
                Official RentoGo <span className="text-red-600">Rental Policy</span>
              </h1>
              <p className="text-white/90 text-lg max-w-md">
                Please review our full terms and conditions before confirming your reservation.
              </p>
            </div>
          </Card>
        </div>

        {/* Policy Content */}
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Card className="bg-gray-100 p-6 rounded-xl mb-8">
            <p className="text-sm text-gray-700">
              *Last Updated: November 22, 2025. This policy is subject to change without prior notice. Please refer to
              your physical rental agreement for the final binding terms.
            </p>
          </Card>

          {/* 1. Renter Requirements */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">1. Renter Requirements</h2>
            <ul className="space-y-4 list-disc list-inside text-gray-700">
              <li>
                <strong>**Minimum Age:**</strong> The primary renter must be 21 years of age or older. A daily surcharge
                of \$25 applies to renters aged 21-24.
              </li>
              <li>
                <strong>**Driver's License:**</strong> A valid, non-expired driver's license, held for at least one
                year, must be presented at the time of rental. International renters must also present a valid passport.
              </li>
              <li>
                <strong>**Payment Method:**</strong> A major credit card (Visa, MasterCard, Amex) in the primary
                renter's name is required for both the rental charges and the security deposit.
              </li>
            </ul>
          </section>

          {/* 2. Payments and Deposits */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">2. Payments and Deposits</h2>
            <ul className="space-y-4 list-disc list-inside text-gray-700">
              <li>
                <strong>**Security Deposit:**</strong> A refundable security deposit of \$200 to \$500 (depending on
                vehicle class) will be authorized on the credit card at pickup. This amount will be released upon the
                satisfactory return of the vehicle.
              </li>
              <li>
                <strong>**Taxes and Fees:**</strong> All quoted rental prices are exclusive of local taxes, airport
                surcharges, and licensing fees, which will be itemized on the final invoice.
              </li>
              <li>
                <strong>**Payment Timing:**</strong> The estimated total rental charges must be paid in full at the time
                of vehicle pickup.
              </li>
            </ul>
          </section>

          {/* 3. Insurance and Liability */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">3. Insurance and Liability</h2>
            <p className="text-gray-700 mb-4">
              The renter is responsible for all damage, loss, or theft of the rental vehicle. RentoGo offers several
              optional protection packages:
            </p>
            <ul className="space-y-4 list-disc list-inside text-gray-700">
              <li>
                <strong>**Basic Coverage:**</strong> Standard state-mandated minimum liability insurance is included in
                the rental price.
              </li>
              <li>
                <strong>**Collision Damage Waiver (CDW):**</strong> Available for purchase. Reduces the renter's
                financial responsibility for damage to the RentoGo vehicle.
              </li>
              <li>
                <strong>**Supplemental Liability Insurance (SLI):**</strong> Available for purchase. Provides additional
                liability protection up to \$1 million.
              </li>
            </ul>
          </section>

          {/* 4. Fuel and Mileage */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">4. Fuel and Mileage</h2>
            <ul className="space-y-4 list-disc list-inside text-gray-700">
              <li>
                <strong>**Fuel Policy:**</strong> Vehicles are provided with a full tank of fuel and must be returned
                full. If not returned full, a refueling fee plus the cost of the missing fuel will be charged at the
                current market rate.
              </li>
              <li>
                <strong>**Mileage:**</strong> Most rentals include unlimited mileage. Please confirm the specific
                mileage terms for premium and luxury vehicles, as limits may apply.
              </li>
            </ul>
          </section>

          {/* 5. Cancellation Policy */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">5. Cancellation Policy</h2>
            <ul className="space-y-4 list-disc list-inside text-gray-700">
              <li>
                <strong>**Cancellations 48+ Hours Prior:**</strong> Full refund of any prepaid amount.
              </li>
              <li>
                <strong>**Cancellations Less Than 48 Hours Prior:**</strong> A cancellation fee equivalent to one day's
                rental rate will be charged.
              </li>
              <li>
                <strong>**No-Show:**</strong> If the renter fails to pick up the vehicle on the reserved date without
                prior notice, a "No-Show" fee equivalent to the full reservation cost (up to 3 days) will be charged.
              </li>
            </ul>
          </section>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end mt-12">
            <Button variant="outline" size="lg" className="px-8 bg-transparent">
              Cancel
            </Button>
            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8">
              Save
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
