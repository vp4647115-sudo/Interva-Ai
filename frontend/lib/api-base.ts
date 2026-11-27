const API_ORIGIN = new URL(
  process.env.NEXT_PUBLIC_API_URL ?? "https://nextapi.vpnpro.in"
).origin;

export const API_BASE =
  process.env.NODE_ENV === "production" ? "/backend-api" : API_ORIGIN;
