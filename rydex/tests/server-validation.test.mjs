import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";

import {
  RequestValidationError,
  mongoIdSchema,
  parseJsonBody,
  parseParams,
} from "../src/server/http/validation-core.ts";

test("parseParams accepts valid Mongo ids", () => {
  const params = parseParams(
    z.object({ id: mongoIdSchema }),
    { id: "507f1f77bcf86cd799439011" }
  );

  assert.equal(params.id, "507f1f77bcf86cd799439011");
});

test("parseParams rejects invalid route ids", () => {
  assert.throws(
    () => parseParams(z.object({ id: mongoIdSchema }), { id: "not-an-id" }),
    RequestValidationError
  );
});

test("parseJsonBody trims and validates JSON payloads", async () => {
  const request = new Request("http://localhost", {
    method: "POST",
    body: JSON.stringify({ text: "  hello  " }),
  });

  const body = await parseJsonBody(
    request,
    z.object({ text: z.string().trim().min(1) })
  );

  assert.equal(body.text, "hello");
});

test("parseJsonBody rejects malformed JSON", async () => {
  const request = new Request("http://localhost", {
    method: "POST",
    body: "{",
  });

  await assert.rejects(
    () => parseJsonBody(request, z.object({ text: z.string() })),
    RequestValidationError
  );
});
