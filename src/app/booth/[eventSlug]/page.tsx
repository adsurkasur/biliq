import { BoothClient } from "@/features/booth/components/BoothClient";

interface BoothPageProps {
  params: Promise<{
    eventSlug: string;
  }>;
}

export default async function BoothPage({ params }: BoothPageProps) {
  const { eventSlug } = await params;
  return <BoothClient eventSlug={eventSlug} />;
}
