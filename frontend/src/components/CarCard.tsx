import { Button } from "@/components/ui/button";

const CarCard = ({ image, name, price }) => {
  return (
    <div className="car-card-wrapper">
      
      <div className="car-card">
        <div className="car-card-content">
          <div className="car-image-container -translate-y-12">
            <img src={image} alt={name} className="car-image" />
          </div>
          
          <h3 className="car-name">{name}</h3>
          
          <div className="car-price">
            <span className="price-text">From ${price}</span>
          </div>
          
          <div className="car-button-container">
            <Button className="bg-red-600 hover:bg-red-700 text-white font-semibold p-7 rounded-lg text-base shadow-lg transition-all translate-y-12">
              Book now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarCard;