import uploadOnCloudinary from "@/lib/cloudinary";
import { reviewVendorDocumentsAI } from "@/lib/ai";
import VehicleDocument from "@/models/vehicleDocument.model";
import { OnboardingError, OnboardingUser } from "@/server/vendor-onboarding/types";

export type DocumentUploads = {
  aadhaar: Blob | null;
  license: Blob | null;
  rc: Blob | null;
};

export function parseDocumentUploads(formData: FormData): DocumentUploads {
  return {
    aadhaar: formData.get("aadhaar") as Blob | null,
    license: formData.get("license") as Blob | null,
    rc: formData.get("rc") as Blob | null,
  };
}

export async function getDocumentStepData(user: OnboardingUser) {
  const documents = await VehicleDocument.findOne({
    owner: user._id,
  }).select("aadhaarUrl licenseUrl rcUrl status rejectionReason aiReview");

  if (
    documents &&
    !documents.aiReview &&
    (documents.aadhaarUrl || documents.licenseUrl || documents.rcUrl)
  ) {
    documents.aiReview = await reviewVendorDocumentsAI({
      aadhaarUrl: documents.aadhaarUrl || null,
      licenseUrl: documents.licenseUrl || null,
      rcUrl: documents.rcUrl || null,
      vendorProfile: {
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber || null,
      },
    });

    await documents.save();
  }

  return {
    success: true,
    documents: documents || null,
  };
}

export async function saveDocumentStep(user: OnboardingUser, uploads: DocumentUploads) {
  if (!uploads.aadhaar && !uploads.license && !uploads.rc) {
    throw new OnboardingError("No documents provided");
  }

  const updatePayload: Record<string, string | null> & {
    status: "pending";
    rejectionReason: null;
  } = {
    status: "pending",
    rejectionReason: null,
  };

  if (uploads.aadhaar) {
    const url = await uploadOnCloudinary(uploads.aadhaar);
    if (!url) {
      throw new OnboardingError("Aadhaar upload failed", 500);
    }
    updatePayload.aadhaarUrl = url;
  }

  if (uploads.license) {
    const url = await uploadOnCloudinary(uploads.license);
    if (!url) {
      throw new OnboardingError("License upload failed", 500);
    }
    updatePayload.licenseUrl = url;
  }

  if (uploads.rc) {
    const url = await uploadOnCloudinary(uploads.rc);
    if (!url) {
      throw new OnboardingError("RC upload failed", 500);
    }
    updatePayload.rcUrl = url;
  }

  const documents = await VehicleDocument.findOneAndUpdate(
    { owner: user._id },
    { $set: updatePayload },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const aiReview = await reviewVendorDocumentsAI({
    aadhaarUrl: documents?.aadhaarUrl || null,
    licenseUrl: documents?.licenseUrl || null,
    rcUrl: documents?.rcUrl || null,
    vendorProfile: {
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber || null,
    },
  });

  if (documents) {
    documents.aiReview = aiReview;
    await documents.save();
  }

  user.vendorOnboardingStep = Math.max(user.vendorOnboardingStep || 0, 2);
  user.vendorStatus = "pending";
  await user.save();

  return {
    success: true,
    message: "Documents submitted successfully",
    aiReview,
  };
}
