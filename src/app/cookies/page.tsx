import type { Metadata } from "next";

import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: "Política de Cookies | M.Agendy",
  description: "Como o M.Agendy usa cookies.",
};

const CookiesPage = () => {
  return (
    <LegalPageLayout title="Política de Cookies" updatedAt="16 de julho de 2026">
      <p>
        <strong>
          Aviso: revise este documento junto com a Política de Privacidade
          antes de publicar, ajustando à ferramenta de analytics/marketing
          que a empresa efetivamente utilizar.
        </strong>
      </p>

      <p>
        Cookies são pequenos arquivos armazenados no seu navegador. Usamos as
        categorias abaixo no M.Agendy:
      </p>

      <h2>1. Cookies essenciais</h2>
      <p>
        Necessários para o funcionamento da Plataforma: manter sua sessão
        autenticada (login) e lembrar preferências básicas (ex.: tema
        claro/escuro). Não podem ser desativados sem comprometer o uso do
        sistema.
      </p>

      <h2>2. Cookies de análise (quando ativos)</h2>
      <p>
        Podem ser usados para entender como visitantes usam o site (páginas
        mais acessadas, origem do tráfego), de forma agregada, para melhorar a
        Plataforma e a landing page.
      </p>

      <h2>3. Como gerenciar cookies</h2>
      <p>
        Você pode bloquear ou apagar cookies nas configurações do seu
        navegador. Bloquear cookies essenciais pode impedir o login e o uso
        do painel.
      </p>

      <h2>4. Contato</h2>
      <p>Dúvidas: contato@magendy.com.br.</p>
    </LegalPageLayout>
  );
};

export default CookiesPage;
