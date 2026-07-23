import { CardAuth } from "../_components/card-auth";
import PageAuthContainer from "../_components/page-auth-container";
import ForgotPasswordForm from "../_components/forgot-password-form";

const ForgotPasswordPage = async () => {
  return (
    <PageAuthContainer>
      <CardAuth
        title="Esqueceu sua senha?"
        description={{ text: "Informe seu e-mail e enviaremos um link para redefinir sua senha."}}
        content={<ForgotPasswordForm />} />
    </PageAuthContainer>
  );
};

export default ForgotPasswordPage;
