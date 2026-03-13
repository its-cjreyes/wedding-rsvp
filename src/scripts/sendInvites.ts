import { loadEnvConfig } from "@next/env";

const args = new Set(process.argv.slice(2));

loadEnvConfig(process.cwd());

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
      console.log(
        `Sent ${recipient.email} (${recipient.groupId}, code ${recipient.inviteCode})`
      );
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : "Unknown email send failure.";
      failures.push({ email: recipient.email, reason });
      console.error(`Failed ${recipient.email}: ${reason}`);
    }
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
