import { WelcomeScreenDesignerClient } from "@/features/welcome/components/WelcomeScreenDesignerClient";

interface WelcomePageProps {
  params: Promise<{
    eventSlug: string;
  }>;
}

export default async function WelcomePage({ params }: WelcomePageProps) {
  const { eventSlug } = await params;
  return <WelcomeScreenDesignerClient eventSlug={eventSlug} />;
}
