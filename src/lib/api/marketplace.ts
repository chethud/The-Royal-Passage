import type { Experience } from "@/data/experiences";
import { create } from "@bufbuild/protobuf";
import { createRoyalPassageClient, rpcCall } from "@/lib/api/connect";
import {
  GetCatalogRequestSchema,
  GetExperienceBySlugRequestSchema,
} from "@/gen/royalpassage/v1/service_pb";

export type CatalogPayload = {
  mode: "live" | "static";
  experiences: Experience[];
  categories: string[];
  cities: string[];
  citySlugs?: string[];
};

export type ExperienceDetailPayload = {
  exp: Experience;
  source: "live" | "static";
};

function normalizeExperience(exp: Experience): Experience {
  const galleryUrls =
    exp.galleryUrls?.length ? exp.galleryUrls : exp.image ? [exp.image] : [];
  return {
    ...exp,
    galleryUrls,
    exclusions: exp.exclusions ?? [],
    requirements: exp.requirements ?? [],
  };
}

export function fetchCatalog(citySlug?: string) {
  const client = createRoyalPassageClient();
  return rpcCall(() =>
    client.getCatalog(create(GetCatalogRequestSchema, citySlug ? { citySlug } : {})),
  ) as Promise<CatalogPayload>;
}

export function fetchExperienceBySlug(slug: string) {
  const client = createRoyalPassageClient();
  return rpcCall(async () => {
    const payload = (await client.getExperienceBySlug(
      create(GetExperienceBySlugRequestSchema, { slug }),
    )) as ExperienceDetailPayload;
    return { ...payload, exp: normalizeExperience(payload.exp) };
  });
}
