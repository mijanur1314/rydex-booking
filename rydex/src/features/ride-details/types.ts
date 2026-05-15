export type BookingStatus =
  | "requested" | "awaiting_payment" | "confirmed"
  | "started" | "completed" | "cancelled"
  | "rejected" | "expired";

export type PaymentStatus = "pending" | "paid" | "cash" | "failed";

export interface BookingDetails {
  _id: string;
  driver?: { _id: string; name: string };
  vehicle?: { vehicleModel: string; number: string };
  pickupAddress: string;
  dropAddress: string;
  pickupLocation: { coordinates: [number, number] };
  dropLocation: { coordinates: [number, number] };
  fare: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  userMobileNumber: string;
  driverMobileNumber: string;
  pickupOtp?: string;
  dropOtp?: string;
}

export type PageRouter = {
  back: () => void;
  push: (href: string) => void;
};

export type DriverLocationPayload = {
  latitude: number;
  longitude: number;
};

export type BookingUpdatedPayload = Partial<BookingDetails> & {
  status?: BookingStatus;
};

export type DriverAssignedPayload = {
  driver: BookingDetails["driver"];
  driverMobileNumber: string;
};

