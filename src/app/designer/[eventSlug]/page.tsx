import { LayoutDesignerClient } from "@/features/designer/components/LayoutDesignerClient";

interface DesignerPageProps {
  params: Promise<{
    eventSlug: string;
  }>;
}

export default async function DesignerPage({ params }: DesignerPageProps) {
  const { eventSlug } = await params;
  return <LayoutDesignerClient eventSlug={eventSlug} />;
}
