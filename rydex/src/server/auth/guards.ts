import { auth } from "@/auth";

export class AuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export async function requireSessionUser() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new AuthError("Unauthorized", 401);
  }

  return session.user;
}

export async function requireRole<T extends string>(role: T) {
  const user = await requireSessionUser();

  if (user.role !== role) {
    throw new AuthError("Unauthorized", 401);
  }

  return user;
}
