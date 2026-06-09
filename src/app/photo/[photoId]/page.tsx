import { PhotoDetailClient } from "@/features/photo/components/PhotoDetailClient";

interface PhotoPageProps {
  params: Promise<{
    photoId: string;
  }>;
}

export default async function PhotoPage({ params }: PhotoPageProps) {
  const { photoId } = await params;
  return <PhotoDetailClient photoId={photoId} />;
}
