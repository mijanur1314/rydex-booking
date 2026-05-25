import { auth } from "@/auth";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate a secure HMAC signature of the userId using the NextAuth secret
    const secret = process.env.AUTH_SECRET || "fallback_secret";
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(session.user.id);
    const signature = hmac.digest("hex");

    // The token is a simple string: userId.signature
    const token = `${session.user.id}.${signature}`;

    return NextResponse.json({ success: true, token });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
