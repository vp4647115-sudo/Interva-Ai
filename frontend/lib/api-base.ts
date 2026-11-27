export const API_BASE =
  process.env.NODE_ENV === "production"
    ? "/backend-api"
    : process.env.NEXT_PUBLIC_API_URL ?? "https://nextapi.vpnpro.in";
