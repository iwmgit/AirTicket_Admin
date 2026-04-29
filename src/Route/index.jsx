import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";
import RequireAuth from "../auth/RequireAuth";
import RequireRole from "../auth/RequireRole";
import SignIn from "../pages/auth/SignIn";
import BookingManagement from "../pages/booking/BookingManagement";
import BookingView from "../pages/booking/BookingView";
import FlightManagement from "../pages/flight/FlightManagement";
import FlightForm from "../pages/flight/FlightForm";
import FlightView from "../pages/flight/FlightView";
import UserManagement from "../pages/user/UserManagement";
import UserView from "../pages/user/UserView";
import UserEdit from "../pages/user/UserEdit";
import StaffManagement from "../pages/staff/StaffManagement";
import StaffForm from "../pages/staff/StaffForm";
import StaffView from "../pages/staff/StaffView";
import StaffEdit from "../pages/staff/StaffEdit";
import FlightOverride from "../pages/flight/FlightOverride";
import BookingEdit from "../pages/booking/BookingEdit";
import ContentManagement from "../pages/content/ContentManagement";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/signin" replace />,
  },
  {
    path: "/signin",
    element: <SignIn />,
  },
  {
    path: "/admin",
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: "bookings",
        element: <BookingManagement />,
      },
      {
        path: "bookings/:bookingId",
        element: <BookingView />,
      },
      {
        path: "bookings/:bookingId/booking-edit",
        element: <BookingEdit />,
      },
      {
        path: "flights",
        element: <FlightManagement />,
      },
      {
        path: "flights/:flightId",
        element: <FlightView />,
      },
      {
        path: "flights/:flightId/flight-edit",
        element: <FlightForm />,
      },
      {
        path: "overrides",
        element: <FlightOverride />,
      },
      {
        path: "users/:id/edit",
        element:<UserEdit /> ,
      },
      {
        path: "users/:id",
        element: <UserView />,
      },
      {
        path: "users",
        element:(
          <RequireRole role="SUPER_ADMIN">      
            <UserManagement />
          </RequireRole>
        ),      
      },
      {
        path: "staff",
        element: (
          <RequireRole role="SUPER_ADMIN">
            <StaffManagement />
          </RequireRole>
        ),
      },
      {
        path: "staff/staff-form",
        element: (
          <RequireRole role="SUPER_ADMIN">
            <StaffForm />
          </RequireRole>
        ),
      },
      {
        path: "staff/:id",
        element: (
          <RequireRole role="SUPER_ADMIN">
            <StaffView />
          </RequireRole>
        ),
      },
      {
        path: "staff/:id/edit",
        element: (
          <RequireRole role="SUPER_ADMIN">
            <StaffEdit />
          </RequireRole>
        ),
      },
      {
        path: "content",
        element: <ContentManagement />,
      },
    ],
  },
]);
