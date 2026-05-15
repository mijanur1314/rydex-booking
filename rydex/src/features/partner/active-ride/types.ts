export type BookingStatus =
  | "requested" | "awaiting_payment" | "confirmed"
  | "arriving" | "arrived"
  | "started" | "completed" | "cancelled"
  | "rejected" | "expired";

export type PaymentStatus = "pending" | "paid" | "cash" | "failed";

export type UserLite = {
  _id?: string;
  name?: string;
};

export type VehicleLite = {
  _id?: string;
  vehicleModel?: string;
  number?: string;
};

export type SocketLocationPayload = {
  latitude: number;
  longitude: number;
};

export interface IBooking {
  _id: string;
  user: UserLite;
  driver: UserLite;
  vehicle: VehicleLite;
  pickupAddress: string;
  dropAddress: string;
  pickupLocation?: { type: "Point"; coordinates: [number, number] };
  dropLocation?: { type: "Point"; coordinates: [number, number] };
  fare: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentDeadline?: Date;
  userMobileNumber: string;
  driverMobileNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

