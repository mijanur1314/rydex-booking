"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
} from "lucide-react";
import { stepVariants, VEHICLES } from "../constants";
import { formatPlace } from "../hooks/useBookRideForm";
import type { Place, VehicleType } from "../types";

type BookFormSectionsProps = {
  canContinue: boolean;
  drop: string;
  dropResults: Place[];
  locating: boolean;
  mobile: string;
  pickup: string;
  pickupCountry: string | null;
  pickupResults: Place[];
  vehicle: VehicleType | null;
  onContinue: () => void;
  onDropChange: (value: string) => void;
  onMobileChange: (value: string) => void;
  onPickupChange: (value: string) => void;
  onSearchDrop: (value: string) => void;
  onSearchPickup: (value: string) => void;
  onSelectDrop: (place: Place) => void;
  onSelectPickup: (place: Place) => void;
  onUseCurrentLocation: () => void;
  onVehicleChange: (value: VehicleType) => void;
};

export function BookFormSections(props: BookFormSectionsProps) {
  return (
    <div className="bg-white rounded-3xl border border-zinc-200 shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden">
      <div className="h-1 bg-zinc-900 w-full" />
      <div className="p-6 space-y-7">
        <VehicleStep vehicle={props.vehicle} onVehicleChange={props.onVehicleChange} />
        <Divider />
        <MobileStep mobile={props.mobile} onMobileChange={props.onMobileChange} />
        <Divider />
        <RouteStep {...props} />
        <ContinueStep canContinue={props.canContinue} onContinue={props.onContinue} vehicle={props.vehicle} mobile={props.mobile} pickup={props.pickup} drop={props.drop} />
      </div>
    </div>
  );
}

