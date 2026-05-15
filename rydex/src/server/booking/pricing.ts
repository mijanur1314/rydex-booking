export type PointLocation = {
  coordinates: [number, number];
};

export function isValidPointLocation(value: unknown): value is PointLocation {
  if (!value || typeof value !== "object") return false;

  const coordinates = (value as PointLocation).coordinates;

  return (
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    coordinates.every((coord) => typeof coord === "number" && Number.isFinite(coord))
  );
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function calculateDistanceKm(from: [number, number], to: [number, number]) {
  const [fromLng, fromLat] = from;
  const [toLng, toLat] = to;

  const earthRadiusKm = 6371;
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

export function calculateRideFare(input: {
  baseFare: number;
  pricePerKm: number;
  waitingCharge?: number;
  distanceKm: number;
}) {
  const waitingCharge = typeof input.waitingCharge === "number" ? input.waitingCharge : 0;

  return Math.max(
    0,
    Math.round((input.baseFare + input.distanceKm * input.pricePerKm + waitingCharge) * 100) / 100
  );
}
