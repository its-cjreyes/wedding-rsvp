import { MealPreferenceEmail } from "../emails/MealPreferenceEmail";

import { resend } from "./resend";
import { getSiteUrl } from "./site-url";

type SendMealPreferenceEmailInput = {
  to: string;
  inviteCode: string;
};

export const buildMealPreferenceUrl = (inviteCode: string) => {
  const url = new URL("/", getSiteUrl());
  url.searchParams.set("flow", "meal-preferences");
  url.searchParams.set("code", inviteCode);
  return url.toString();
};

export async function sendMealPreferenceEmail({
  to,
  inviteCode,
}: SendMealPreferenceEmailInput) {
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();
  const replyToEmail = process.env.RESEND_REPLY_TO_EMAIL?.trim();

  if (!fromEmail) {
    throw new Error("RESEND_FROM_EMAIL is not configured.");
  }

  const mealPreferenceUrl = buildMealPreferenceUrl(inviteCode);

  return resend.emails.send({
    from: fromEmail,
    to,
    replyTo: replyToEmail || undefined,
    subject: "It's time to select your meal!",
    react: <MealPreferenceEmail inviteCode={inviteCode} mealPreferenceUrl={mealPreferenceUrl} />,
  });
}
