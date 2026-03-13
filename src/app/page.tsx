import { HomePageClient } from "@/components/HomePageClient";

type HomePageProps = {
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

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const initialInviteCode = getCodeParam(params.code);

  return <HomePageClient initialInviteCode={initialInviteCode} />;
}
