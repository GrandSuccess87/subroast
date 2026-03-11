/**
 * Sends a new-signup notification email to the owner whenever a new user
 * completes the OAuth flow for the first time.
 *
 * Uses Resend (https://resend.com) for transactional email delivery.
 * Falls back to a console warning if the API key is not configured.
 */

import { ENV } from "./_core/env";

const OWNER_EMAIL = "tessa.anderson@blackvectorhorizon.solutions";
const FROM_ADDRESS = "SubRoast <onboarding@resend.dev>";

export async function sendSignupEmail(params: {
  name: string | null;
  email: string | null;
  openId: string;
}): Promise<void> {
  if (!ENV.resendApiKey) {
    console.warn("[SignupEmail] RESEND_API_KEY not set — skipping signup email");
    return;
  }

  const displayName = params.name ?? "Unknown";
  const displayEmail = params.email ?? "No email provided";
  const signupTime = new Date().toLocaleString("en-US", {
    timeZone: "America/Chicago",
    dateStyle: "full",
    timeStyle: "short",
  });

  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #16a34a; margin-bottom: 4px;">🎉 New SubRoast Signup</h2>
      <p style="color: #6b7280; margin-top: 0;">Someone just joined SubRoast</p>
      <table style="width:100%; border-collapse:collapse; margin-top:16px;">
        <tr>
          <td style="padding:8px 12px; background:#f9fafb; border:1px solid #e5e7eb; font-weight:600; width:120px;">Name</td>
          <td style="padding:8px 12px; border:1px solid #e5e7eb;">${displayName}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px; background:#f9fafb; border:1px solid #e5e7eb; font-weight:600;">Email</td>
          <td style="padding:8px 12px; border:1px solid #e5e7eb;">${displayEmail}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px; background:#f9fafb; border:1px solid #e5e7eb; font-weight:600;">Signed up</td>
          <td style="padding:8px 12px; border:1px solid #e5e7eb;">${signupTime} CST</td>
        </tr>
      </table>
      <p style="margin-top:24px; font-size:12px; color:#9ca3af;">
        This is an automated notification from SubRoast. You'll receive one of these for every new user signup.
      </p>
    </div>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ENV.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [OWNER_EMAIL],
        subject: `🎉 New signup: ${displayName} just joined SubRoast`,
        html,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(`[SignupEmail] Resend API error (${response.status}): ${detail}`);
    } else {
      console.log(`[SignupEmail] Signup notification sent for user ${displayName} (${displayEmail})`);
    }
  } catch (err) {
    console.warn("[SignupEmail] Failed to send signup email:", err);
  }
}
