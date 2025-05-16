export const PRODUCTION_INTERNAL_APP_DOMAINS = [
  {
    name: "platform",
    url: "https://smartargi.ai",
  },
] as const;

export const DEV_INTERNAL_APP_DOMAINS = [
  {
    name: "platform",
    url: "http://localhost:7803",
  },
] as const;

export const APP_DOMAIN_MAP = [
  ...PRODUCTION_INTERNAL_APP_DOMAINS,
  ...DEV_INTERNAL_APP_DOMAINS,
] as const;

export type AppName = (typeof APP_DOMAIN_MAP)[number]["name"];

export const INTERNAL_DOMAINS = [
  ...PRODUCTION_INTERNAL_APP_DOMAINS,
  ...DEV_INTERNAL_APP_DOMAINS,
].map((domain) => domain.url);
