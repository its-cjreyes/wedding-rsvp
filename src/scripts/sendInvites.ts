import { loadEnvConfig } from "@next/env";

const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);
const sendDelayMs = 750;
const retryDelayMs = 1500;
const maxAttempts = 3;

loadEnvConfig(process.cwd());

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRateLimitError = (message: string) =>
  message.toLowerCase().includes("too many requests") || message.includes("429");

const getRoundArg = () => {
  const inlineRound = rawArgs.find((arg) => arg.startsWith("--round="));

  if (inlineRound) {
    return inlineRound.split("=")[1]?.trim() ?? "";
  }

  const roundFlagIndex = rawArgs.findIndex((arg) => arg === "--round");

  if (roundFlagIndex >= 0) {
    return rawArgs[roundFlagIndex + 1]?.trim() ?? "";
  }

  return "";
};

async function main() {
  if (!args.has("--confirm")) {
    console.error("Refusing to send invites without --confirm.");
    console.error("Run: npm run send:invites -- --round=1 --confirm");
    process.exit(1);
  }

  const round = getRoundArg();

  if (!round) {
    console.error("Missing required round. Run: npm run send:invites -- --round=1 --confirm");
    process.exit(1);
  }

  const [
    { listInviteRecipientGroupsForRound, markInviteGroupSent },
    { sendWeddingInviteEmail },
  ] = await Promise.all([
    import("../lib/invite-recipients"),
    import("../lib/invite-email"),
  ]);

  const groups = await listInviteRecipientGroupsForRound(round);

  if (groups.length === 0) {
    console.log(`No unsent invite groups were found for round ${round}.`);
    return;
  }

  console.log(`Found ${groups.length} unsent invite group(s) for round ${round}.`);

  let attemptedCount = 0;
  let sentCount = 0;
  let groupsMarkedSent = 0;
  const sentEmails: Array<{ groupId: string; email: string }> = [];
  const failedEmails: Array<{ groupId: string; email: string; reason: string }> = [];
  const groupUpdateFailures: Array<{ groupId: string; reason: string }> = [];

  for (const group of groups) {
    console.log(
      `Processing group ${group.groupId} (${group.recipients.length} email${group.recipients.length === 1 ? "" : "s"})`
    );

    let groupSucceeded = true;

    for (const recipient of group.recipients) {
      attemptedCount += 1;
      let sent = false;
      let lastReason = "Unknown email send failure.";

      console.log(`Sending ${recipient.email} for group ${group.groupId}...`);

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
          sentEmails.push({ groupId: group.groupId, email: recipient.email });
          console.log(
            `Sent ${recipient.email} (${group.groupId}, code ${recipient.inviteCode})`
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
        groupSucceeded = false;
        failedEmails.push({
          groupId: group.groupId,
          email: recipient.email,
          reason: lastReason,
        });
        console.error(`Failed ${recipient.email} (${group.groupId}): ${lastReason}`);
      }

      await sleep(sendDelayMs);
    }

    if (groupSucceeded) {
      try {
        await markInviteGroupSent(group.groupId);
        groupsMarkedSent += 1;
        console.log(`Marked group ${group.groupId} as invite_sent=true`);
      } catch (error) {
        const reason =
          error instanceof Error ? error.message : "Unknown invite_sent update failure.";
        groupUpdateFailures.push({ groupId: group.groupId, reason });
        console.error(`Failed to mark group ${group.groupId} as sent: ${reason}`);
      }
    } else {
      console.warn(`Group ${group.groupId} was not marked sent because at least one email failed.`);
    }
  }

  console.log("Sent emails:");
  sentEmails.forEach(({ groupId, email }) => console.log(`- ${email} (${groupId})`));

  console.log("Failed emails:");
  failedEmails.forEach(({ groupId, email, reason }) =>
    console.log(`- ${email} (${groupId}): ${reason}`)
  );

  if (groupUpdateFailures.length > 0) {
    console.log("Group update failures:");
    groupUpdateFailures.forEach(({ groupId, reason }) =>
      console.log(`- ${groupId}: ${reason}`)
    );
  }

  console.log(`Total groups processed: ${groups.length}`);
  console.log(`Total emails attempted: ${attemptedCount}`);
  console.log(`Total emails successfully sent: ${sentCount}`);
  console.log(`Total emails failed: ${failedEmails.length}`);
  console.log(`Total groups marked sent: ${groupsMarkedSent}`);

  if (failedEmails.length > 0 || groupUpdateFailures.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Unexpected invite send failure.");
  process.exit(1);
});
