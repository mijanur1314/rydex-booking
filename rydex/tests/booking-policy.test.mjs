import assert from "node:assert/strict";
import test from "node:test";

import { buildDriverTransitionUpdate } from "../src/server/booking/transition-policy.ts";
import {
  calculateDistanceKm,
  calculateRideFare,
} from "../src/server/booking/pricing.ts";

test("buildDriverTransitionUpdate adds payment deadline from the provided clock", () => {
  const now = new Date("2026-05-14T12:00:00.000Z");
  const update = buildDriverTransitionUpdate({
    to: "awaiting_payment",
    paymentDeadlineMs: 5 * 60 * 1000,
    now,
  });

  assert.equal(update.status, "awaiting_payment");
  assert.equal(update.paymentDeadline.toISOString(), "2026-05-14T12:05:00.000Z");
});

test("buildDriverTransitionUpdate stamps lifecycle transitions", () => {
  const now = new Date("2026-05-14T12:00:00.000Z");
  const update = buildDriverTransitionUpdate({
    to: "started",
    timestampField: "startedAt",
    now,
  });

  assert.equal(update.status, "started");
  assert.equal(update.startedAt, now);
});

test("calculateRideFare includes base, distance, and waiting charges", () => {
  assert.equal(
    calculateRideFare({
      baseFare: 50,
      pricePerKm: 12,
      distanceKm: 10,
      waitingCharge: 5,
    }),
    175
  );
});

test("calculateDistanceKm returns a finite distance for valid coordinates", () => {
  const distance = calculateDistanceKm([77.5946, 12.9716], [77.1025, 28.7041]);

  assert.ok(Number.isFinite(distance));
  assert.ok(distance > 1700);
});
