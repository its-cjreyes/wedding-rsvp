import { render } from "@react-email/render";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { WeddingInvite } from "@/emails/WeddingInvite";

import styles from "./page.module.scss";

type EmailPreviewPageProps = {
  searchParams: Promise<{
    firstName?: string | string[];
    code?: string | string[];
    rsvpUrl?: string | string[];
  }>;
};

const getParam = (value: string | string[] | undefined, fallback: string) => {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (Array.isArray(value) && value[0]?.trim()) {
    return value[0].trim();
  }

  return fallback;
};

export default async function WeddingInvitePreviewPage({
  searchParams,
}: EmailPreviewPageProps) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const params = await searchParams;
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const assetBaseUrl = `${protocol}://${host}`;
  const inviteCode = getParam(params.code, "HELLO30");
  const firstName = getParam(params.firstName, "CJ");
  const rsvpUrl = getParam(
    params.rsvpUrl,
    `${assetBaseUrl}/?code=${encodeURIComponent(inviteCode)}`
  );

  const html = await render(
    <WeddingInvite
      firstName={firstName}
      inviteCode={inviteCode}
      rsvpUrl={rsvpUrl}
      assetBaseUrl={assetBaseUrl}
    />
  );

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Wedding Invite Preview</h1>
          <p>
            Local-only preview of the actual rendered email HTML. Change the query params to tweak
            sample content without sending anything.
          </p>
        </div>

        <div className={styles.meta}>
          <span>firstName: {firstName}</span>
          <span>code: {inviteCode}</span>
          <span>rsvpUrl: {rsvpUrl}</span>
        </div>

        <div className={styles.frameWrap}>
          <iframe
            title="Wedding invite email preview"
            className={styles.frame}
            srcDoc={html}
          />
        </div>

        <p className={styles.help}>
          Try:
          {" "}
          <code>/email-preview/wedding-invite?firstName=Mac&amp;code=BEEP</code>
        </p>
      </main>
    </div>
  );
}
