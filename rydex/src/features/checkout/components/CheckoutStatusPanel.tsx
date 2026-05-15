"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Wallet,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CheckoutStatus } from "../types";
import type { PaymentMethod } from "../hooks/useCheckoutFlow";

type CheckoutStatusPanelProps = {
  bookingId: string | null;
  loading: boolean;
  paymentMethod: PaymentMethod | null;
  status: CheckoutStatus;
  onCancelBooking: () => void;
  onConfirmPayment: () => void;
  onCreateBooking: () => void;
  onReset: () => void;
  onSelectPaymentMethod: (method: PaymentMethod) => void;
};

export function CheckoutStatusPanel(props: CheckoutStatusPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.07)] flex flex-col"
    >
      <div className="h-1 bg-zinc-900" />
      <div className="flex-1 p-8 sm:p-10 flex flex-col">
        <AnimatePresence mode="wait">
          {props.status === "idle" && <IdleState loading={props.loading} onCreateBooking={props.onCreateBooking} />}
          {props.status === "requested" && <RequestedState onCancelBooking={props.onCancelBooking} />}
          {props.status === "awaiting_payment" && <AwaitingPaymentState />}
          {props.status === "payment" && <PaymentState {...props} />}
          {props.status === "confirmed" && <ConfirmedState bookingId={props.bookingId} />}
          {props.status === "cancelled" && <TerminalState title="Booking Cancelled" text="Your request has been cancelled successfully." buttonLabel="Book Again" onReset={props.onReset} />}
          {props.status === "rejected" && <TerminalState title="Request Rejected" text="Driver declined this booking. Try another driver." buttonLabel="Try Again" onReset={props.onReset} danger />}
          {props.status === "expired" && <TerminalState title="Request Timed Out" text="No response from driver. Please try again." buttonLabel="Try Again" onReset={props.onReset} warning />}
        </AnimatePresence>

        <div className="flex items-center justify-center gap-2 pt-6 mt-auto border-t border-zinc-100">
          <ShieldCheck size={13} className="text-zinc-400" />
          <span className="text-zinc-400 text-[10px] font-semibold tracking-wide uppercase">Secure & Verified Booking</span>
        </div>
      </div>
    </motion.div>
  );
}

function IdleState({ loading, onCreateBooking }: Pick<CheckoutStatusPanelProps, "loading" | "onCreateBooking">) {
  return (
    <motion.div key="idle" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} className="flex flex-col flex-1 justify-between">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-1">Ready to go?</p>
        <h3 className="text-2xl font-black text-zinc-900 mb-6">Confirm Your Ride</h3>
        <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-5 space-y-3">
          {[
            { icon: <Clock size={14} />, text: "Driver will respond within 2 minutes" },
            { icon: <ShieldCheck size={14} />, text: "Verified & insured drivers only" },
            { icon: <CreditCard size={14} />, text: "Pay after driver accepts" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-zinc-200 flex items-center justify-center text-zinc-600 flex-shrink-0">{item.icon}</div>
              <p className="text-zinc-500 text-xs font-medium">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
      <motion.button whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }} onClick={onCreateBooking} disabled={loading} className="w-full h-14 mt-8 bg-zinc-900 hover:bg-black disabled:opacity-40 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 transition-colors shadow-md">
        {loading ? <><Loader2 size={17} className="animate-spin" /> Requesting...</> : <><span>Request Ride</span><ArrowRight size={17} /></>}
      </motion.button>
    </motion.div>
  );
}

function RequestedState({ onCancelBooking }: Pick<CheckoutStatusPanelProps, "onCancelBooking">) {
  return (
    <motion.div key="requested" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="flex flex-col flex-1 items-center justify-center gap-6 text-center">
      <div className="relative">
        <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full bg-zinc-900" />
        <div className="relative w-20 h-20 rounded-full bg-zinc-100 border-2 border-zinc-200 flex items-center justify-center">
          <Loader2 size={28} className="text-zinc-900 animate-spin" />
        </div>
      </div>
      <div>
        <h3 className="text-xl font-black text-zinc-900 mb-1">Finding Your Driver</h3>
        <p className="text-zinc-400 text-sm font-medium">Waiting for driver to accept...</p>
      </div>
      <div className="flex gap-1.5">{[0, 1, 2].map((i) => <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }} className="w-2 h-2 rounded-full bg-zinc-400" />)}</div>
      <motion.button whileTap={{ scale: 0.95 }} onClick={onCancelBooking} className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-zinc-900 transition-colors border border-zinc-200 hover:border-zinc-400 px-4 py-2.5 rounded-xl">
        <XCircle size={13} /> Cancel Request
      </motion.button>
    </motion.div>
  );
}

function AwaitingPaymentState() {
  return (
    <motion.div key="awaiting_payment" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="flex flex-col flex-1 items-center justify-center gap-5 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16 }} className="w-20 h-20 rounded-full bg-zinc-100 border-2 border-zinc-200 flex items-center justify-center">
        <CheckCircle2 size={36} className="text-zinc-900" />
      </motion.div>
      <div>
        <h3 className="text-xl font-black text-zinc-900 mb-1">Driver Accepted!</h3>
        <p className="text-zinc-400 text-sm font-medium">Preparing payment options...</p>
      </div>
      <div className="w-48 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2 }} className="h-full bg-zinc-900 rounded-full" />
      </div>
    </motion.div>
  );
}

