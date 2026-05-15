export type VehicleType = "bike" | "auto" | "car" | "loading" | "truck";

export type VehicleSearchResult = {
  _id: string;
  type: VehicleType;
  owner: string;
  vehicleModel: string;
  number: string;
  imageUrl?: string;
  baseFare: number;
  pricePerKm: number;
  waitingCharge?: number;
};