function VehicleStep({ vehicle, onVehicleChange }: { vehicle: VehicleType | null; onVehicleChange: (value: VehicleType) => void }) {
  return (
    <motion.div variants={stepVariants} initial="hidden" animate="visible" transition={{ delay: 0.05 }}>
      <StepTitle index={1}>Choose Vehicle</StepTitle>
      <div className="grid grid-cols-2 gap-2.5">
        {VEHICLES.map((option, index) => {
          const active = vehicle === option.id;
          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.07 + index * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onVehicleChange(option.id as VehicleType)}
              className={`relative p-3.5 rounded-2xl border flex items-center gap-3 text-left transition-all duration-200 ${
                active ? "bg-zinc-900 border-zinc-900 shadow-lg" : "bg-zinc-50 border-zinc-200 hover:border-zinc-400"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${active ? "bg-white" : "bg-zinc-200"}`}>
                <option.Icon size={18} className={active ? "text-zinc-900" : "text-zinc-600"} />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-bold truncate ${active ? "text-white" : "text-zinc-900"}`}>{option.label}</p>
                <p className="text-[10px] truncate text-zinc-400">{option.desc}</p>
              </div>
              {active && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2.5 right-2.5">
                  <CheckCircle2 size={13} className="text-white fill-white/20" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

function MobileStep({ mobile, onMobileChange }: { mobile: string; onMobileChange: (value: string) => void }) {
  return (
    <motion.div variants={stepVariants} initial="hidden" animate="visible" transition={{ delay: 0.15 }}>
      <StepTitle index={2}>Mobile Number</StepTitle>
      <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 focus-within:border-zinc-900 focus-within:bg-white transition-all">
        <div className="w-8 h-8 rounded-xl bg-zinc-200 flex items-center justify-center flex-shrink-0">
          <Phone size={14} className="text-zinc-600" />
        </div>
        <input
          type="tel"
          value={mobile}
          onChange={(event) => onMobileChange(event.target.value.replace(/\D/g, ""))}
          placeholder="Enter your mobile number"
          inputMode="numeric"
          maxLength={15}
          className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none"
        />
        <AnimatePresence>
          {mobile.length >= 10 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-50 flex-shrink-0" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="text-zinc-400 text-[10px] mt-1.5 ml-1">Ride updates will be sent to this number</p>
    </motion.div>
  );
}

function RouteStep(props: BookFormSectionsProps) {
  return (
    <motion.div variants={stepVariants} initial="hidden" animate="visible" transition={{ delay: 0.22 }} className="space-y-3">
      <StepTitle index={3}>Route</StepTitle>
      <div className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-visible">
        <div className="relative z-20">
          <div className="flex items-center gap-3 px-4 py-3.5 focus-within:bg-white rounded-t-2xl transition-colors">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-zinc-900 border-2 border-white shadow" />
              <div className="w-px h-5 bg-zinc-300 mt-1" />
            </div>
            <input
              value={props.pickup}
              onChange={(event) => {
                props.onPickupChange(event.target.value);
                props.onSearchPickup(event.target.value);
              }}
              placeholder="Pickup location"
              className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none"
            />
            <motion.button
              type="button"
              whileTap={{ scale: 0.88 }}
              onClick={props.onUseCurrentLocation}
              disabled={props.locating}
              className="w-8 h-8 rounded-xl bg-zinc-200 hover:bg-zinc-300 transition-colors flex items-center justify-center flex-shrink-0"
            >
              <LocateFixed size={14} className={`text-zinc-700 ${props.locating ? "animate-spin" : ""}`} />
            </motion.button>
          </div>
          <PlaceResults places={props.pickupResults} icon="pickup" onSelect={props.onSelectPickup} />
        </div>

        <div className="h-px bg-zinc-200 mx-4" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 px-4 py-3.5 focus-within:bg-white rounded-b-2xl transition-colors">
            <div className="flex-shrink-0">
              <div className="w-3 h-3 rounded-sm bg-zinc-900 border-2 border-white shadow" />
            </div>
            <input
              value={props.drop}
              onChange={(event) => {
                props.onDropChange(event.target.value);
                props.onSearchDrop(event.target.value);
              }}
              disabled={!props.pickup}
              placeholder={props.pickup ? "Drop location" : "Select pickup first"}
              className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none disabled:opacity-50"
            />
            <Navigation size={14} className="text-zinc-300 flex-shrink-0" />
          </div>
          <PlaceResults places={props.dropResults} icon="drop" onSelect={props.onSelectDrop} />
        </div>
      </div>
    </motion.div>
  );
}

function ContinueStep({
  canContinue,
  onContinue,
  vehicle,
  mobile,
  pickup,
  drop,
}: {
  canContinue: boolean;
  onContinue: () => void;
  vehicle: VehicleType | null;
  mobile: string;
  pickup: string;
  drop: string;
}) {
  return (
    <motion.div variants={stepVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={canContinue ? { scale: 1.02 } : {}}
        disabled={!canContinue}
        onClick={onContinue}
        className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-black disabled:opacity-35 text-white font-black text-sm tracking-wide flex items-center justify-center gap-2.5 transition-colors shadow-lg disabled:shadow-none"
      >
        <span>Continue</span>
        <motion.div animate={canContinue ? { x: [0, 4, 0] } : {}} transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1 }}>
          <ArrowRight size={17} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {!canContinue && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-zinc-400 text-[10px] font-medium mt-2.5 tracking-wide">
            {!vehicle ? "Select a vehicle to continue" : mobile.length < 10 ? "Enter a valid mobile number" : !pickup ? "Enter pickup location" : !drop ? "Enter drop location" : ""}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PlaceResults({ places, icon, onSelect }: { places: Place[]; icon: "pickup" | "drop"; onSelect: (place: Place) => void }) {
  const Icon = icon === "pickup" ? MapPin : Navigation;

  return (
    <AnimatePresence>
      {places.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-2xl shadow-xl max-h-52 overflow-y-auto z-50"
        >
          {places.map((place, index) => (
            <motion.button
              key={place.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => onSelect(place)}
              className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0"
            >
              <Icon size={13} className="text-zinc-400 flex-shrink-0" />
              <span className="text-sm text-zinc-800 font-medium truncate">{formatPlace(place)}</span>
              <ChevronRight size={13} className="text-zinc-300 flex-shrink-0 ml-auto" />
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StepTitle({ index, children }: { index: number; children: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
        <span className="text-white text-[9px] font-black">{index}</span>
      </div>
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{children}</p>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-zinc-100" />;
}
