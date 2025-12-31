"use client"

import { useState } from "react"
import Header from "@/components/Client/Header"
import ClientFooter from "@/components/Client/Footer"
import HeroBackground from "@/components/HeroBackground"
import heroCar from "@/assets/car_home.png"
import traceCar from "@/assets/car_trace.png"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Save, X, Plus, Trash2 } from "lucide-react"
import { useRentalData } from "@/contexts/RentalDataContext"

export default function ClientRentalPolicy() {
  const { policySections, updatePolicy } = useRentalData()
  const [isEditing, setIsEditing] = useState(false)
  const [editedSections, setEditedSections] = useState(policySections)

  const handleAddItem = (sectionIndex: number) => {
    const newSections = [...editedSections]
    newSections[sectionIndex].items.push("")
    setEditedSections(newSections)
  }

  const handleDeleteItem = (sectionIndex: number, itemIndex: number) => {
    const newSections = [...editedSections]
    newSections[sectionIndex].items.splice(itemIndex, 1)
    setEditedSections(newSections)
  }

  const handleUpdateItem = (sectionIndex: number, itemIndex: number, value: string) => {
    const newSections = [...editedSections]
    newSections[sectionIndex].items[itemIndex] = value
    setEditedSections(newSections)
  }

  const handleSave = () => {
    updatePolicy(editedSections)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedSections(policySections)
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">

        <HeroBackground trace={traceCar} car={heroCar}>
          <div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`mb-6 p-3 rounded-lg backdrop-blur-sm transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg ${
                isEditing 
                  ? "bg-[#D32F2F] text-white ring-2 ring-white/50" 
                  : "bg-white text-[#D32F2F] hover:bg-gray-100"
              }`}
            >
              {isEditing ? (
                <>
                  <X className="w-6 h-6" />
                  <span>Discard Changes</span>
                </>
              ) : (
                <>
                  <Edit className="w-6 h-6" />
                  <span>Edit Policy</span>
                </>
              )}
            </button>
            <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4 leading-tight text-white">
              Official RentoGo <span className="text-[#D32F2F]">Rental Policy</span>
            </h1>
            <p className="text-lg text-white/80 leading-relaxed max-w-md">
              {isEditing
                ? "Edit the rental policy below. Changes will be reflected on the customer side."
                : "Please review our full terms and conditions before confirming your reservation."}
            </p>
          </div>
        </HeroBackground>


        <div className="py-12 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <Card className="bg-gray-100 p-6 rounded-xl mb-8 border border-border">
              <p className="text-sm text-muted-foreground">
                *Last Updated:{" "}
                {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}. This
                policy is subject to change without prior notice.
              </p>
            </Card>

            <div className="space-y-8">
              {editedSections.map((section, sectionIdx) => (
                <section key={section.id} className="space-y-4">
                  <h2 className="text-3xl font-bold">{section.section}</h2>

                  {isEditing ? (
                    <div className="space-y-3">
                      {section.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex gap-3 items-start">
                          <textarea
                            value={item}
                            onChange={(e) => handleUpdateItem(sectionIdx, itemIdx, e.target.value)}
                            className="flex-1 p-3 border border-border rounded-lg text-sm font-sans bg-white focus:outline-none focus:ring-2 focus:ring-[#D32F2F]"
                            rows={2}
                            placeholder="Enter policy item"
                          />
                          <button
                            onClick={() => handleDeleteItem(sectionIdx, itemIdx)}
                            className="mt-1 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddItem(sectionIdx)}
                        className="mt-2 flex items-center gap-2 text-[#D32F2F] hover:text-red-700 font-semibold"
                      >
                        <Plus className="w-4 h-4" />
                        Add Item
                      </button>
                    </div>
                  ) : (
                    <ul className="space-y-3 list-disc list-inside text-muted-foreground">
                      {section.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>


            <div className="flex gap-4 justify-end mt-12">
              {isEditing && (
                <>
                  <Button variant="outline" size="lg" className="px-8 bg-transparent" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button size="lg" className="bg-[#D32F2F] hover:bg-red-700 text-white px-8" onClick={handleSave}>
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <ClientFooter />
    </div>
  )
}
