export interface UtmParams {
    utmSource?:   string | null;
    utmMedium?:   string | null;
    utmCampaign?: string | null;
    utmTerm?:     string | null;
    utmContent?:  string | null;
  }
  
  export function buildUrlWithUtm(originalUrl: string, utm: UtmParams): string {
    // If no UTM params set, return the original URL unchanged
    const hasUtm = Object.values(utm).some(Boolean);
    if (!hasUtm) return originalUrl;
  
    try {
      const url = new URL(originalUrl);
  
      if (utm.utmSource)   url.searchParams.set("utm_source",   utm.utmSource);
      if (utm.utmMedium)   url.searchParams.set("utm_medium",   utm.utmMedium);
      if (utm.utmCampaign) url.searchParams.set("utm_campaign", utm.utmCampaign);
      if (utm.utmTerm)     url.searchParams.set("utm_term",     utm.utmTerm);
      if (utm.utmContent)  url.searchParams.set("utm_content",  utm.utmContent);
  
      return url.toString();
    } catch {
      // If URL parsing fails, return original unchanged
      return originalUrl;
    }
  }
  
  export function hasUtmParams(utm: UtmParams): boolean {
    return Object.values(utm).some(Boolean);
  }
  
  // UTM presets for common channels
  export const UTM_PRESETS = [
    {
      label:  "Twitter / X",
      values: { utmSource: "twitter", utmMedium: "social", utmCampaign: "" },
    },
    {
      label:  "LinkedIn",
      values: { utmSource: "linkedin", utmMedium: "social", utmCampaign: "" },
    },
    {
      label:  "Newsletter",
      values: { utmSource: "newsletter", utmMedium: "email", utmCampaign: "" },
    },
    {
      label:  "Paid Ads",
      values: { utmSource: "google", utmMedium: "cpc", utmCampaign: "" },
    },
    {
      label:  "Instagram",
      values: { utmSource: "instagram", utmMedium: "social", utmCampaign: "" },
    },
  ] as const;