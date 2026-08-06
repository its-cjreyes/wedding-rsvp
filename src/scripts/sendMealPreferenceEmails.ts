import { loadEnvConfig } from "@next/env";

const args = new Set(process.argv.slice(2));
const sendDelayMs = 750;
const retryDelayMs = 1500;
const maxAttempts = 3;

loadEnvConfig(process.cwd());

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRateLimitError = (message: string) =>
  message.toLowerCase().includes("too many requests") || message.includes("429");

async function main() {
  if (!args.has("--confirm")) {
    console.error("Refusing to send meal-preference emails without --confirm.");
    console.error("Run: npm run send:meal-preferences -- --confirm");
    process.exit(1);
  }

  const [
    { listMealPreferenceRecipients, markMealPreferenceEmailSent },
    { sendMealPreferenceEmail },
  ] = await Promise.all([
    import("../lib/invite-recipients"),
    import("../lib/meal-preference-email"),
  ]);

  const recipients = await listMealPreferenceRecipients();

  if (recipients.length === 0) {
    console.log("No eligible, unsent meal-preference recipients were found.");
    return;
  }

  console.log(`Found ${recipients.length} eligible meal-preference recipient(s).`);

  const sentEmails: Array<{ guestId: string; email: string }> = [];
  const failedEmails: Array<{ guestId: string; email: string; reason: string }> = [];

  for (const recipient of recipients) {
    let sent = false;
    let lastReason = "Unknown email send failure.";

    console.log(`Sending ${recipient.email} for guest ${recipient.guestId}...`);

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const result = await sendMealPreferenceEmail({
          to: recipient.email,
          inviteCode: recipient.inviteCode,
        });

        if (result.error) throw new Error(result.error.message);

        await markMealPreferenceEmailSent(recipient.guestId);
        sent = true;
        sentEmails.push({ guestId: recipient.guestId, email: recipient.email });
        console.log(`Sent ${recipient.email} (${recipient.groupId}, code ${recipient.inviteCode})`);
        break;
      } catch (error) {
        lastReason = error instanceof Error ? error.message : "Unknown email send failure.";

        if (attempt < maxAttempts && isRateLimitError(lastReason)) {
          console.warn(
            `Rate limited for ${recipient.email}; retrying in ${retryDelayMs}ms (attempt ${attempt + 1}/${maxAttempts})`
          );
          await sleep(retryDelayMs);
        } else {
          break;
        }
      }
    }

    if (!sent) {
      failedEmails.push({
        guestId: recipient.guestId,
        email: recipient.email,
        reason: lastReason,
      });
      console.error(`Failed ${recipient.email}: ${lastReason}`);
    }

    await sleep(sendDelayMs);
  }

  console.log("Sent emails:");
  sentEmails.forEach(({ guestId, email }) => console.log(`- ${email} (${guestId})`));
  console.log("Failed emails:");
  failedEmails.forEach(({ guestId, email, reason }) =>
    console.log(`- ${email} (${guestId}): ${reason}`)
  );
  console.log(`Total successfully sent: ${sentEmails.length}`);
  console.log(`Total failed: ${failedEmails.length}`);

  if (failedEmails.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Unexpected meal-preference email failure.");
  process.exit(1);
});
