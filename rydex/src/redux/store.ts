import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice"
import rideSlice from "./rideSlice"

export const store=configureStore({
   reducer:{
    user:userSlice,
    ride: rideSlice,
   } 
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch