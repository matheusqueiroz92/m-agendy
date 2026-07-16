import type { Metadata } from "next";

import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: "LGPD | M.Agendy",
  description:
    "Como o M.Agendy trata dados pessoais e de saúde à luz da LGPD, e como exercer seus direitos.",
};

const LgpdPage = () => {
  return (
    <LegalPageLayout
      title="Conformidade com a LGPD"
      updatedAt="16 de julho de 2026"
    >
      <p>
        <strong>
          Aviso: revise com um advogado especialista em proteção de dados de
          saúde antes de publicar — em especial os prazos de retenção e o
          contato do encarregado (DPO).
        </strong>
      </p>

      <p>
        Esta página resume, em linguagem simples, como o M.Agendy trata dados
        pessoais e de saúde à luz da Lei Geral de Proteção de Dados (Lei nº
        13.709/2018). Para o detalhamento completo, veja nossa{" "}
        <a href="/privacy" className="text-cta underline">
          Política de Privacidade
        </a>
        .
      </p>

      <h2>Papéis: controlador e operador</h2>
      <p>
        Quando uma clínica cadastra pacientes e registra prontuários no
        M.Agendy, a <strong>clínica é a controladora</strong> dos dados
        desses pacientes (decide finalidade e meios do tratamento), e o{" "}
        <strong>M.Agendy atua como operador</strong> (trata os dados conforme
        instrução da clínica, fornecendo a infraestrutura). Isso significa que
        solicitações de titulares de dados (pacientes) devem ser dirigidas
        primeiro à clínica onde são atendidos.
      </p>

      <h2>Dados sensíveis de saúde</h2>
      <p>
        Alergias, medicamentos, diagnósticos, prescrições e demais campos do
        prontuário eletrônico são <strong>dados sensíveis</strong> (art. 5º,
        II, LGPD). Reservamos controles de acesso por papel dentro da
        clínica e registramos uma trilha de auditoria de acesso ao
        prontuário, para que seja possível identificar quem acessou o que e
        quando.
      </p>

      <h2>Como exercer seus direitos</h2>
      <ul>
        <li>
          <strong>Se você é paciente de uma clínica que usa o M.Agendy:</strong>{" "}
          solicite acesso, correção ou exclusão dos seus dados diretamente à
          clínica/profissional que o atende.
        </li>
        <li>
          <strong>Se você é dono(a) de uma conta/clínica assinante:</strong>{" "}
          escreva para contato@magendy.com.br solicitando acesso, correção,
          portabilidade ou eliminação dos dados da sua conta.
        </li>
      </ul>

      <h2>Encarregado de Proteção de Dados (DPO)</h2>
      <p>
        Contato do encarregado: [E-MAIL DO DPO] (defina antes de operar
        comercialmente — é obrigatório informar um encarregado nos termos da
        LGPD).
      </p>

      <h2>Incidentes de segurança</h2>
      <p>
        Em caso de incidente de segurança que possa acarretar risco ou dano
        relevante aos titulares, comunicaremos a Autoridade Nacional de
        Proteção de Dados (ANPD) e os titulares afetados, conforme exigido
        pela LGPD.
      </p>
    </LegalPageLayout>
  );
};

export default LgpdPage;
