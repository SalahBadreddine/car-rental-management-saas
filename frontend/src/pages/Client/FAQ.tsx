"use client"

import { useState } from "react"
import Header from "@/components/Client/Header"
import ClientFooter from "@/components/Client/Footer"
import HeroBackground from "@/components/HeroBackground"
import heroCar from "@/assets/car_home.png"
import traceCar from "@/assets/car_trace.png"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Save, Plus, Trash2, X } from "lucide-react"
import { useRentalData, type FAQItem } from "@/contexts/RentalDataContext"

export default function ClientFAQ() {
  const { faqItems, addFAQ, updateFAQ, deleteFAQ } = useRentalData()
  const [isEditing, setIsEditing] = useState(false)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newFAQ, setNewFAQ] = useState({ question: "", answer: "", category: "" })
  const [editingIds, setEditingIds] = useState<Set<string>>(new Set())

  const categories = ["Booking & Reservations", "Payment & Fees", "Vehicle Use & Return"]

  const handleAddNew = () => {
    if (newFAQ.question && newFAQ.answer && newFAQ.category) {
      const item: FAQItem = {
        id: Date.now().toString(),
        question: newFAQ.question,
        answer: newFAQ.answer,
        category: newFAQ.category,
      }
      addFAQ(item)
      setNewFAQ({ question: "", answer: "", category: "" })
      setIsAddingNew(false)
    }
  }

  const toggleEditMode = (id: string) => {
    const newSet = new Set(editingIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setEditingIds(newSet)
  }

  const handleSaveEdit = (id: string, question: string, answer: string) => {
    updateFAQ(id, { question, answer })
    toggleEditMode(id)
  }

  const faqByCategory = categories.reduce(
    (acc, cat) => {
      acc[cat] = faqItems.filter((item) => item.category === cat)
      return acc
    },
    {} as Record<string, FAQItem[]>,
  )

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
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
                  <span>Exit Editing</span>
                </>
              ) : (
                <>
                  <Edit className="w-6 h-6" />
                  <span>Edit Content</span>
                </>
              )}
            </button>
            <h1 className="font-heading text-5xl md:text-6xl font-bold mb-4 leading-tight text-white">
              Frequently Asked
              <br />
              <span className="text-[#D32F2F]">Questions</span>
            </h1>
            <p className="text-lg text-white/80 leading-relaxed max-w-md">
              {isEditing
                ? "Manage FAQs that will be shown to customers."
                : "Find quick answers to the most common questions about booking, payments, and our vehicles."}
            </p>
          </div>
        </HeroBackground>

        {/* FAQ Content */}
        <div className="py-12 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Add New FAQ Button */}
            {isEditing && (
              <Button
                onClick={() => setIsAddingNew(!isAddingNew)}
                className="mb-8 bg-[#D32F2F] hover:bg-red-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New FAQ
              </Button>
            )}

            {/* Add New FAQ Form */}
            {isAddingNew && (
              <Card className="bg-white p-6 rounded-xl mb-8 border-2 border-[#D32F2F]">
                <h3 className="text-xl font-bold mb-4">Add New FAQ Item</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Category</label>
                    <select
                      value={newFAQ.category}
                      onChange={(e) => setNewFAQ({ ...newFAQ, category: e.target.value })}
                      className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D32F2F]"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Question</label>
                    <input
                      type="text"
                      value={newFAQ.question}
                      onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                      placeholder="Enter the question"
                      className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D32F2F]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Answer</label>
                    <textarea
                      value={newFAQ.answer}
                      onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                      placeholder="Enter the answer"
                      className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D32F2F]"
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddingNew(false)
                        setNewFAQ({ question: "", answer: "", category: "" })
                      }}
                    >
                      Cancel
                    </Button>
                    <Button className="bg-[#D32F2F] hover:bg-red-700 text-white" onClick={handleAddNew}>
                      Add FAQ
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* FAQ Sections */}
            <div className="space-y-12">
              {categories.map((category) => (
                <section key={category}>
                  <h2 className="text-3xl font-bold mb-6">{category}</h2>
                  <div className="space-y-4">
                    {faqByCategory[category].map((item) => (
                      <Card key={item.id} className="bg-white p-6 rounded-xl border border-border">
                        {editingIds.has(item.id) ? (
                          <div className="space-y-4">
                            <input
                              type="text"
                              defaultValue={item.question}
                              className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D32F2F] font-semibold"
                              id={`q-${item.id}`}
                            />
                            <textarea
                              defaultValue={item.answer}
                              className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D32F2F]"
                              rows={3}
                              id={`a-${item.id}`}
                            />
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => toggleEditMode(item.id)}>
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                className="bg-[#D32F2F] hover:bg-red-700 text-white"
                                onClick={() => {
                                  const qInput = document.getElementById(`q-${item.id}`) as HTMLInputElement
                                  const aInput = document.getElementById(`a-${item.id}`) as HTMLTextAreaElement
                                  handleSaveEdit(item.id, qInput.value, aInput.value)
                                }}
                              >
                                <Save className="w-4 h-4 mr-1" />
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h3 className="font-bold text-lg mb-2">{item.question}</h3>
                            <p className="text-muted-foreground mb-4">{item.answer}</p>
                            {isEditing && (
                              <div className="flex gap-2 mt-4">
                                <Button size="sm" variant="outline" onClick={() => toggleEditMode(item.id)}>
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:bg-red-50 bg-transparent"
                                  onClick={() => deleteFAQ(item.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </Card>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </main>

      <ClientFooter />
    </div>
  )
}
