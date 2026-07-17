"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const RenewSubscriptionButton = () => {
  const router = useRouter();
  return (
    <Button className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700" onClick={() => {
      router.push("/new-subscription");
    }}>Renovar assinatura</Button>
  );
};