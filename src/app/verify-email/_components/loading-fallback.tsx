import { RefreshCw } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export const LoadingFallback = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-center text-gray-600">Carregando...</p>
        </CardContent>
      </Card>
    </div>
  );
};
