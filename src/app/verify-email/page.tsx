import { Suspense } from "react";

import { LoadingFallback } from "./_components/loading-fallback";
import { VerifyEmailContent } from "./_components/verify-email-content";

const VerifyEmailPage = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
};

export default VerifyEmailPage;
