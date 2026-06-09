import { PrintClient } from "@/features/print/components/PrintClient";

interface PrintPageProps {
  params: Promise<{
    photoId: string;
  }>;
}

export default async function PrintPage({ params }: PrintPageProps) {
  const { photoId } = await params;
  return <PrintClient photoId={photoId} />;
}
