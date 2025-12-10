import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Vehicles from "./pages/Vehicles";
import CarDetails from "./pages/CarDetails";
import CompareCars from "./pages/CompareCars";
import RentCar from "./pages/RentCar";
import Payment from "./pages/Payment";
import ConfirmationCode from "./pages/ConfirmationCode";
import ReservationConfirmation from "./pages/ReservationConfirmation";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import RentalPolicy from "./pages/RentalPolicy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicles/:id" element={<CarDetails />} />
          <Route path="/compare" element={<CompareCars />} />
          <Route path="/rent/:id" element={<RentCar />} />
          <Route path="/rent/payment" element={<Payment />} />
          <Route path="/rent/confirm-code" element={<ConfirmationCode />} />
          <Route path="/rent/confirmation" element={<ReservationConfirmation />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/rental-policy" element={<RentalPolicy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
