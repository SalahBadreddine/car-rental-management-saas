import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"
import VerifyEmail from "./pages/VerifyEmail"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import ClientVehicle from "./pages/Client/Vehicle"
import CompareCars from "./pages/CompareCars"
import RentCar from "./pages/RentCar"
import Payment from "./pages/Payment"
import ConfirmationCode from "./pages/ConfirmationCode"
import ReservationConfirmation from "./pages/ReservationConfirmation"
import About from "./pages/About"
import Contact from "./pages/Contact"
import Profile from "./pages/Profile"
import EditProfile from "./pages/EditProfile"
import RentalPolicy from "./pages/RentalPolicy"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import ClientDashboard from "./pages/Client/Dashboard"
import ClientReservations from "./pages/Client/Reservations"
import ReservationDetails from "./pages/Client/ReservationDetails"
import ClientVehicleDetails from "./pages/Client/VehicleDetails"
import EditVehicle from "./pages/Client/EditVehicle"
import AddVehicle from "./pages/Client/AddVehicle"
import ClientEditProfile from "./pages/Client/EditProfile"
import ClientAbout from "./pages/Client/About"
import ClientContact from "./pages/Client/Contact"
import ClientHome from "./pages/Client/Home"
import ClientRentalPolicy from "./pages/Client/RentalPolicy"
import ClientNotifications from "./pages/Client/Notifications"
import ClientFAQ from "./pages/Client/FAQ"

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/client/home" replace />
              </ProtectedRoute>
            }
          />

          {/* Auth pages */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/client/home"
            element={
              <ProtectedRoute>
                <ClientHome />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/faq"
            element={
              <ProtectedRoute>
                <ClientFAQ />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/dashboard"
            element={
              <ProtectedRoute>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/vehicles"
            element={
              <ProtectedRoute>
                <ClientVehicle />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/vehicles/:id"
            element={
              <ProtectedRoute>
                <ClientVehicleDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/vehicles/:id/edit"
            element={
              <ProtectedRoute>
                <EditVehicle />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/add-vehicle"
            element={
              <ProtectedRoute>
                <AddVehicle />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/reservations"
            element={
              <ProtectedRoute>
                <ClientReservations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/reservations/:id"
            element={
              <ProtectedRoute>
                <ReservationDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/profile/edit"
            element={
              <ProtectedRoute>
                <ClientEditProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/about"
            element={
              <ProtectedRoute>
                <ClientAbout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/contact"
            element={
              <ProtectedRoute>
                <ClientContact />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/rental-policy"
            element={
              <ProtectedRoute>
                <ClientRentalPolicy />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/notifications"
            element={
              <ProtectedRoute>
                <ClientNotifications />
              </ProtectedRoute>
            }
          />

          {/* End user portal routes */}
          <Route path="/enduser/compare" element={<CompareCars />} />
          <Route path="/enduser/rent/:id" element={<RentCar />} />
          <Route path="/enduser/payment" element={<Payment />} />
          <Route path="/enduser/confirm-code" element={<ConfirmationCode />} />
          <Route path="/enduser/confirmation" element={<ReservationConfirmation />} />
          <Route path="/enduser/about" element={<About />} />
          <Route path="/enduser/contact" element={<Contact />} />
          <Route path="/enduser/profile" element={<Profile />} />
          <Route path="/enduser/profile/edit" element={<EditProfile />} />
          <Route path="/enduser/rental-policy" element={<RentalPolicy />} />

          {/* Legacy routes - redirect to appropriate portal */}
          <Route path="/compare" element={<Navigate to="/enduser/compare" replace />} />
          <Route path="/rent/:id" element={<Navigate to="/enduser/rent/:id" replace />} />
          <Route path="/about" element={<Navigate to="/client/about" replace />} />
          <Route path="/contact" element={<Navigate to="/client/contact" replace />} />
          <Route path="/profile" element={<Navigate to="/enduser/profile" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
