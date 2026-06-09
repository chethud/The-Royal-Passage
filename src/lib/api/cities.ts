import type { CitySummary } from "@/lib/cities";
import { createRoyalPassageClient, rpcCall } from "@/lib/api/connect";
import { GetCityRequestSchema } from "@/gen/royalpassage/v1/service_pb";
import { create } from "@bufbuild/protobuf";

export function fetchCities() {
  const client = createRoyalPassageClient();
  return rpcCall(async () => {
    const response = await client.listCities({});
    return response.cities as CitySummary[];
  });
}

export function fetchCityBySlug(slug: string) {
  const client = createRoyalPassageClient();
  return rpcCall(() =>
    client.getCity(create(GetCityRequestSchema, { slug })),
  ) as Promise<CitySummary>;
}
