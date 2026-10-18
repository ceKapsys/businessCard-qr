import { encodeVCard, vcardEncoder } from "@/lib/encoders/vcard";
import type { FormValues } from "@/lib/fields/types";
import { escapeVCardText } from "@/lib/vcard/escape";

const base = (overrides: FormValues = {}): FormValues => ({
  ...structuredClone(vcardEncoder.defaults),
  ...overrides,
});

const lines = (card: string) => card.split("\r\n");

describe("escapeVCardText", () => {
  it("escapes backslash, comma, semicolon and newlines", () => {
    expect(escapeVCardText("a\\b,c;d\ne\r\nf")).toBe(String.raw`a\\b\,c\;d\ne\nf`);
  });

  it("escapes backslash before the others (no double escaping)", () => {
    expect(escapeVCardText(String.raw`\,`)).toBe(String.raw`\\\,`);
  });
});

describe("encodeVCard", () => {
  it("returns an empty string when there is no name", () => {
    expect(encodeVCard(base())).toBe("");
  });

  it("uses CRLF line endings and no bare LF", () => {
    const card = encodeVCard(base({ firstName: "Rahim", note: "line1\nline2" }));
    expect(card).toContain("\r\n");
    expect(card.replace(/\r\n/g, "")).not.toMatch(/[\r\n]/);
    expect(card.startsWith("BEGIN:VCARD\r\nVERSION:3.0\r\n")).toBe(true);
    expect(card.endsWith("\r\nEND:VCARD")).toBe(true);
  });

  it("omits empty fields entirely", () => {
    const card = encodeVCard(base({ firstName: "Rahim" }));
    expect(lines(card)).toEqual([
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:;Rahim;;;",
      "FN:Rahim",
      "END:VCARD",
    ]);
    for (const prop of ["ORG", "TITLE", "TEL", "EMAIL", "URL", "ADR", "NOTE", "item1"]) {
      expect(card).not.toContain(`\r\n${prop}`);
    }
  });

  it("supports Bangla (UTF-8) names with CHARSET", () => {
    const card = encodeVCard(base({ firstName: "রহিম", lastName: "উদ্দিন", org: "বাংলা টেক" }));
    expect(card).toContain("N;CHARSET=UTF-8:উদ্দিন;রহিম;;;");
    expect(card).toContain("FN;CHARSET=UTF-8:রহিম উদ্দিন");
    expect(card).toContain("ORG;CHARSET=UTF-8:বাংলা টেক");
  });

  it("escapes special characters in values", () => {
    const card = encodeVCard(base({ firstName: "A;B", org: "Foo, Inc.", note: "x\\y\nz" }));
    expect(card).toContain(String.raw`FN:A\;B`);
    expect(card).toContain(String.raw`ORG:Foo\, Inc.`);
    expect(card).toContain(String.raw`NOTE:x\\y\nz`);
  });

  it("encodes multiple phones and emails with types, normalised to E.164", () => {
    const card = encodeVCard(
      base({
        firstName: "Rahim",
        whatsappSameAsMobile: false,
        phones: [
          { type: "CELL", value: "01712345678" },
          { type: "WORK", value: "+880 2-9876543" },
          { type: "HOME", value: "" },
        ],
        emails: [
          { type: "WORK", value: "rahim@acme.com" },
          { type: "HOME", value: "rahim@example.com" },
        ],
      }),
    );
    expect(card).toContain("TEL;TYPE=CELL:+8801712345678");
    expect(card).toContain("TEL;TYPE=WORK:+88029876543");
    expect(card).not.toContain("TEL;TYPE=HOME");
    expect(card).toContain("EMAIL;TYPE=WORK:rahim@acme.com");
    expect(card).toContain("EMAIL;TYPE=HOME:rahim@example.com");
  });

  it("never encodes invalid phone numbers", () => {
    const card = encodeVCard(
      base({ firstName: "Rahim", phones: [{ type: "CELL", value: "12345" }] }),
    );
    expect(card).not.toContain("TEL");
    expect(card).not.toContain("wa.me");
  });

  it("adds a WhatsApp item from the mobile number without duplicating TEL", () => {
    const card = encodeVCard(
      base({
        firstName: "Rahim",
        whatsappSameAsMobile: true,
        phones: [{ type: "CELL", value: "01712345678" }],
      }),
    );
    expect(card.match(/^TEL/gm)).toHaveLength(1);
    expect(card).toContain("item1.URL:https://wa.me/8801712345678\r\nitem1.X-ABLabel:WhatsApp");
  });

  it("adds a separate WhatsApp number as TEL;TYPE=CELL so it lands in the phonebook", () => {
    const card = encodeVCard(
      base({
        firstName: "Rahim",
        whatsappSameAsMobile: false,
        whatsapp: "01812345678",
        phones: [{ type: "WORK", value: "01712345678" }],
      }),
    );
    expect(card).toContain("TEL;TYPE=WORK:+8801712345678");
    expect(card).toContain("TEL;TYPE=CELL:+8801812345678");
    expect(card).toContain("item1.URL:https://wa.me/8801812345678");
  });

  it("numbers social links after WhatsApp with itemN labels", () => {
    const card = encodeVCard(
      base({
        firstName: "Rahim",
        phones: [{ type: "CELL", value: "01712345678" }],
        linkedin: "linkedin.com/in/rahim",
        x: "https://x.com/rahim",
      }),
    );
    expect(card).toContain("item2.URL:https://linkedin.com/in/rahim\r\nitem2.X-ABLabel:LinkedIn");
    expect(card).toContain("item3.URL:https://x.com/rahim\r\nitem3.X-ABLabel:X");
  });

  it("adds CHARSET=UTF-8 only to lines with non-ASCII text", () => {
    const card = encodeVCard(base({ firstName: "রহিম", lastName: "", org: "Acme", title: "CEO" }));
    expect(card).toContain("FN;CHARSET=UTF-8:রহিম");
    expect(card).toContain("ORG:Acme");
    expect(card).toContain("TITLE:CEO");
  });

  it("can leave out the WhatsApp link but still saves the number as a mobile", () => {
    const card = encodeVCard(
      base({
        firstName: "Rahim",
        whatsappSameAsMobile: false,
        whatsapp: "01812345678",
        whatsappLink: false,
      }),
    );
    expect(card).toContain("TEL;TYPE=CELL:+8801812345678");
    expect(card).not.toContain("wa.me");
    expect(card).not.toContain("item1");
  });

  it("never includes a PHOTO property", () => {
    expect(encodeVCard(base({ firstName: "Rahim" }))).not.toContain("PHOTO");
  });

  it("matches a snapshot of a full card", () => {
    const card = encodeVCard({
      firstName: "রহিম",
      lastName: "Uddin",
      org: "Acme, Ltd.",
      title: "Head of Sales; APAC",
      phones: [
        { type: "CELL", value: "01712-345678" },
        { type: "WORK", value: "+880 2 9876543" },
      ],
      emails: [{ type: "WORK", value: "rahim@acme.com" }],
      website: "acme.com",
      whatsappSameAsMobile: true,
      whatsapp: "",
      linkedin: "linkedin.com/in/rahim",
      facebook: "",
      instagram: "instagram.com/rahim",
      x: "",
      address: {
        type: "WORK",
        street: "House 1, Road 2",
        city: "Dhaka",
        region: "Dhaka",
        postcode: "1212",
        country: "Bangladesh",
      },
      note: "Met at the expo.\nCall after 5pm.",
    });
    expect(lines(card)).toMatchSnapshot();
  });
});
