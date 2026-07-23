import SignUpForm from "../_components/sign-up-form";
import PageAuthContainer from "../_components/page-auth-container";
import { CardAuth } from "../_components/card-auth";

const SignUpPage = async () => {
  return (
    <PageAuthContainer>
      <CardAuth
        title="Cadastre-se gratuitamente"
        description={{ text: "Já tem uma conta?", link: { href: "/auth/sign-in", textLink: "Faça o login." } }}
        content={<SignUpForm />}
      />
    </PageAuthContainer>
  );
};

export default SignUpPage;