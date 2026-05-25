import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { IBooking, BookingStatus } from "@/features/partner/active-ride/types";

interface RideState {
  activeBooking: IBooking | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  otpVerified: boolean;
}

const initialState: RideState = {
  activeBooking: null,
  status: "idle",
  error: null,
  otpVerified: false,
};

export const fetchActiveRide = createAsyncThunk(
  "ride/fetchActiveRide",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/partner/bookings/active");
      if (response.data && response.data._id) {
        return response.data as IBooking;
      }
      return null;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch ride");
      }
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch ride");
    }
  }
);

const rideSlice = createSlice({
  name: "ride",
  initialState,
  reducers: {
    setActiveBooking: (state, action: PayloadAction<IBooking | null>) => {
      state.activeBooking = action.payload;
    },
    updateRideStatus: (state, action: PayloadAction<BookingStatus>) => {
      if (state.activeBooking) {
        state.activeBooking.status = action.payload;
      }
    },
    setOtpVerified: (state, action: PayloadAction<boolean>) => {
      state.otpVerified = action.payload;
    },
    clearActiveRide: (state) => {
      state.activeBooking = null;
      state.otpVerified = false;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveRide.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchActiveRide.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.activeBooking = action.payload;
        if (action.payload?.status === "started" || action.payload?.status === "completed") {
          state.otpVerified = true;
        }
      })
      .addCase(fetchActiveRide.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { setActiveBooking, updateRideStatus, setOtpVerified, clearActiveRide } = rideSlice.actions;

export default rideSlice.reducer;
