import bn from "@/i18n/bn.json";
import en from "@/i18n/en.json";

function keys(node: unknown, prefix = ""): string[] {
  if (typeof node !== "object" || node === null) return [prefix];
  return Object.entries(node).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
}

describe("translations", () => {
  it("Bangla has exactly the same keys as English", () => {
    expect(keys(bn).sort()).toEqual(keys(en).sort());
  });

  it("uses the same ICU placeholders in both languages", () => {
    const get = (obj: unknown, path: string) =>
      path.split(".").reduce<unknown>((n, p) => (n as Record<string, unknown>)[p], obj);
    for (const key of keys(en)) {
      const placeholders = (s: unknown) => (String(s).match(/\{\w+\}/g) ?? []).sort();
      expect(placeholders(get(bn, key)), key).toEqual(placeholders(get(en, key)));
    }
  });
});
