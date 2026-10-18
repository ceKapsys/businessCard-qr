import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";

import { FormPanel } from "@/components/form/FormPanel";
import { PayloadView } from "@/components/qr/PayloadView";
import { usePayload } from "@/hooks/usePayload";
import en from "@/i18n/en.json";
import { useFormStore } from "@/store/formStore";

function Harness() {
  const { encoder, payload } = usePayload();
  return (
    <>
      <FormPanel encoder={encoder} />
      <PayloadView payload={payload} />
    </>
  );
}

function renderHarness() {
  return render(
    <NextIntlClientProvider locale="en" messages={en} timeZone="UTC">
      <Harness />
    </NextIntlClientProvider>,
  );
}

beforeEach(() => {
  useFormStore.setState({ typeId: "vcard" });
  useFormStore.getState().reset();
});

describe("vCard form", () => {
  it("updates the encoded payload as the user types", async () => {
    const user = userEvent.setup();
    renderHarness();

    expect(screen.getByTestId("payload")).toHaveTextContent("Nothing to encode yet.");

    await user.type(screen.getByLabelText(/First name/), "রহিম");
    await user.type(screen.getByLabelText("Phone 1"), "01712345678");
    await user.type(screen.getByLabelText("Email 1"), "rahim@example.com");

    await waitFor(() => {
      const payload = screen.getByTestId("payload").textContent ?? "";
      expect(payload).toContain("FN;CHARSET=UTF-8:রহিম");
      expect(payload).toContain("TEL;TYPE=CELL:+8801712345678");
      expect(payload).toContain("EMAIL;TYPE=WORK:rahim@example.com");
      expect(payload).toContain("item1.URL:https://wa.me/8801712345678");
    });
  });

  it("shows a separate WhatsApp field when the toggle is off and flags invalid numbers", async () => {
    const user = userEvent.setup();
    renderHarness();

    expect(screen.queryByLabelText("WhatsApp number")).not.toBeInTheDocument();
    await user.click(screen.getByRole("switch", { name: /same as my mobile/ }));
    const wa = screen.getByLabelText("WhatsApp number");
    await user.type(wa, "12345");
    await user.tab();

    expect(await screen.findByText(/Enter a valid phone number/)).toBeInTheDocument();
    expect(wa).toHaveAttribute("aria-invalid", "true");
  });

  it("adds and removes repeatable rows", async () => {
    const user = userEvent.setup();
    renderHarness();

    await user.click(screen.getByRole("button", { name: "Add phone" }));
    expect(screen.getByLabelText("Phone 2")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove Phone 2" }));
    expect(screen.queryByLabelText("Phone 2")).not.toBeInTheDocument();
  });
});
