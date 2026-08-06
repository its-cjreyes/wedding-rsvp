import { render } from "@react-email/render";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { MealPreferenceEmail } from "@/emails/MealPreferenceEmail";
import { buildMealPreferenceUrl } from "@/lib/meal-preference-email";

import styles from "../wedding-invite/page.module.scss";

type EmailPreviewPageProps = {
  searchParams: Promise<{
    code?: string | string[];
    mealPreferenceUrl?: string | string[];
  }>;
};

const getParam = (value: string | string[] | undefined, fallback: string) => {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value) && value[0]?.trim()) return value[0].trim();
  return fallback;
};

export default async function MealPreferenceEmailPreviewPage({
  searchParams,
}: EmailPreviewPageProps) {
  if (process.env.NODE_ENV === "production") notFound();

  const params = await searchParams;
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const assetBaseUrl = `${protocol}://${host}`;
  const inviteCode = getParam(params.code, "HELLO30");
  const mealPreferenceUrl = getParam(
    params.mealPreferenceUrl,
    buildMealPreferenceUrl(inviteCode)
  );

  const html = await render(
    <MealPreferenceEmail
      inviteCode={inviteCode}
      mealPreferenceUrl={mealPreferenceUrl}
      assetBaseUrl={assetBaseUrl}
    />
  );

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Meal Preference Email Preview</h1>
          <p>Local-only preview of the actual rendered email HTML.</p>
        </div>

        <div className={styles.meta}>
          <span>code: {inviteCode}</span>
          <span>mealPreferenceUrl: {mealPreferenceUrl}</span>
        </div>

        <div className={styles.frameWrap}>
          <iframe
            title="Meal preference email preview"
            className={styles.frame}
            srcDoc={html}
          />
        </div>

        <p className={styles.help}>
          Edit <code>src/emails/MealPreferenceEmail.tsx</code> to add the final copy.
        </p>
      </main>
    </div>
  );
}
