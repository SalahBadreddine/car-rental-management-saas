"use client"

import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"

// Auth Pages
import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"
import VerifyEmail from "./pages/VerifyEmail"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import RoleSelection from "./pages/RoleSelection"

// Client Pages
import ClientHome from "./pages/Client/Home"
import ClientDashboard from "./pages/Client/Dashboard"
import ClientVehicle from "./pages/Client/Vehicle"
import ClientVehicleDetails from "./pages/Client/VehicleDetails"
import EditVehicle from "./pages/Client/EditVehicle"
import AddVehicle from "./pages/Client/AddVehicle"
import ClientReservations from "./pages/Client/Reservations"
import ReservationDetails from "./pages/Client/ReservationDetails"
import ClientEditProfile from "./pages/Client/EditProfile"
import ClientAbout from "./pages/Client/About"
import ClientContact from "./pages/Client/Contact"
import ClientRentalPolicy from "./pages/Client/RentalPolicy"
import ClientNotifications from "./pages/Client/Notifications"
import ClientFAQ from "./pages/Client/FAQ"
import LocationSelect from "./pages/Client/LocationSelect"

// End User Pages
import EndUserIndex from "./pages/EndUser/Index"
import EndUserVehicles from "./pages/EndUser/Vehicles"
import CarDetails from "./pages/EndUser/CarDetails"
import CompareCars from "./pages/EndUser/CompareCars"
import RentCar from "./pages/EndUser/RentCar"
import Payment from "./pages/EndUser/Payment"
import ConfirmationCode from "./pages/EndUser/ConfirmationCode"
import ReservationConfirmation from "./pages/EndUser/ReservationConfirmation"
import EndUserAbout from "./pages/EndUser/About"
import EndUserContact from "./pages/EndUser/Contact"
import EndUserProfile from "./pages/EndUser/Profile"
import EndUserEditProfile from "./pages/EndUser/EditProfile"
import EndUserRentalPolicy from "./pages/EndUser/RentalPolicy"
import EndUserFAQ from "./pages/EndUser/FAQ"
import { RentalDataProvider } from "./contexts/RentalDataContext"

// Other Pages
import NotFound from "./pages/NotFound"
import { ProtectedRoute } from "./components/ProtectedRoute"

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RentalDataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/role-select" replace />} />

              <Route path="/role-select" element={<RoleSelection />} />

              {/* Auth pages */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              <Route
                path="/client/location-select"
                element={
                  <ProtectedRoute requiredRole="client">
                    <LocationSelect />
                  </ProtectedRoute>
                }
              />

              {/* Client portal routes */}
              <Route
                path="/client/home"
                element={
                  <ProtectedRoute requiredRole="client">
                    <ClientHome />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/client/faq"
                element={
                  <ProtectedRoute requiredRole="client">
                    <ClientFAQ />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/client/dashboard"
                element={
                  <ProtectedRoute requiredRole="client">
                    <ClientDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/client/vehicles"
                element={
                  <ProtectedRoute requiredRole="client">
                    <ClientVehicle />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/client/vehicles/:id"
                element={
                  <ProtectedRoute requiredRole="client">
                    <ClientVehicleDetails />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/client/vehicles/:id/edit"
                element={
                  <ProtectedRoute requiredRole="client">
                    <EditVehicle />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/client/add-vehicle"
                element={
                  <ProtectedRoute requiredRole="client">
                    <AddVehicle />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/client/reservations"
                element={
                  <ProtectedRoute requiredRole="client">
                    <ClientReservations />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/client/reservations/:id"
                element={
                  <ProtectedRoute requiredRole="client">
                    <ReservationDetails />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/client/profile/edit"
                element={
                  <ProtectedRoute requiredRole="client">
                    <ClientEditProfile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/client/about"
                element={
                  <ProtectedRoute requiredRole="client">
                    <ClientAbout />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/client/contact"
                element={
                  <ProtectedRoute requiredRole="client">
                    <ClientContact />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/client/rental-policy"
                element={
                  <ProtectedRoute requiredRole="client">
                    <ClientRentalPolicy />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/client/notifications"
                element={
                  <ProtectedRoute requiredRole="client">
                    <ClientNotifications />
                  </ProtectedRoute>
                }
              />

              {/* End User Portal Routes */}
              <Route path="/enduser" element={<EndUserIndex />} />
              <Route path="/enduser/vehicles" element={<EndUserVehicles />} />
              <Route path="/enduser/vehicles/:id" element={<CarDetails />} />
              <Route path="/enduser/compare" element={<CompareCars />} />
              <Route path="/enduser/rent/:id" element={<RentCar />} />
              <Route path="/enduser/payment" element={<Payment />} />
              <Route path="/enduser/confirm-code" element={<ConfirmationCode />} />
              <Route path="/enduser/confirmation" element={<ReservationConfirmation />} />
              <Route path="/enduser/about" element={<EndUserAbout />} />
              <Route path="/enduser/contact" element={<EndUserContact />} />
              <Route path="/enduser/profile" element={<EndUserProfile />} />
              <Route path="/enduser/profile/edit" element={<EndUserEditProfile />} />
              <Route path="/enduser/rental-policy" element={<EndUserRentalPolicy />} />
              <Route path="/enduser/faq" element={<EndUserFAQ />} />

              {/* Legacy route redirects for backward compatibility */}
              <Route path="/compare" element={<Navigate to="/enduser/compare" replace />} />
              <Route path="/rent/:id" element={<RentCar />} />
              <Route path="/about" element={<Navigate to="/enduser/about" replace />} />
              <Route path="/contact" element={<Navigate to="/enduser/contact" replace />} />
              <Route path="/profile" element={<Navigate to="/enduser/profile" replace />} />
              <Route path="/vehicles" element={<Navigate to="/enduser/vehicles" replace />} />
              <Route path="/vehicles/:id" element={<CarDetails />} />
              <Route path="/rental-policy" element={<Navigate to="/enduser/rental-policy" replace />} />

              {/* 404 catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </RentalDataProvider>
    </AuthProvider>
  </QueryClientProvider>
)

export default App

