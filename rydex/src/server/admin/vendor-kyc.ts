import User from "@/models/user.model";

export async function listPendingVideoKycVendors() {
  return User.find({
    role: "vendor",
    videoKycStatus: { $in: ["pending", "in_progress"] },
  })
    .select(
      "name email mobileNumber vendorStatus vendorOnboardingStep videoKycStatus videoKycRoomId createdAt updatedAt"
    )
    .sort({ updatedAt: -1 })
    .lean();
}
