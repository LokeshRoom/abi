import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendEmail({
  to,
  subject,
  html,
  from = "Abi Photo Studio <onboarding@resend.dev>",
}: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}) {
  const recipients = Array.isArray(to) ? to : [to];

  // If using live key but it's the Resend onboarding sandbox, we must use onboarding@resend.dev.
  // Otherwise, if custom domain is verified, we can use it.
  // Let's use onboarding@resend.dev as default since it is the Resend default sandboxed sender.
  if (!resend) {
    console.log("=========================================");
    console.log("📧 DEVELOPMENT EMAIL SIMULATION 📧");
    console.log(`From:    ${from}`);
    console.log(`To:      ${recipients.join(", ")}`);
    console.log(`Subject: ${subject}`);
    console.log("Content (HTML):");
    console.log(html);
    console.log("=========================================");
    return { success: true, id: "simulated" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: recipients,
      subject,
      html,
    });

    if (error) {
      console.error("❌ Resend email sending failed:", error);
      return { success: false, error };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error("❌ Exception occurred during email sending:", err);
    return { success: false, error: err };
  }
}
