import { LookupForm } from "@/components/LookupForm";

import styles from "./page.module.scss";

type RsvpPageProps = {
  searchParams: Promise<{
    code?: string | string[];
  }>;
};

const getCodeParam = (value: string | string[] | undefined) => {
  if (typeof value === "string") {
    return value;
  }

  return Array.isArray(value) ? value[0] ?? "" : "";
};

export default async function RsvpPage({ searchParams }: RsvpPageProps) {
  const params = await searchParams;
  const initialInviteCode = getCodeParam(params.code);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.heading}>
          <p className={styles.kicker}>Wedding RSVP</p>
          <h1>Enter your invitation code</h1>
          <p>Your email link can fill the code in for you, but you&apos;ll still confirm it here.</p>
        </div>

        <section className={styles.card}>
          <LookupForm initialInviteCode={initialInviteCode} />
        </section>
      </main>
    </div>
  );
}
