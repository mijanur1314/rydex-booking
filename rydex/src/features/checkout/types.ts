export type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type RazorpayOptions = {
  key?: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void | Promise<void>;
};

export type RazorpayConstructor = new (options: RazorpayOptions) => {
  open: () => void;
};

export type RazorpayWindow = Window & {
  Razorpay?: RazorpayConstructor;
};

export type CheckoutStatus =
  | "idle" | "requested" | "awaiting_payment"
  | "rejected" | "expired" | "cancelled"
  | "payment" | "confirmed";

