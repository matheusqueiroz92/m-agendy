import nodemailer from "nodemailer";

// Configuração do transporter
const createTransporter = () => {
  if (process.env.EMAIL_SERVICE === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App password for Gmail
      },
    });
  }

  // Configuração genérica SMTP
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

interface SendEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || "M.Agendy"}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("E-mail enviado com sucesso:", result.messageId);
    return result;
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    throw error;
  }
}

// Template para e-mail de verificação
export function createVerificationEmailTemplate(
  userName: string,
  verificationUrl: string,
): { subject: string; html: string; text: string } {
  const subject = "Verifique seu e-mail - M.Agendy";

  const html = `
    <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Verificação de E-mail</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            p,
            h2 {
              color: #fff;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #155dfc;
              color: white;
              padding: 20px;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: #09090b;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .button {
              display: inline-block;
              background-color: #155dfc;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0">M.Agendy</h1>
            </div>
            <div class="content">
              <img
                src="../../public/images/logo-m-agendy-com-nome-3.png"
                alt="logo-m-agendy"
                width="100px"
                height="100px"
              />
              <h2>Olá, ${userName}!</h2>
              <p>
                Obrigado por se cadastrar no M.Agendy. Para completar seu cadastro e
                começar a usar nossa plataforma, você precisa verificar seu endereço
                de e-mail.
              </p>

              <p>Clique no botão abaixo para verificar seu e-mail:</p>

              <a href="${verificationUrl}" class="button">Verificar E-mail</a>

              <p>
                Se o botão não funcionar, você pode copiar e colar o link abaixo no
                seu navegador:
              </p>
              <p style="word-break: break-all; color: #4f46e5">${verificationUrl}</p>

              <p><strong>Este link expira em 24 horas.</strong></p>

              <hr style="border: 1px solid #e5e7eb; margin: 30px 0" />

              <p>
                Se você não criou uma conta no M.Agendy, pode ignorar este e-mail com
                segurança.
              </p>
            </div>
            <div class="footer">
              <p>© 2024 M.Agendy. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
  `;

  const text = `
    Olá, ${userName}!

    Obrigado por se cadastrar no M.Agendy. Para completar seu cadastro, você precisa verificar seu endereço de e-mail.

    Clique no link abaixo para verificar seu e-mail:
    ${verificationUrl}

    Este link expira em 24 horas.

    Se você não criou uma conta no M.Agendy, pode ignorar este e-mail com segurança.

    © 2024 M.Agendy. Todos os direitos reservados.
  `;

  return { subject, html, text };
}
