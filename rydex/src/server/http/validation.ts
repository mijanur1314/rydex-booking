import { NextResponse } from "next/server";
import {
  RequestValidationError,
  isZodError,
  mongoIdSchema,
  parseJsonBody,
  parseParams,
} from "@/server/http/validation-core";

export {
  RequestValidationError,
  mongoIdSchema,
  parseJsonBody,
  parseParams,
};

export function validationErrorResponse(error: unknown) {
  if (error instanceof RequestValidationError) {
    return NextResponse.json(
      { message: error.message, details: error.details },
      { status: error.status }
    );
  }

  if (isZodError(error)) {
    return NextResponse.json(
      { message: "Invalid request", details: error.flatten() },
      { status: 400 }
    );
  }

  if (
    error instanceof Error &&
    "status" in error &&
    typeof error.status === "number" &&
    error.status >= 400 &&
    error.status < 600
  ) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  return null;
}
