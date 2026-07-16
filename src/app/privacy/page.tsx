import type { Metadata } from "next";

import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: "Política de Privacidade | M.Agendy",
  description: "Como o M.Agendy coleta, usa e protege dados pessoais.",
};

const PrivacyPage = () => {
  return (
    <LegalPageLayout
      title="Política de Privacidade"
      updatedAt="16 de julho de 2026"
    >
      <p>
        <strong>
          Aviso: este documento é um modelo inicial e precisa ser revisado por
          um advogado especialista em LGPD/dados de saúde antes de entrar em
          vigor.
        </strong>{" "}
        O M.Agendy trata dados de saúde, considerados dados sensíveis pela Lei
        Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD), o que exige
        cuidado redobrado com base legal, retenção e segurança.
      </p>

      <h2>1. Quem somos e como contatar</h2>
      <p>
        [RAZÃO SOCIAL], CNPJ [CNPJ], é a controladora dos dados coletados
        diretamente por meio do site e da conta de assinante (dono da
        clínica). Para os dados de pacientes cadastrados por clínicas
        clientes, o M.Agendy atua como <strong>operador</strong>, e a clínica
        é a <strong>controladora</strong>. Contato do encarregado (DPO):
        [E-MAIL DO DPO] — enquanto não definido, use contato@magendy.com.br.
      </p>

      <h2>2. Quais dados coletamos</h2>
      <ul>
        <li>
          <strong>Da clínica/profissional (assinante):</strong> nome, e-mail,
          telefone, dados de pagamento (processados pelo gateway, não
          armazenados por nós).
        </li>
        <li>
          <strong>Do paciente (inseridos pela clínica ou pelo próprio
          paciente no agendamento online):</strong> nome, e-mail, telefone,
          sexo, histórico de agendamentos.
        </li>
        <li>
          <strong>Dados de saúde (prontuário eletrônico):</strong> alergias,
          medicamentos em uso, antecedentes clínicos/cirúrgicos/familiares,
          hábitos, diagnósticos (incluindo CID-10), prescrições e evolução do
          atendimento. Estes são dados sensíveis (art. 5º, II, LGPD).
        </li>
        <li>
          <strong>Comunicação via WhatsApp:</strong> número de telefone e
          conteúdo das mensagens trocadas com o assistente de agendamento.
        </li>
      </ul>

      <h2>3. Para que usamos os dados (finalidade e base legal)</h2>
      <ul>
        <li>
          Prestar o serviço de agendamento e confirmação/lembrete via
          WhatsApp — <em>execução de contrato</em> (art. 7º, V).
        </li>
        <li>
          Manter o prontuário eletrônico do paciente — <em>tutela da saúde</em>{" "}
          e cumprimento de obrigação regulatória do profissional de saúde
          (art. 11, II, &quot;f&quot;), conduzido pela clínica como
          controladora.
        </li>
        <li>
          Processar pagamentos das assinaturas — execução de contrato,
          intermediado por gateway de pagamento (Stripe).
        </li>
        <li>
          Melhorar a Plataforma e prevenir fraude/abuso — legítimo interesse.
        </li>
      </ul>

      <h2>4. Com quem compartilhamos</h2>
      <ul>
        <li>
          <strong>Meta (WhatsApp Business/Cloud API):</strong> para envio e
          recebimento de mensagens de confirmação e lembrete.
        </li>
        <li>
          <strong>Stripe:</strong> processamento de pagamentos das
          assinaturas.
        </li>
        <li>
          <strong>Provedor de hospedagem e banco de dados:</strong>{" "}
          armazenamento da infraestrutura da Plataforma.
        </li>
      </ul>
      <p>Não vendemos dados pessoais a terceiros.</p>

      <h2>5. Retenção dos dados</h2>
      <p>
        Dados de prontuário são mantidos pelo prazo exigido pelas normas
        aplicáveis ao profissional de saúde responsável (em geral, prazo
        mínimo estendido para registros médicos). Dados de conta e cobrança
        são mantidos enquanto durar o relacionamento e pelo prazo legal
        subsequente exigido para fins fiscais/contábeis.
      </p>

      <h2>6. Segurança</h2>
      <p>
        Utilizamos conexão criptografada (TLS) entre a aplicação e o banco de
        dados, controle de acesso por papel (equipe da clínica não vê dados
        de outras clínicas) e trilha de auditoria de acesso ao prontuário.
        Nenhum sistema é 100% imune a incidentes; em caso de incidente de
        segurança relevante, notificaremos a ANPD e os titulares afetados
        conforme exigido pela LGPD.
      </p>

      <h2>7. Seus direitos (art. 18 da LGPD)</h2>
      <p>
        Você pode solicitar confirmação de tratamento, acesso, correção,
        anonimização, portabilidade, eliminação dos dados (respeitadas as
        obrigações legais de retenção de prontuário) e informação sobre
        compartilhamento, além de revogar consentimentos quando aplicável.
        Solicitações devem ser feitas à clínica onde você é paciente (a
        controladora dos seus dados de saúde) ou, para dados da conta de
        assinante, diretamente a contato@magendy.com.br.
      </p>

      <h2>8. Cookies</h2>
      <p>
        Usamos cookies essenciais de sessão/autenticação e, quando aplicável,
        cookies de análise de uso. Veja detalhes na nossa{" "}
        <a href="/cookies" className="text-cta underline">
          Política de Cookies
        </a>
        .
      </p>

      <h2>9. Alterações desta política</h2>
      <p>
        Podemos atualizar esta política periodicamente. A data da última
        atualização está no topo desta página.
      </p>
    </LegalPageLayout>
  );
};

export default PrivacyPage;
