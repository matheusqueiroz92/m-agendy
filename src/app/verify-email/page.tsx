import { Suspense } from "react";

import { LoadingFallback } from "./_components/loading-fallback";
import { VerifyEmailContent } from "./_components/verify-email-content";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
