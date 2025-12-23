"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import HeroBackground from "@/components/HeroBackground"
import heroCar from "@/assets/car_home.png"
import traceCar from "@/assets/car_trace.png"
import { Card } from "@/components/ui/card"
import { RentalDataProvider, useRentalData } from "@/contexts/RentalDataContext"

const RentalPolicy = () => {
  const { policySections } = useRentalData()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <HeroBackground trace={traceCar} car={heroCar}>
        <div>
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4 leading-tight text-white">
            Official RentoGo <span className="text-[#D32F2F]">Rental Policy</span>
          </h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-md">
            Please review our full terms and conditions before confirming your reservation.
          </p>
        </div>
      </HeroBackground>

      {/* Main Content */}
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="bg-gray-100 p-6 rounded-xl mb-8 border border-border">
            <p className="text-sm text-muted-foreground">
              *Last Updated:{" "}
              {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}. This policy
              is subject to change without prior notice.
            </p>
          </Card>

          <div className="space-y-8">
            {policySections.map((section) => (
              <div key={section.id} className="space-y-4">
                <h2 className="text-3xl font-bold">{section.section}</h2>
                <ul className="space-y-3 list-disc list-inside text-muted-foreground">
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function EndUserRentalPolicyPage() {
  return (
    <RentalDataProvider>
      <RentalPolicy />
    </RentalDataProvider>
  )
}
