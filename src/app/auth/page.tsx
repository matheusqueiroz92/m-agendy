"use client";

import Image from "next/image";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import logo from "../../../public/images/logo-white.png";
import LoginForm from "./components/login-form";
import RegisterForm from "./components/register-form";

const AuthenticationPage = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      {/* Coluna da esquerda */}
      <div className="flex h-screen w-[50vw] flex-col items-center justify-center gap-12 bg-[url('/images/login-image.jpg')] bg-cover bg-center">
        <Image src={logo} alt="login-image" width={200} height={200} />
        <div>
          <h1 className="text-center text-3xl font-bold text-white">
            Bem-vindo de volta!
          </h1>
          <p className="text-center text-lg text-white">
            Acesse sua conta e gerencie os agendamentos de sua empresa.
          </p>
        </div>
      </div>

      {/* Coluna da direita */}
      <div className="flex h-[50vh] w-[50vw] flex-col items-center justify-center">
        <Tabs defaultValue="login" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Criar conta</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthenticationPage;
