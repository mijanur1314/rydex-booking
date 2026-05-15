import PartnerBank from "@/models/partnerBank.model";
import { OnboardingError } from "@/server/vendor-onboarding/types";

export type BankStepInput = {
  name: string;
  account: string;
  ifsc: string;
  upi?: string;
  mobileNumber?: string;
};

export function parseBankStepInput(body: unknown): BankStepInput {
  if (!body || typeof body !== "object") {
    throw new OnboardingError("Missing required fields");
  }

  const data = body as Record<string, unknown>;
  if (
    typeof data.name !== "string" ||
    typeof data.account !== "string" ||
    typeof data.ifsc !== "string"
  ) {
    throw new OnboardingError("Missing required fields");
  }

  return {
    name: data.name.trim(),
    account: data.account.trim(),
    ifsc: data.ifsc.trim().toUpperCase(),
    upi: typeof data.upi === "string" && data.upi.trim() ? data.upi.trim() : undefined,
    mobileNumber:
      typeof data.mobileNumber === "string" && data.mobileNumber.trim()
        ? data.mobileNumber.replace(/\D/g, "").trim()
        : undefined,
  };
}

export async function saveBankStep(userId: string, input: BankStepInput) {
  await PartnerBank.findOneAndUpdate(
    { owner: userId },
    {
      accountHolderName: input.name,
      accountNumber: input.account,
      ifsc: input.ifsc,
      upi: input.upi,
      status: "details_added",
    },
    { upsert: true, new: true }
  );
}

export async function getBankStepData(userId: string) {
  return PartnerBank.findOne({ owner: userId }).lean();
}
