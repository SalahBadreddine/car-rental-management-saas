"use client"

import { Button } from "@/components/ui/button"
import { useNavigate, useParams } from "react-router-dom"

const CarCard = ({ image, name, price, carId }: { image: string; name: string; price: string; carId?: string | number }) => {
  const navigate = useNavigate()
  const { tenantSlug } = useParams()

  const handleBookNow = () => {
    navigate(`/${tenantSlug || 'client'}/vehicles/${carId}`)
  }

  return (
    <div className="car-card-wrapper">
      <div className="car-card">
        <div className="car-card-content">
          <div className="car-image-container -translate-y-12">
            <img src={image || "/placeholder.svg"} alt={name} className="car-image rounded-xl" />
          </div>

          <h3 className="car-name">{name}</h3>

          <div className="car-price">
            <span className="price-text">From {price} DZD</span>
          </div>

          <div className="car-button-container">
            <Button
              onClick={handleBookNow}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold p-7 rounded-lg text-base shadow-lg transition-all translate-y-12"
            >
              Book now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CarCard
