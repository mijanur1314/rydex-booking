import mongoose, { Schema, Types } from "mongoose";

export type DocumentStatus = "pending" | "approved" | "rejected";

export interface IVehicleDocument {
  owner: Types.ObjectId;

  aadhaarUrl?: string;
  licenseUrl?: string;
  rcUrl?: string;

  status: DocumentStatus;
  rejectionReason?: string;
  aiReview?: {
    overallStatus: "clear" | "needs_review" | "incomplete";
    recommendation: "approve" | "manual_review" | "request_resubmission";
    summary: string;
    riskFlags: string[];
    aadhaar: {
      status: "verified" | "needs_review" | "missing" | "unsupported";
      summary: string;
      extractedFields?: Record<string, string>;
      issues?: string[];
      confidence?: number;
    };
    license: {
      status: "verified" | "needs_review" | "missing" | "unsupported";
      summary: string;
      extractedFields?: Record<string, string>;
      issues?: string[];
      confidence?: number;
    };
    rc: {
      status: "verified" | "needs_review" | "missing" | "unsupported";
      summary: string;
      extractedFields?: Record<string, string>;
      issues?: string[];
      confidence?: number;
    };
    reviewedAt: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IVehicleDocument>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    aadhaarUrl: String,
    licenseUrl: String,
    rcUrl: String,

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: String,
    aiReview: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

const VehicleDocument= mongoose.models.VehicleDocument ||
  mongoose.model("VehicleDocument", DocumentSchema);

  export default VehicleDocument
