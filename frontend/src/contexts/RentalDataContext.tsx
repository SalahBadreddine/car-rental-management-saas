"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

export interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

export interface PolicySection {
  id: string
  section: string
  items: string[]
}

export interface RentalData {
  faqItems: FAQItem[]
  policySections: PolicySection[]
}

interface RentalDataContextType {
  faqItems: FAQItem[]
  policySections: PolicySection[]
  addFAQ: (item: FAQItem) => void
  updateFAQ: (id: string, item: Partial<FAQItem>) => void
  deleteFAQ: (id: string) => void
  updatePolicy: (sections: PolicySection[]) => void
}

const RentalDataContext = createContext<RentalDataContextType | undefined>(undefined)

export function RentalDataProvider({ children }: { children: React.ReactNode }) {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([
    {
      id: "1",
      question: "What documents do I need to rent a car?",
      answer:
        "You will need a valid driver's license from your home country, a major credit card in the renter's name, and proof of identity (like a passport or national ID card).",
      category: "Booking & Reservations",
    },
    {
      id: "2",
      question: "What is the minimum age to rent a vehicle?",
      answer:
        "The minimum age to rent is 21 years old. Renters under the age of 25 may be subject to a daily young driver surcharge.",
      category: "Booking & Reservations",
    },
    {
      id: "3",
      question: "What payment methods do you accept?",
      answer:
        "We accept payment by El dhahabia card. Debit cards may be accepted under certain conditions, please check our full Rental Policy for details.",
      category: "Payment & Fees",
    },
    {
      id: "4",
      question: "What is the security deposit for?",
      answer:
        "A security deposit is temporarily held on your credit card to cover potential incidentals like fuel replacement, excess mileage fees, or minor damages not covered by insurance. The hold is released upon the vehicle's safe return.",
      category: "Payment & Fees",
    },
    {
      id: "5",
      question: "Can I pick up the car in one city and drop it off in another?",
      answer:
        "Yes, we offer one-way rentals between select RentoGo locations. A one-way fee will apply and is calculated during the booking process.",
      category: "Vehicle Use & Return",
    },
    {
      id: "6",
      question: "What is your policy on late returns?",
      answer:
        "We allow a grace period of 59 minutes past the scheduled return time. Returns exceeding this grace period may incur an additional full-day rental charge.",
      category: "Vehicle Use & Return",
    },
  ])

  const [policySections, setPolicySections] = useState<PolicySection[]>([
    {
      id: "policy-1",
      section: "1. Renter Requirements",
      items: [
        "**Minimum Age:** The primary renter must be 21 years of age or older. A daily surcharge of $25 applies to renters aged 21-24.",
        "**Driver's License:** A valid, non-expired driver's license, held for at least one year, must be presented at the time of rental.",
        "**Payment Method:** A major credit card (Visa, MasterCard, Amex) in the primary renter's name is required for both the rental charges and the security deposit.",
      ],
    },
    {
      id: "policy-2",
      section: "2. Payments and Deposits",
      items: [
        "**Security Deposit:** A refundable security deposit of $200 to $500 (depending on vehicle class) will be authorized on the credit card at pickup. This amount will be released upon the satisfactory return of the vehicle.",
        "**Taxes and Fees:** All quoted rental prices are exclusive of local taxes, airport surcharges, and licensing fees, which will be itemized on the final invoice.",
        "**Payment Timing:** The estimated total rental charges must be paid in full at the time of vehicle pickup.",
      ],
    },
    {
      id: "policy-3",
      section: "3. Insurance and Liability",
      items: [
        "**Basic Coverage:** Standard state-mandated minimum liability insurance is included in the rental price.",
        "**Collision Damage Waiver (CDW):** Available for purchase. Reduces the renter's financial responsibility for damage to the RentoGo vehicle.",
        "**Supplemental Liability Insurance (SLI):** Available for purchase. Provides additional liability protection up to $1 million.",
      ],
    },
    {
      id: "policy-4",
      section: "4. Fuel and Mileage",
      items: [
        "**Fuel Policy:** Vehicles are provided with a full tank of fuel and must be returned full. If not returned full, a refueling fee plus the cost of the missing fuel will be charged at the current market rate.",
        "**Mileage:** Most rentals include unlimited mileage. Please confirm the specific mileage terms for premium and luxury vehicles, as limits may apply.",
      ],
    },
    {
      id: "policy-5",
      section: "5. Cancellation Policy",
      items: [
        "**Cancellations 48+ Hours Prior:** Full refund of any prepaid amount.",
        "**Cancellations Less Than 48 Hours Prior:** A cancellation fee equivalent to one day's rental rate will be charged.",
        '**No-Show:** If the renter fails to pick up the vehicle on the reserved date without prior notice, a "No-Show" fee equivalent to the full reservation cost (up to 3 days) will be charged.',
      ],
    },
  ])

  const addFAQ = useCallback((item: FAQItem) => {
    setFaqItems((prev) => [...prev, { ...item, id: Date.now().toString() }])
    // TODO: API call to persist FAQ
  }, [])

  const updateFAQ = useCallback((id: string, updates: Partial<FAQItem>) => {
    setFaqItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
    // TODO: API call to persist FAQ
  }, [])

  const deleteFAQ = useCallback((id: string) => {
    setFaqItems((prev) => prev.filter((item) => item.id !== id))
    // TODO: API call to persist FAQ
  }, [])

  const updatePolicy = useCallback((sections: PolicySection[]) => {
    setPolicySections(sections)
    // TODO: API call to persist policy
  }, [])

  return (
    <RentalDataContext.Provider value={{ faqItems, policySections, addFAQ, updateFAQ, deleteFAQ, updatePolicy }}>
      {children}
    </RentalDataContext.Provider>
  )
}

export function useRentalData() {
  const context = useContext(RentalDataContext)
  if (!context) {
    throw new Error("useRentalData must be used within RentalDataProvider")
  }
  return context
}
