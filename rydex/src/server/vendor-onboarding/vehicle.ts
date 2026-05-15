import Vehicle from "@/models/vehicle.model";
import { OnboardingError, OnboardingUser } from "@/server/vendor-onboarding/types";

const VEHICLE_REGEX = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,2}[0-9]{4}$/;

export type VehicleStepInput = {
  type: string;
  number: string;
  vehicleModel: string;
};

export function parseVehicleStepInput(body: unknown): VehicleStepInput {
  if (!body || typeof body !== "object") {
    throw new OnboardingError("Missing required fields");
  }

  const data = body as Record<string, unknown>;

  if (
    typeof data.type !== "string" ||
    typeof data.number !== "string" ||
    typeof data.vehicleModel !== "string"
  ) {
    throw new OnboardingError("Missing required fields");
  }

  const vehicleNumber = data.number.trim().toUpperCase();
  if (!VEHICLE_REGEX.test(vehicleNumber)) {
    throw new OnboardingError("Invalid vehicle number format");
  }

  return {
    type: data.type.trim(),
    number: vehicleNumber,
    vehicleModel: data.vehicleModel.trim(),
  };
}

export async function saveVehicleStep(user: OnboardingUser, input: VehicleStepInput) {
  if (user.isVendorBlocked) {
    throw new OnboardingError("Vendor account blocked", 403);
  }

  let vehicle = await Vehicle.findOne({ owner: user._id });

  if (vehicle) {
    vehicle.type = input.type as typeof vehicle.type;
    vehicle.number = input.number;
    vehicle.vehicleModel = input.vehicleModel;
    vehicle.status = "pending";
    await vehicle.save();

    return {
      message: "Vehicle details updated",
      vehicleId: vehicle._id,
      updated: true,
      nextStep: "/partner/onboard/documents",
    };
  }

  const duplicate = await Vehicle.findOne({ number: input.number });
  if (duplicate) {
    throw new OnboardingError("Vehicle already registered", 409);
  }

  vehicle = await Vehicle.create({
    owner: user._id,
    type: input.type,
    number: input.number,
    vehicleModel: input.vehicleModel,
    status: "pending",
    isActive: true,
  });

  user.role = "vendor";
  user.vendorStatus = "pending";
  if (user.vendorOnboardingStep < 1) {
    user.vendorOnboardingStep = 1;
  }
  await user.save();

  return {
    message: "Vehicle registered successfully",
    vehicleId: vehicle._id,
    created: true,
    nextStep: "/partner/onboard/documents",
  };
}

export async function getVehicleStepData(user: OnboardingUser) {
  const vehicle = await Vehicle.findOne({ owner: user._id })
    .select("type number vehicleModel status")
    .lean();

  return {
    authorized: true,
    user: {
      role: user.role,
      vendorStatus: user.vendorStatus,
      vendorOnboardingStep: user.vendorOnboardingStep,
    },
    vehicle: vehicle
      ? {
          type: vehicle.type,
          number: vehicle.number,
          model: vehicle.vehicleModel,
          status: vehicle.status,
        }
      : null,
  };
}
