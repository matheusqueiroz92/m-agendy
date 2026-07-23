import { CardAuth } from "../_components/card-auth";
import PageAuthContainer from "../_components/page-auth-container";
import SignInForm from "../_components/sign-in-form";

const SignInPage = async () => {
  return (
    <PageAuthContainer>
      <CardAuth
        title="Bem-vindo(a) de volta"
        description={{ text: "Não tem uma conta?", link: { href: "/auth/sign-up", textLink: "Cadastre-se gratuitamente." } }}
        content={<SignInForm />} />
    </PageAuthContainer>
  );
};

export default SignInPage;
