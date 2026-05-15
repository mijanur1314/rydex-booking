import PartnerBank from "@/models/partnerBank.model";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import VehicleDocument from "@/models/vehicleDocument.model";

export class AdminReviewError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function getAdminDashboardData() {
  const [totalVendors, approved, pending, rejected] = await Promise.all([
    User.countDocuments({ role: "vendor" }),
    User.countDocuments({ role: "vendor", vendorStatus: "approved" }),
    User.countDocuments({ role: "vendor", vendorStatus: "pending" }),
    User.countDocuments({ role: "vendor", vendorStatus: "rejected" }),
  ]);

  const pendingVendorUsers = await User.find({
    role: "vendor",
    vendorStatus: "pending",
  })
    .select("name email")
    .lean();

  const vendorIds = pendingVendorUsers.map((v) => v._id);

  const vendorVehicles = await Vehicle.find({
    owner: { $in: vendorIds },
  })
    .select("owner type")
    .lean();

  const vehicleTypeMap = new Map(vendorVehicles.map((v) => [String(v.owner), v.type]));

  const pendingVendors = pendingVendorUsers.map((v) => ({
    _id: v._id,
    name: v.name,
    email: v.email,
    vehicleType: vehicleTypeMap.get(String(v._id)) || "-",
  }));

  const pendingVehiclesRaw = await Vehicle.find({
    status: "pending",
    baseFare: { $exists: true },
    pricePerKm: { $exists: true },
  })
    .populate({
      path: "owner",
      select: "name email",
    })
    .lean();

  const pendingVehicles = pendingVehiclesRaw.map((v) => ({
    _id: v._id,
    ownerName: (v.owner as { name?: string } | null)?.name,
    ownerEmail: (v.owner as { email?: string } | null)?.email,
    vehicleType: v.type,
    baseFare: v.baseFare,
    pricePerKm: v.pricePerKm,
  }));

  return {
    success: true,
    stats: {
      totalVendors,
      approved,
      pending,
      rejected,
    },
    pendingVendors,
    pendingVehicles,
  };
}

export async function approveVendor(vendorId: string) {
  const user = await User.findById(vendorId);
  if (!user || user.role !== "vendor") {
    throw new AdminReviewError("Vendor not found", 404);
  }

  if (user.vendorStatus === "approved") {
    throw new AdminReviewError("Vendor already approved");
  }

  const [docs, bank] = await Promise.all([
    VehicleDocument.findOne({ owner: vendorId }),
    PartnerBank.findOne({ owner: vendorId }),
  ]);

  if (!docs || !bank) {
    throw new AdminReviewError("Vendor onboarding incomplete");
  }

  user.vendorStatus = "approved";
  user.isVendorBlocked = false;
  user.vendorOnboardingStep = 4;
  user.videoKycStatus = "pending";
  user.vendorApprovedAt = new Date();
  await user.save();

  return {
    success: true,
    message: "Vendor approved successfully",
  };
}

export async function rejectVendor(vendorId: string, reason: string) {
  if (!reason || reason.trim().length < 5) {
    throw new AdminReviewError("Rejection reason required");
  }

  const user = await User.findById(vendorId);
  if (!user || user.role !== "vendor") {
    throw new AdminReviewError("Vendor not found", 404);
  }

  user.vendorStatus = "rejected";
  user.vendorRejectionReason = reason.trim();
  await user.save();

  await VehicleDocument.findOneAndUpdate(
    { owner: vendorId },
    {
      status: "rejected",
      rejectionReason: reason.trim(),
    }
  );

  return {
    success: true,
    message: "Vendor rejected successfully",
  };
}

export async function approveVehicleReview(vehicleId: string) {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw new AdminReviewError("Vehicle not found", 404);
  }

  vehicle.status = "approved";
  vehicle.rejectionReason = undefined;
  await vehicle.save();

  await User.findByIdAndUpdate(vehicle.owner, {
    vendorOnboardingStep: 7,
  });

  return {
    message: "Vehicle pricing approved",
  };
}

export async function rejectVehicleReview(vehicleId: string, reason: string) {
  if (!reason || !reason.trim()) {
    throw new AdminReviewError("Rejection reason required");
  }

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw new AdminReviewError("Vehicle not found", 404);
  }

  vehicle.status = "rejected";
  vehicle.rejectionReason = reason.trim();
  await vehicle.save();

  return {
    message: "Vehicle pricing rejected",
  };
}
