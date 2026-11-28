const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "";

export const SITE_URL = (configuredSiteUrl.trim() || "https://intervai.vpnpro.in").replace(/\/+$/, "");

export const BRAND_NAME = "IntervAi";
