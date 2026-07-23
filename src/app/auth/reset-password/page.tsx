import { CardAuth } from "../_components/card-auth";
import PageAuthContainer from "../_components/page-auth-container";
import ResetPasswordForm from "../_components/reset-password-form";

const ResetPasswordPage = async () => {
  return (
    <PageAuthContainer>
      <CardAuth
        title="Redefinir senha"
        description={{ text: "Crie uma nova senha para sua conta." }}
        content={<ResetPasswordForm />}
      />
    </PageAuthContainer>
  );
};

export default ResetPasswordPage;
