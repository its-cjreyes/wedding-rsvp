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
    console.error("Refusing to send invites without --confirm.");
    console.error("Run: npm run send:invites -- --confirm");
    process.exit(1);
  }

  const [{ listInviteRecipients }, { sendWeddingInviteEmail }] = await Promise.all([
    import("../lib/invite-recipients"),
    import("../lib/invite-email"),
  ]);

  const recipients = await listInviteRecipients();

  if (recipients.length === 0) {
    console.log("No sendable invite recipients were found.");
    return;
  }

  console.log(`Found ${recipients.length} invite recipient(s).`);

  let sentCount = 0;
  const failures: Array<{ email: string; reason: string }> = [];

  for (const recipient of recipients) {
    let sent = false;
    let lastReason = "Unknown email send failure.";

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const result = await sendWeddingInviteEmail({
          to: recipient.email,
          firstName: recipient.firstName,
          inviteCode: recipient.inviteCode,
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        sentCount += 1;
        sent = true;
        console.log(
          `Sent ${recipient.email} (${recipient.groupId}, code ${recipient.inviteCode})`
        );
        break;
      } catch (error) {
        lastReason =
          error instanceof Error ? error.message : "Unknown email send failure.";

        if (attempt < maxAttempts && isRateLimitError(lastReason)) {
          console.warn(
            `Rate limited for ${recipient.email}; retrying in ${retryDelayMs}ms (attempt ${attempt + 1}/${maxAttempts})`
          );
          await sleep(retryDelayMs);
          continue;
        }

        break;
      }
    }

    if (!sent) {
      failures.push({ email: recipient.email, reason: lastReason });
      console.error(`Failed ${recipient.email}: ${lastReason}`);
    }

    await sleep(sendDelayMs);
  }

  console.log(`Finished sending invites. Successes: ${sentCount}. Failures: ${failures.length}.`);

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Unexpected invite send failure.");
  process.exit(1);
});
