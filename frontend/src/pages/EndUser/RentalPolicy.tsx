import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroBackground from "@/components/HeroBackground";
import { Button } from "@/components/ui/button";
import heroCar from "@/assets/hero-car.jpg";
import traceCar from "@/assets/car_trace.png";

const RentalPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <HeroBackground trace={traceCar} car={heroCar}>
        <div>
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4 leading-tight text-white">
            Official RentoGo{" "}
            <span className="text-[#D32F2F]">Rental Policy</span>
          </h1>
          <p className="text-lg text-white/80 leading-relaxed">
            Please review our full terms and conditions before confirming your reservation.
          </p>
        </div>
      </HeroBackground>

      {/* Main Content */}
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-sm text-muted-foreground mb-8 italic">
            *Last Updated: November 22, 2025. This policy is subject to change without prior notice. 
            Please refer to your physical rental agreement for the final binding terms.
          </p>

          <div className="space-y-8">
            {/* Section 1 */}
            <div>
              <h2 className="font-heading text-2xl font-bold mb-4">1. Renter Requirements</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-[#D32F2F] font-bold">•</span>
                  <span><strong>Minimum Age:</strong> 21 years or older. Renters aged 21-24 will incur a $25 surcharge per rental.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D32F2F] font-bold">•</span>
                  <span><strong>Driver's License:</strong> A valid, non-expired driver's license held for at least one year is required. International renters must present a valid passport in addition to their license.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D32F2F] font-bold">•</span>
                  <span><strong>Payment Method:</strong> A major credit card in the primary renter's name is required for deposit and payment.</span>
                </li>
              </ul>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="font-heading text-2xl font-bold mb-4">2. Payments and Deposits</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-[#D32F2F] font-bold">•</span>
                  <span><strong>Security Deposit:</strong> A security deposit ranging from $200 to $500 (depending on vehicle class) will be authorized at pickup and released upon return, subject to vehicle inspection.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D32F2F] font-bold">•</span>
                  <span><strong>Taxes and Fees:</strong> All quoted prices are exclusive of applicable taxes, fees, and surcharges, which will be itemized on your final invoice.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D32F2F] font-bold">•</span>
                  <span><strong>Payment Timing:</strong> Estimated total rental charges must be paid in full at pickup.</span>
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="font-heading text-2xl font-bold mb-4">3. Insurance and Liability</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-[#D32F2F] font-bold">•</span>
                  <span><strong>Renter Responsibility:</strong> The renter is financially responsible for any damage, loss, or theft of the vehicle during the rental period.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D32F2F] font-bold">•</span>
                  <span><strong>Basic Coverage:</strong> State-mandated minimum liability insurance is included with all rentals.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D32F2F] font-bold">•</span>
                  <span><strong>Collision Damage Waiver (CDW):</strong> Available for purchase to reduce your financial responsibility in the event of damage.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D32F2F] font-bold">•</span>
                  <span><strong>Supplemental Liability Insurance (SLI):</strong> Available for purchase, providing up to $1 million in additional liability protection.</span>
                </li>
              </ul>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="font-heading text-2xl font-bold mb-4">4. Fuel and Mileage</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-[#D32F2F] font-bold">•</span>
                  <span><strong>Fuel Policy:</strong> Vehicles are provided with a full tank and must be returned full. If returned with less fuel, a refueling fee plus the cost of fuel will be charged.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D32F2F] font-bold">•</span>
                  <span><strong>Mileage Policy:</strong> Most rentals include unlimited mileage. Premium and luxury vehicles may have specific mileage terms outlined in your rental agreement.</span>
                </li>
              </ul>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="font-heading text-2xl font-bold mb-4">5. Cancellation Policy</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-[#D32F2F] font-bold">•</span>
                  <span><strong>48+ Hours Prior:</strong> Full refund for cancellations made 48 hours or more before the scheduled pickup time.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D32F2F] font-bold">•</span>
                  <span><strong>Less Than 48 Hours:</strong> A cancellation fee equivalent to one day's rental rate will be charged.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D32F2F] font-bold">•</span>
                  <span><strong>No-Show:</strong> Failure to pick up the vehicle without prior notice will result in a "No-Show" fee equivalent to the full reservation cost (up to 3 days).</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RentalPolicy;

