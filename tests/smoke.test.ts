import { siteConfig } from "@/site.config";

describe("site config", () => {
  it("has a default country", () => {
    expect(siteConfig.defaultCountry).toBe("BD");
  });
});
