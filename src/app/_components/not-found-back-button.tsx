"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export const NotFoundBackButton = () => {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      className="cursor-pointer"
      onClick={() => router.back()}
    >
      Voltar
    </Button>
  );
};
