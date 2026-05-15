import { ZodError, z } from "zod";

export const mongoIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export class RequestValidationError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, details?: unknown, status = 400) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function parseParams<T extends z.ZodType>(schema: T, value: unknown): z.infer<T> {
  const parsed = schema.safeParse(value);

  if (!parsed.success) {
    throw new RequestValidationError("Invalid route parameters", parsed.error.flatten());
  }

  return parsed.data;
}

export async function parseJsonBody<T extends z.ZodType>(request: Request, schema: T): Promise<z.infer<T>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new RequestValidationError("Invalid JSON body");
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    throw new RequestValidationError("Invalid request body", parsed.error.flatten());
  }

  return parsed.data;
}

export function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError;
}
