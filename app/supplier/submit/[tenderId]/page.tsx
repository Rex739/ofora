import { SupplierSubmissionFlow } from "@/components/supplier/supplier-submission-flow";

export default async function SupplierSubmitPage({ params }: { params: Promise<{ tenderId: string }> }) {
  const { tenderId } = await params;
  return <SupplierSubmissionFlow tenderId={tenderId} />;
}
