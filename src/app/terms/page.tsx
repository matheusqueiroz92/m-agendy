import type { Metadata } from "next";

import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: "Termos de Uso | M.Agendy",
  description: "Termos de uso da plataforma M.Agendy.",
};

const TermsPage = () => {
  return (
    <LegalPageLayout title="Termos de Uso" updatedAt="16 de julho de 2026">
      <p>
        <strong>
          Aviso: este documento é um modelo inicial e precisa ser revisado por
          um advogado antes de entrar em vigor comercialmente.
        </strong>{" "}
        Preencha os campos entre colchetes (razão social, CNPJ, endereço) com
        os dados reais da empresa responsável pelo M.Agendy.
      </p>

      <p>
        Estes Termos de Uso regem a utilização da plataforma M.Agendy
        (&quot;Plataforma&quot;), operada por [RAZÃO SOCIAL], inscrita no CNPJ
        sob o nº [CNPJ], com sede em [ENDEREÇO] (&quot;M.Agendy&quot;,
        &quot;nós&quot;). Ao criar uma conta ou utilizar a Plataforma, você
        (&quot;Cliente&quot;, &quot;Usuário&quot;) concorda com estes termos.
      </p>

      <h2>1. O que é o M.Agendy</h2>
      <p>
        O M.Agendy é um software como serviço (SaaS) de gestão de
        agendamentos e prontuário eletrônico para clínicas, consultórios e
        profissionais de saúde, incluindo agendamento online, confirmação e
        lembretes automáticos via WhatsApp, e registro de prontuário
        eletrônico.
      </p>

      <h2>2. Cadastro e responsabilidades do Cliente</h2>
      <ul>
        <li>
          O Cliente é responsável pela veracidade dos dados cadastrados e pela
          guarda de suas credenciais de acesso.
        </li>
        <li>
          O Cliente (profissional/clínica) é o controlador dos dados de seus
          pacientes inseridos na Plataforma; o M.Agendy atua como operador de
          dados, processando-os conforme instruções do Cliente e nossa
          Política de Privacidade.
        </li>
        <li>
          É proibido usar a Plataforma para fins ilícitos, envio de mensagens
          não solicitadas (spam) via WhatsApp, ou qualquer uso que viole
          direitos de terceiros.
        </li>
      </ul>

      <h2>3. Planos, cobrança e cancelamento</h2>
      <ul>
        <li>
          Os planos (Essential, Premium, Gold) e seus limites de uso estão
          descritos na página de preços e podem ser alterados mediante aviso
          prévio razoável.
        </li>
        <li>
          Quando oferecido, o teste grátis não exige cartão de crédito e dá
          acesso completo ao plano escolhido pelo período informado no
          momento da contratação. Ao final do período, o acesso é suspenso
          até a contratação de um plano pago.
        </li>
        <li>
          A cobrança dos planos pagos é processada por um gateway de
          pagamento terceirizado (atualmente Stripe). O cancelamento pode ser
          feito a qualquer momento pelo painel, sem multa, encerrando a
          cobrança no próximo ciclo.
        </li>
      </ul>

      <h2>4. Disponibilidade e limitação de responsabilidade</h2>
      <p>
        Envidamos esforços razoáveis para manter a Plataforma disponível, mas
        não garantimos operação ininterrupta. O M.Agendy não se responsabiliza
        por indisponibilidade de serviços de terceiros integrados (ex.:
        WhatsApp/Meta, gateway de pagamento) fora de nosso controle.
      </p>

      <h2>5. Propriedade intelectual</h2>
      <p>
        Marca, layout, código e demais elementos da Plataforma pertencem ao
        M.Agendy. O Cliente mantém a propriedade dos dados que insere.
      </p>

      <h2>6. Alterações destes Termos</h2>
      <p>
        Podemos atualizar estes Termos periodicamente. Alterações relevantes
        serão comunicadas por e-mail ou aviso na Plataforma.
      </p>

      <h2>7. Contato</h2>
      <p>
        Dúvidas sobre estes Termos: contato@magendy.com.br.
      </p>
    </LegalPageLayout>
  );
};

export default TermsPage;
