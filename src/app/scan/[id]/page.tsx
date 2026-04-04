import ScannerPage from '@/components/ScannerPage';

interface ScanPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: ScanPageProps) {
  const { id } = await params;
  return <ScannerPage participantId={id} />;
}
