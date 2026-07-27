import { HomePageClient } from "@/components/HomePageClient";

type HomePageProps = {
  searchParams: Promise<{
    code?: string | string[];
    flow?: string | string[];
    preview?: string | string[];
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
  const flow = getCodeParam(params.flow).toLowerCase();
  const preview = getCodeParam(params.preview).toLowerCase();

  return (
    <HomePageClient
      initialInviteCode={initialInviteCode}
      openMealPreferences={flow === "meal-preferences" || preview === "meal-preferences"}
      previewMealPreferences={preview === "meal-preferences"}
    />
  );
}
