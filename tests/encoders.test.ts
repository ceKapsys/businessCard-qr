import { encoders, getEncoder } from "@/lib/encoders/registry";
import { encodeUrl } from "@/lib/encoders/url";
import { encodeWhatsApp } from "@/lib/encoders/whatsapp";
import { encodeWifi, escapeWifi } from "@/lib/encoders/wifi";
import en from "@/i18n/en.json";

describe("wifi", () => {
  it(String.raw`escapes \ ; , : and quotes`, () => {
    expect(escapeWifi(String.raw`a\b;c,d:e"f`)).toBe(String.raw`a\\b\;c\,d\:e\"f`);
  });

  it("encodes a WPA network", () => {
    expect(
      encodeWifi({
        ssid: "Home;Net",
        security: "WPA",
        password: String.raw`p:a,s\s`,
        hidden: false,
      }),
    ).toBe(String.raw`WIFI:T:WPA;S:Home\;Net;P:p\:a\,s\\s;H:false;;`);
  });

  it("omits the password for open networks and flags hidden ones", () => {
    expect(
      encodeWifi({ ssid: "Cafe", security: "nopass", password: "ignored", hidden: true }),
    ).toBe("WIFI:T:nopass;S:Cafe;H:true;;");
  });

  it("returns empty without an SSID", () => {
    expect(encodeWifi({ ssid: "", security: "WPA", password: "", hidden: false })).toBe("");
  });
});

describe("whatsapp", () => {
  it("builds a wa.me link with an encoded message", () => {
    expect(encodeWhatsApp({ phone: "01712345678", message: "Hi there & hello?" })).toBe(
      "https://wa.me/8801712345678?text=Hi%20there%20%26%20hello%3F",
    );
  });

  it("omits text when there is no message and rejects invalid numbers", () => {
    expect(encodeWhatsApp({ phone: "+8801712345678", message: "" })).toBe(
      "https://wa.me/8801712345678",
    );
    expect(encodeWhatsApp({ phone: "123", message: "x" })).toBe("");
  });
});

describe("url", () => {
  it("adds https:// when missing and rejects non-web URLs", () => {
    expect(encodeUrl({ url: "example.com/path?q=1" })).toBe("https://example.com/path?q=1");
    expect(encodeUrl({ url: "http://example.com" })).toBe("http://example.com");
    expect(encodeUrl({ url: "javascript:alert(1)" })).toBe("");
    expect(encodeUrl({ url: "not a url" })).toBe("");
  });
});

describe("registry", () => {
  it("has unique ids and falls back to the first encoder", () => {
    const ids = encoders.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(getEncoder("nope").id).toBe("vcard");
  });

  it("every field label and placeholder has an English translation", () => {
    const lookup = (key: string) =>
      key.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], en);
    for (const encoder of encoders) {
      expect(typeof lookup(encoder.labelKey)).toBe("string");
      for (const field of encoder.fields) {
        expect(typeof lookup(field.labelKey), field.labelKey).toBe("string");
        if (field.placeholderKey) expect(typeof lookup(field.placeholderKey)).toBe("string");
        if (field.descriptionKey) expect(typeof lookup(field.descriptionKey)).toBe("string");
      }
    }
  });
});
