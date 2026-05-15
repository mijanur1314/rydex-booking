export type TransitionTimestampField = "arrivedAt" | "startedAt" | "completedAt";

export type TransitionUpdateInput<TStatus extends string> = {
  to: TStatus;
  timestampField?: TransitionTimestampField;
  paymentDeadlineMs?: number;
  now?: Date;
};

export function buildDriverTransitionUpdate<TStatus extends string>({
  to,
  timestampField,
  paymentDeadlineMs,
  now = new Date(),
}: TransitionUpdateInput<TStatus>) {
  const update: Record<string, unknown> = { status: to };

  if (timestampField) {
    update[timestampField] = now;
  }

  if (paymentDeadlineMs) {
    update.paymentDeadline = new Date(now.getTime() + paymentDeadlineMs);
  }

  return update;
}
