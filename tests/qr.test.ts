import { buildQrOptions, logoImageSize } from "@/lib/design/qrOptions";
import { DEFAULT_DESIGN } from "@/lib/design/presets";
import { checkQrContrast, contrastRatio } from "@/lib/qr/contrast";
import { measureDensity } from "@/lib/qr/density";
import { toUtf8BinaryString } from "@/lib/qr/utf8";
import { qrFileName, slugify } from "@/lib/download";

describe("utf8", () => {
  it("encodes Bangla as one char per UTF-8 byte", () => {
    const bin = toUtf8BinaryString("রহিম");
    expect(bin.length).toBe(12);
    expect([...bin].every((c) => c.charCodeAt(0) < 256)).toBe(true);
    const bytes = Uint8Array.from([...bin].map((c) => c.charCodeAt(0)));
    expect(new TextDecoder().decode(bytes)).toBe("রহিম");
  });
});

describe("density", () => {
  it("rates short payloads as good and huge ones as too long", () => {
    expect(measureDensity("hello", "M").level).toBe("good");
    expect(measureDensity("x".repeat(600), "M").level).toBe("risky");
    expect(measureDensity("x".repeat(5000), "L").level).toBe("tooLong");
  });

  it("counts UTF-8 bytes", () => {
    expect(measureDensity("রহিম", "M").bytes).toBe(12);
  });

  it("higher ECC needs a bigger version", () => {
    const low = measureDensity("x".repeat(200), "L").version ?? 0;
    const high = measureDensity("x".repeat(200), "H").version ?? 0;
    expect(high).toBeGreaterThan(low);
  });
});

describe("contrast", () => {
  it("computes WCAG ratios", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
    expect(contrastRatio("#777777", "#777777")).toBeCloseTo(1, 5);
  });

  it("flags low contrast and inverted colours", () => {
    expect(checkQrContrast(["#000000"], "#ffffff")).toMatchObject({ low: false, inverted: false });
    expect(checkQrContrast(["#cccccc"], "#ffffff").low).toBe(true);
    expect(checkQrContrast(["#ffffff"], "#000000").inverted).toBe(true);
  });
});

describe("qr options", () => {
  it("forces ECC H and caps the logo when a logo is present", () => {
    const opts = buildQrOptions({
      payload: "x",
      design: { ...DEFAULT_DESIGN, ecc: "L", logo: "data:image/png;base64,AA==", logoSize: 0.5 },
      size: 1024,
    });
    expect(opts.qrOptions?.errorCorrectionLevel).toBe("H");
    expect(opts.imageOptions?.imageSize).toBeCloseTo(logoImageSize(0.2, "H"));
    // ~20% width ⇒ ~4% of the area, within H's 30% recovery budget.
    expect(Math.sqrt((opts.imageOptions?.imageSize ?? 0) * 0.3)).toBeCloseTo(0.2);
  });

  it("never uses a transparent background for JPEG", () => {
    const design = { ...DEFAULT_DESIGN, transparentBg: true, bgColor: "#fafafa" };
    expect(
      buildQrOptions({ payload: "x", design, size: 512, format: "png" }).backgroundOptions?.color,
    ).toBe("transparent");
    expect(
      buildQrOptions({ payload: "x", design, size: 512, format: "jpeg" }).backgroundOptions?.color,
    ).toBe("#fafafa");
  });

  it("passes UTF-8 bytes to the QR library", () => {
    expect(
      buildQrOptions({ payload: "রহিম", design: DEFAULT_DESIGN, size: 512 }).data,
    ).toHaveLength(12);
  });
});

describe("file names", () => {
  it("slugifies names, keeping non-Latin scripts", () => {
    expect(slugify("Rahim Uddin, PhD")).toBe("rahim-uddin-phd");
    expect(qrFileName("রহিম উদ্দিন", "png")).toBe("রহিম-উদ্দিন-qr.png");
    expect(qrFileName("  ", "jpeg")).toBe("qr-code-qr.jpeg");
  });
});
