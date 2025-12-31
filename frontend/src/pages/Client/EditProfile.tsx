"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Header from "@/components/Client/Header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Phone, Mail, MapPin } from "lucide-react"
import ClientFooter from "@/components/Client/Footer"

export default function ClientEditProfile() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    companyName: "RentoGo",
    phone: "+537 547-6401",
    email: "nwiger@yahoo.com",
    address: "Oxford Ave. Cary, NC 27511",
    oldPassword: "",
    newPassword: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    navigate("/client/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <Card className="bg-black text-white p-12 rounded-xl relative overflow-hidden">
          <div
            className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10"
            style={{
              backgroundImage: 'url("/placeholder.svg?height=400&width=800")',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-12">Edit Personal Information :</h1>

            <form onSubmit={handleSubmit} className="space-y-8">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="bg-white/10 rounded-lg p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                      <span className="text-2xl">🏢</span>
                    </div>
                    <Input
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="bg-transparent border-none text-white placeholder:text-white/60 focus-visible:ring-0"
                      placeholder="Company Name"
                    />
                  </div>
                </div>

                <div>
                  <div className="bg-white/10 rounded-lg p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#DC2626] rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white/60 text-sm mb-1">Phone</p>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-transparent border-none text-white p-0 h-auto focus-visible:ring-0"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="bg-white/10 rounded-lg p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#DC2626] rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white/60 text-sm mb-1">Email</p>
                      <Input
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-transparent border-none text-white p-0 h-auto focus-visible:ring-0"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="bg-white/10 rounded-lg p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#DC2626] rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white/60 text-sm mb-1">Address</p>
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="bg-transparent border-none text-white p-0 h-auto focus-visible:ring-0"
                      />
                    </div>
                  </div>
                </div>
              </div>


              <div className="pt-8">
                <h2 className="text-3xl font-bold mb-6">Edit Password</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm mb-2">Old Password</label>
                    <Input
                      type="password"
                      placeholder="password"
                      value={formData.oldPassword}
                      onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">New Password</label>
                    <Input
                      type="password"
                      placeholder="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>
              </div>


              <div className="flex justify-end pt-6">
                <Button type="submit" className="bg-[#DC2626] hover:bg-[#B71C1C] text-white px-12 py-6 text-lg h-auto">
                  Confirm changes
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </main>

      <ClientFooter />
    </div>
  )
}
