import { Car } from "@/types/car";

export const cars: Car[] = [
  { id: 1, brand: "Mercedes", type: "Sedan", price: 25, transmission: "Automatic", fuel: "PB 95", ac: true, seats: 5, year: 2023, mileage: 15000, color: "Black" },
  { id: 2, brand: "Mercedes", type: "Sedan", price: 25, transmission: "Automatic", fuel: "PB 95", ac: true, seats: 5, year: 2023, mileage: 12000, color: "Silver" },
  { id: 3, brand: "Mercedes", type: "Sedan", price: 25, transmission: "Automatic", fuel: "PB 95", ac: true, seats: 5, year: 2022, mileage: 18000, color: "White" },
  { id: 4, brand: "Porsche", type: "SUV", price: 40, transmission: "Automatic", fuel: "PB 95", ac: true, seats: 7, year: 2024, mileage: 8000, color: "Blue" },
  { id: 5, brand: "Toyota", type: "Sedan", price: 35, transmission: "Manual", fuel: "PB 95", ac: true, seats: 5, year: 2023, mileage: 20000, color: "Red" },
  { id: 6, brand: "Porsche", type: "SUV", price: 50, transmission: "Automatic", fuel: "PB 95", ac: true, seats: 7, year: 2024, mileage: 5000, color: "Black" },
  { id: 7, brand: "Mercedes", type: "Van", price: 50, transmission: "Automatic", fuel: "PB 95", ac: true, seats: 8, year: 2023, mileage: 22000, color: "White" },
  { id: 8, brand: "Toyota", type: "Sport", price: 60, transmission: "Manual", fuel: "PB 95", ac: true, seats: 4, year: 2024, mileage: 10000, color: "Yellow" },
  { id: 9, brand: "Maybach", type: "Sedan", price: 70, transmission: "Automatic", fuel: "PB 95", ac: true, seats: 5, year: 2024, mileage: 3000, color: "Black" },
];

export const brands = ["Toyota", "Ford", "Mercedes", "BMW", "Jeep", "Audi"];

export const carTypes: Array<{ value: string; label: string; icon: string }> = [
  { value: "Cabriolet", label: "Cabriolet", icon: "🚗" },
  { value: "Pickup", label: "Pickup", icon: "🚚" },
  { value: "Sedan", label: "Sedan", icon: "🚙" },
  { value: "SUV", label: "SUV", icon: "🚙" },
  { value: "Minivan", label: "Minivan", icon: "🚐" },
];