function PaymentState({ loading, paymentMethod, onConfirmPayment, onSelectPaymentMethod }: CheckoutStatusPanelProps) {
  const options: Array<{ id: PaymentMethod; Icon: LucideIcon; title: string; sub: string }> = [
    { id: "cash", Icon: Banknote, title: "Cash", sub: "Pay driver after ride" },
    { id: "online", Icon: Wallet, title: "Online Payment", sub: "UPI · Card · Netbanking" },
  ];

  return (
    <motion.div key="payment" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="flex flex-col flex-1 gap-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 mb-1">Almost there</p>
        <h3 className="text-2xl font-black text-zinc-900">Select Payment</h3>
      </div>
      <div className="space-y-3">
        {options.map(({ id, Icon, title, sub }) => {
          const active = paymentMethod === id;
          return (
            <motion.button key={id} whileTap={{ scale: 0.97 }} onClick={() => onSelectPaymentMethod(id)} className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${active ? "bg-zinc-900 border-zinc-900" : "bg-zinc-50 border-zinc-200 hover:border-zinc-400"}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${active ? "bg-white/10" : "bg-zinc-200"}`}>
                <Icon size={18} className={active ? "text-white" : "text-zinc-600"} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${active ? "text-white" : "text-zinc-900"}`}>{title}</p>
                <p className="text-xs font-medium text-zinc-400">{sub}</p>
              </div>
              <AnimatePresence>{active && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><CheckCircle2 size={16} className="text-white flex-shrink-0" /></motion.div>}</AnimatePresence>
            </motion.button>
          );
        })}
      </div>
      <motion.button whileTap={{ scale: 0.97 }} whileHover={paymentMethod ? { scale: 1.02 } : {}} disabled={!paymentMethod || loading} onClick={onConfirmPayment} className="w-full h-14 bg-zinc-900 hover:bg-black disabled:opacity-30 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 transition-colors shadow-md mt-auto">
        {loading ? <Loader2 size={17} className="animate-spin" /> : paymentMethod === "cash" ? <><Banknote size={16} /><span>Confirm Cash Ride</span></> : paymentMethod === "online" ? <><span>Proceed to Payment</span><ArrowRight size={16} /></> : <span>Select a Method</span>}
      </motion.button>
    </motion.div>
  );
}

function ConfirmedState({ bookingId }: Pick<CheckoutStatusPanelProps, "bookingId">) {
  return (
    <motion.div key="confirmed" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="flex flex-col flex-1 items-center justify-center gap-6 text-center">
      <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 240, damping: 14, delay: 0.1 }} className="relative">
        <div className="w-24 h-24 rounded-full bg-zinc-100 border-2 border-zinc-200 flex items-center justify-center">
          <CheckCircle2 size={44} className="text-zinc-900" />
        </div>
        {[0, 1].map((i) => <motion.div key={i} initial={{ scale: 1, opacity: 0.5 }} animate={{ scale: 2.2 + i * 0.6, opacity: 0 }} transition={{ duration: 0.9, delay: 0.2 + i * 0.15 }} className="absolute inset-0 rounded-full border-2 border-zinc-900" />)}
      </motion.div>
      <div>
        <motion.h3 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-2xl font-black text-zinc-900 mb-1">Ride Confirmed!</motion.h3>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-zinc-400 text-sm font-medium max-w-xs">Your driver is on the way. Track live from the ride screen.</motion.p>
      </div>
      <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.03 }} onClick={() => { window.location.href = `/ride/${bookingId}`; }} className="flex items-center gap-2.5 bg-zinc-900 hover:bg-black text-white font-black text-sm px-8 py-4 rounded-2xl transition-colors shadow-md">
        Track Your Ride <ArrowRight size={16} />
      </motion.button>
    </motion.div>
  );
}

function TerminalState({ title, text, buttonLabel, onReset, danger, warning }: { title: string; text: string; buttonLabel: string; onReset: () => void; danger?: boolean; warning?: boolean }) {
  const Icon = warning ? AlertCircle : XCircle;
  const iconClass = danger ? "text-red-500" : warning ? "text-amber-500" : "text-zinc-900";

  return (
    <motion.div key={title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="flex flex-col flex-1 items-center justify-center gap-5 text-center">
      <div className="w-20 h-20 rounded-full bg-zinc-100 border-2 border-zinc-200 flex items-center justify-center">
        <Icon size={34} className={iconClass} />
      </div>
      <div>
        <h3 className="text-xl font-black text-zinc-900 mb-1">{title}</h3>
        <p className="text-zinc-400 text-sm font-medium">{text}</p>
      </div>
      <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }} onClick={onReset} className="flex items-center gap-2 bg-zinc-900 text-white font-black text-sm px-6 py-3.5 rounded-2xl hover:bg-black transition-colors">
        <RotateCcw size={14} /> {buttonLabel}
      </motion.button>
    </motion.div>
  );
}
