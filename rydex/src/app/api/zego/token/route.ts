import { NextResponse } from "next/server";
import { auth } from "@/auth";
import crypto from "crypto";
import { z } from "zod";

import { parseJsonBody, validationErrorResponse } from "@/server/http/validation";

const tokenRequestSchema = z.object({
  roomId: z.string().trim().min(1, "RoomId missing"),
});

function generateToken04(
  appID: number,
  userID: string,
  serverSecret: string,
  effectiveTimeInSeconds: number,
  payload = ""
) {
  const version = "04";
  const nonce = Math.floor(Math.random() * 2147483647);
  const createTime = Math.floor(Date.now() / 1000);
  const expireTime = createTime + effectiveTimeInSeconds;

  const jsonObject = {
    app_id: appID,
    user_id: userID,
    nonce,
    ctime: createTime,
    expire: expireTime,
    payload,
  };

  const jsonStr = JSON.stringify(jsonObject);

  const hash = crypto
    .createHmac("sha256", serverSecret)
    .update(jsonStr)
    .digest();

  return Buffer.concat([
    Buffer.from(version),
    hash,
    Buffer.from(jsonStr),
  ]).toString("base64");
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await parseJsonBody(req, tokenRequestSchema);

    const appID = Number(process.env.ZEGO_APP_ID);
    const serverSecret = process.env.ZEGO_SERVER_SECRET;

    if (!appID || !serverSecret) {
      return NextResponse.json({ message: "ZeGo is not configured" }, { status: 500 });
    }

    const token = generateToken04(
      appID,
      session.user.id,
      serverSecret,
      3600
    );

    return NextResponse.json({
      token,
      appID,
    });
  } catch (error) {
    const errorResponse = validationErrorResponse(error);
    if (errorResponse) return errorResponse;

    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
