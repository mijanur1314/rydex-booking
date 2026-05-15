import uploadOnCloudinary from "@/lib/cloudinary";
import Vehicle from "@/models/vehicle.model";
import { OnboardingError, OnboardingUser } from "@/server/vendor-onboarding/types";

export async function saveVehiclePricing(user: OnboardingUser, formData: FormData) {
  const vehicle = await Vehicle.findOne({ owner: user._id });
  if (!vehicle) {
    throw new OnboardingError("Vehicle not found", 404);
  }

  const image = formData.get("image") as File | null;
  const baseFare = formData.get("baseFare");
  const pricePerKm = formData.get("pricePerKm");
  const waitingCharge = formData.get("waitingCharge");

  let updated = false;

  if (image && image.size > 0) {
    const imageUrl = await uploadOnCloudinary(image);
    vehicle.imageUrl = imageUrl;
    updated = true;
  }

  if (baseFare !== null) {
    vehicle.baseFare = Number(baseFare);
    updated = true;
  }

  if (pricePerKm !== null) {
    vehicle.pricePerKm = Number(pricePerKm);
    updated = true;
  }

  if (waitingCharge !== null) {
    vehicle.waitingCharge = Number(waitingCharge);
    updated = true;
  }

  if (!updated) {
    throw new OnboardingError("Nothing to update");
  }

  vehicle.status = "pending";
  vehicle.rejectionReason = undefined;
  await vehicle.save();

  user.vendorOnboardingStep = 6;
  await user.save();

  return {
    message: "Pricing submitted for admin review",
    status: vehicle.status,
  };
}

export async function getVehiclePricing(user: OnboardingUser) {
  const vehicle = await Vehicle.findOne({ owner: user._id });

  if (!vehicle) {
    throw new OnboardingError("Vehicle not found", 404);
  }

  return {
    pricing: {
      imageUrl: vehicle.imageUrl || null,
      baseFare: vehicle.baseFare || null,
      pricePerKm: vehicle.pricePerKm || null,
      waitingCharge: vehicle.waitingCharge || 0,
      status: vehicle.status,
      rejectionReason: vehicle.rejectionReason || null,
    },
  };
}
