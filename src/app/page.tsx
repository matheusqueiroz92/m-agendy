"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export default function Home() {
  const [variant, setVariant] = useState<string>("default");

  const changeColorButton = () => {
    setVariant(variant === "default" ? "outline" : "default");
  };

  return (
    <>
      <h1 className="p-4 text-center text-2xl font-bold">Página Home</h1>
      <div className="flex h-screen items-center justify-center">
        <Button
          className="p-10"
          variant={variant as "default" | "outline"}
          onClick={changeColorButton}
        >
          Clique para alterar a cor do botão!
        </Button>
      </div>
    </>
  );
}
