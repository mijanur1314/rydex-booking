import connectDb from "@/lib/db";
import User from "@/models/user.model";

export type CompleteVideoKycInput =
  | {
      roomId: string;
      action: "approve";
    }
  | {
      roomId: string;
      action: "reject";
      reason: string;
    };

export class VideoKycError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function startVideoKyc(vendorId: string) {
  await connectDb();

  const vendor = await User.findById(vendorId);

  if (!vendor || vendor.role !== "vendor") {
    throw new VideoKycError("Vendor not found", 404);
  }

  const roomId = `kyc-${vendor._id}-${Date.now()}`;

  vendor.videoKycStatus = "in_progress";
  vendor.videoKycRoomId = roomId;
  vendor.vendorOnboardingStep = Math.max(vendor.vendorOnboardingStep, 4);

  await vendor.save();

  return { roomId };
}

export async function completeVideoKyc(input: CompleteVideoKycInput) {
  await connectDb();

  const vendor = await User.findOne({
    videoKycRoomId: input.roomId,
    role: "vendor",
  });

  if (!vendor) {
    throw new VideoKycError("Vendor not found", 404);
  }

  if (input.action === "approve") {
    vendor.videoKycStatus = "approved";
    vendor.videoKycRejectionReason = undefined;
    vendor.vendorOnboardingStep = Math.max(vendor.vendorOnboardingStep, 5);
  } else {
    vendor.videoKycStatus = "rejected";
    vendor.videoKycRejectionReason = input.reason.trim();
  }

  await vendor.save();

  return {
    success: true,
    status: vendor.videoKycStatus,
  };
}
