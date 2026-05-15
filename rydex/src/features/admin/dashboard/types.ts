export type Stats = {
  totalVendors: number;
  approved: number;
  pending: number;
  rejected: number;
};

export type TabType = "kyc" | "vendor" | "vehicle";

export type ReviewItem = {
  _id: string;
  name?: string;
  email?: string;
  ownerName?: string;
  ownerEmail?: string;
  videoKycStatus?: keyof typeof import("./constants").KYC_STATUS;
  videoKycRoomId?: string;
};
