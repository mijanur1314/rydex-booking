import { HydratedDocument } from "mongoose";
import User, { IUser } from "@/models/user.model";

export type OnboardingUser = HydratedDocument<IUser>;

export class OnboardingError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function getOnboardingUserById(userId: string): Promise<OnboardingUser> {
  const user = await User.findById(userId);

  if (!user) {
    throw new OnboardingError("User not found", 404);
  }

  return user;
}
