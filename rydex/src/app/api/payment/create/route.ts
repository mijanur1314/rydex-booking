import { NextResponse } from "next/server"
import razorpay from "@/lib/razorpay"
import connectDb from "@/lib/db"
import Booking from "@/models/booking.model"
import { z } from "zod"
import { mongoIdSchema, parseJsonBody, validationErrorResponse } from "@/server/http/validation"

const createPaymentSchema = z.object({
  bookingId: mongoIdSchema,
})


export async function POST(req: Request) {
try {

  await connectDb()

  const { bookingId } = await parseJsonBody(req, createPaymentSchema)

  const booking = await Booking.findById(bookingId)

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" })
  }

  const order = await razorpay.orders.create({
    amount: booking.fare * 100,
    currency: "INR",
    receipt: booking._id.toString(),
  })

  booking.status = "awaiting_payment"
  await booking.save()

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount
  })
} catch (error) {
  const errorResponse = validationErrorResponse(error)
  if (errorResponse) return errorResponse

  return NextResponse.json({ error: "Payment order failed" }, { status: 500 })
}
}
