import { DEFAULT_STYLE } from "@/lib/design/presets";
import { vcardEncoder } from "@/lib/encoders/vcard";
import { decodeShareHash, encodeShareHash, type ShareState } from "@/lib/share";

describe("share hash", () => {
  const state: ShareState = {
    type: "vcard",
    values: {
      ...structuredClone(vcardEncoder.defaults),
      firstName: "রহিম",
      lastName: "O'Neil & Sons; #1",
      phones: [
        { type: "CELL", value: "01712345678" },
        { type: "WORK", value: "+8802 9876543" },
      ],
      note: "multi\nline",
    },
    style: { ...DEFAULT_STYLE, fgColor: "#123456", dotStyle: "rounded", ecc: "Q" },
  };

  it("round-trips", () => {
    const hash = encodeShareHash(state);
    expect(hash.startsWith("#s=")).toBe(true);
    expect(decodeShareHash(hash)).toEqual(state);
  });

  it("is URL-safe", () => {
    expect(encodeShareHash(state).slice(3)).toMatch(/^[A-Za-z0-9+\-$]*$/);
  });

  it("rejects garbage", () => {
    expect(decodeShareHash("")).toBeNull();
    expect(decodeShareHash("#s=@@@")).toBeNull();
    expect(decodeShareHash("#other")).toBeNull();
  });

  it("sanitises unknown types and malformed values", () => {
    const evil = encodeShareHash({
      type: "vcard",
      values: { firstName: 42, phones: "nope", extra: "dropped" } as never,
      style: { fgColor: "red" } as never,
    });
    const decoded = decodeShareHash(evil);
    expect(decoded?.values.firstName).toBe("");
    expect(decoded?.values).not.toHaveProperty("extra");
    expect(decoded?.style.fgColor).toBe(DEFAULT_STYLE.fgColor);
  });
});
