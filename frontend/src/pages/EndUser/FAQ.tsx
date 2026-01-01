import Header from "@/components/Header"
import Footer from "@/components/Footer"
import HeroBackground from "@/components/HeroBackground"
import heroCar from "@/assets/car_home.png"
import traceCar from "@/assets/car_trace.png"
import { Card } from "@/components/ui/card"
import { RentalDataProvider, useRentalData } from "@/contexts/RentalDataContext"

function EndUserFAQContent() {
  const { faqItems } = useRentalData()

  const categories = ["Booking & Reservations", "Payment & Fees", "Vehicle Use & Return"]

  const faqByCategory = categories.reduce(
    (acc, cat) => {
      acc[cat] = faqItems.filter((item) => item.category === cat)
      return acc
    },
    {} as Record<string, typeof faqItems>,
  )

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">

        <HeroBackground trace={traceCar} car={heroCar}>
          <div>
            <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4 leading-tight text-white">
              Frequently Asked
              <br />
              <span className="text-[#D32F2F]">Questions</span>
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              Find quick answers to the most common questions about booking, payments, and our vehicles.
            </p>
          </div>
        </HeroBackground>


        <div className="py-12 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="space-y-12">
              {categories.map((category) => (
                <section key={category}>
                  <h2 className="font-heading text-3xl font-bold mb-6">{category}</h2>
                  <div className="space-y-4">
                    {faqByCategory[category].map((item) => (
                      <Card key={item.id} className="bg-white p-6 rounded-xl border border-border">
                        <h3 className="font-bold text-lg mb-2">{item.question}</h3>
                        <p className="text-muted-foreground">{item.answer}</p>
                      </Card>
                    ))}
                  </div>
                </section>
              ))}
            </div>


            <Card className="bg-gray-100 p-8 rounded-xl text-center border border-border mt-12">
              <p className="text-lg mb-4">
                Can't find your answer?{" "}
                <a href="/enduser/contact" className="text-[#D32F2F] font-semibold hover:underline">
                  Contact our support team
                </a>{" "}
                for personalized help!
              </p>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function EndUserFAQPage() {
  return (
    <RentalDataProvider>
      <EndUserFAQContent />
    </RentalDataProvider>
  )
}
