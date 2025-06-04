# Configuração de Verificação de E-mail

## Variáveis de Ambiente Necessárias

Para que a funcionalidade de verificação de e-mail funcione, você precisa configurar as seguintes variáveis de ambiente no seu arquivo `.env`:

### Configuração com Gmail (Recomendado)

```env
# Email Configuration
EMAIL_SERVICE="gmail"
EMAIL_USER="seu-email@gmail.com"
EMAIL_PASS="sua-senha-de-app"
EMAIL_FROM_NAME="M.Agendy"
```

### Como obter uma senha de app do Gmail:

1. Acesse sua conta Google
2. Vá para "Gerenciar sua Conta Google"
3. Clique em "Segurança"
4. Em "Como fazer login no Google", clique em "Senhas de app"
5. Selecione "E-mail" e "Outro (nome personalizado)"
6. Digite "M.Agendy" como nome
7. Use a senha gerada na variável `EMAIL_PASS`

### Configuração SMTP Genérica (Alternativa)

```env
# Email Configuration
EMAIL_USER="seu-email@provedor.com"
EMAIL_PASS="sua-senha"
EMAIL_FROM_NAME="M.Agendy"

# SMTP Configuration
SMTP_HOST="smtp.provedor.com"
SMTP_PORT="587"
SMTP_SECURE="false"
```

## Como Funciona

### Para Registro por E-mail/Senha:

1. **Registro**: Quando um usuário se registra com e-mail/senha, um e-mail de verificação é enviado automaticamente
2. **E-mail**: O usuário recebe um e-mail com um link de verificação
3. **Verificação**: Ao clicar no link, o usuário é redirecionado para `/verify-email?token=...`
4. **Ativação**: O sistema verifica o token e ativa a conta
5. **Redirecionamento**: O usuário é redirecionado para o dashboard

### Para Login OAuth (Google/GitHub):

1. **Login**: O usuário clica em "Entrar com Google" ou "Entrar com GitHub"
2. **Verificação Automática**: O e-mail é automaticamente considerado verificado pelo provedor OAuth
3. **Acesso Imediato**: O usuário é redirecionado diretamente para o dashboard
4. **Sem E-mail**: Não é enviado e-mail de verificação (não é necessário)

> **Nota**: A verificação de e-mail é obrigatória APENAS para registros por e-mail/senha. Usuários que se registram via OAuth (Google/GitHub) têm o e-mail automaticamente verificado.

## Páginas Criadas

- `/verify-email` - Página que informa sobre a verificação e processa tokens
- Template de e-mail HTML responsivo em português

## Funcionalidades Implementadas

- ✅ Envio automático de e-mail na criação de conta (apenas e-mail/senha)
- ✅ Template de e-mail em português com design profissional
- ✅ Verificação de token via URL
- ✅ Redirecionamento automático após verificação
- ✅ Mensagens de erro e sucesso
- ✅ Interface responsiva
- ✅ E-mail automaticamente verificado para OAuth (Google/GitHub)
- ✅ Distinção entre tipos de registro (e-mail/senha vs OAuth)

## Testando

1. Configure as variáveis de ambiente
2. Registre uma nova conta
3. Verifique sua caixa de entrada (e spam)
4. Clique no link de verificação
5. Você deve ser redirecionado para o dashboard

## Troubleshooting

- **E-mail não chega**: Verifique as credenciais e configurações SMTP
- **Erro de autenticação**: Para Gmail, certifique-se de usar uma senha de app
- **Link expirado**: Os links de verificação expiram em 24 horas
