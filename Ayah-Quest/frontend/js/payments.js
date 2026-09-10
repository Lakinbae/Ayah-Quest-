/**
 * Ayah Quest - Payment Flow (Telebirr + Telegram Stars)
 */

import { api } from "./api.js";

export const PaymentManager = {
  pricing: {
    telebirrETB: 50,
    telebirrNumber: "0938054751",
    telebirrName: "Lakin",
    starsAmount: 20,
    supportUser: "@luck_7n"
  },

  async startStarsPayment() {
    try {
      const res = await api.createStarsInvoice();
      if (res.invoice_link) {
        if (window.Telegram?.WebApp?.openInvoice) {
          window.Telegram.WebApp.openInvoice(res.invoice_link, (status) => {
            console.log("Invoice status:", status);
          });
        } else {
          window.location.href = res.invoice_link;
        }
        return { success: true };
      }
      throw new Error("No invoice link received");
    } catch (err) {
      console.error("Stars invoice error:", err);
      throw err;
    }
  },

  async submitTelebirrPayment(referenceNumber, screenshotUrl = null) {
    if (!referenceNumber || referenceNumber.trim().length < 5) {
      throw new Error("Please enter a valid Telebirr Reference Number");
    }

    return await api.submitTelebirrPayment(referenceNumber.trim(), screenshotUrl);
  },

  async checkProStatus() {
    return await api.getProStatus();
  }
};
