import { create } from "@bufbuild/protobuf";
import { createRoyalPassageClient, rpcCall } from "@/lib/api/connect";
import { CreateHomestayBookingRequestSchema } from "@/gen/royalpassage/v1/types_pb";

export type CreateHomestayBookingPayload = {
  homestayId: string;
  roomId?: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  roomCount?: number;
  extraBedCount?: number;
  notes?: string;
};

export type CreateHomestayBookingResult = {
  bookingId: string;
  totalAmount: number;
  currencyCode: string;
  bookingStatus: string;
  paymentStatus: string;
  nights: number;
};

export function createHomestayBooking(accessToken: string, payload: CreateHomestayBookingPayload) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(
    () => client.createHomestayBooking(create(CreateHomestayBookingRequestSchema, payload)),
  ) as Promise<CreateHomestayBookingResult>;
}
