import { isValidPhone, normalizePhone, toWhatsAppDigits } from "@/lib/phone";

describe("normalizePhone (default country BD)", () => {
  it.each([
    "01712345678",
    "+8801712345678",
    "8801712345678",
    "008801712345678",
    "01712-345678",
    "+880 1712 345678",
  ])("normalises %s to E.164", (input) => {
    expect(normalizePhone(input)).toBe("+8801712345678");
  });

  it.each(["", "   ", "123", "0171234567", "abc", "+880171234567890123", "017123456789"])(
    "rejects invalid input %j",
    (input) => {
      expect(normalizePhone(input)).toBeNull();
      expect(isValidPhone(input)).toBe(false);
    },
  );

  it("keeps foreign numbers in international form", () => {
    expect(normalizePhone("+44 20 7946 0958")).toBe("+442079460958");
  });

  it("strips the plus for wa.me", () => {
    expect(toWhatsAppDigits("+8801712345678")).toBe("8801712345678");
  });
});
