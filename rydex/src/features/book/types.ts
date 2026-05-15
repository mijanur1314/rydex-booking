export type Place = {
  id: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  countrycode?: string;
  lat: number;
  lng: number;
};

export type VehicleType = "bike" | "auto" | "car" | "loading" | "truck";

export type PhotonFeature = {
  properties: {
    osm_id: string | number;
    name?: string;
    city?: string;
    state?: string;
    country?: string;
    countrycode?: string;
  };
  geometry: {
    coordinates: [number, number];
  };
};

