export interface Car {
  id: number;
  brand: string;
  type: string;
  price: number;
  transmission: "Automatic" | "Manual";
  fuel: string;
  ac: boolean;
  image?: string;
  description?: string;
  seats?: number;
  year?: number;
  mileage?: number;
  color?: string;
  location?: string;
}

export type CarType = "Cabriolet" | "Pickup" | "Sedan" | "SUV" | "Minivan" | "Sport" | "Van";

export interface CarFilters {
  search: string;
  brand: string | null;
  type: CarType | null;
  startingPrice: number | null;
  endingPrice: number | null;
  location: string | null;
}

