import { PaymentGateway } from "../../application/ports/payment-gateway";
import { StripePaymentGateway } from "../gateways/stripe-payment-gateway";

/**
 * Seletor do gateway de pagamento. Define qual provedor está ativo via env
 * PAYMENT_GATEWAY (default: "stripe"). Para plugar Pagar.me/Mercado Pago,
 * implemente o adapter da porta e adicione um case aqui — é o único ponto que
 * conhece provedores concretos.
 */
export const makePaymentGateway = (): PaymentGateway => {
  const provider = (process.env.PAYMENT_GATEWAY ?? "stripe").toLowerCase();

  switch (provider) {
    case "stripe":
      return new StripePaymentGateway({
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      });
    // case "pagarme":
    //   return new PagarMePaymentGateway({ ... });
    // case "mercadopago":
    //   return new MercadoPagoPaymentGateway({ ... });
    default:
      throw new Error(`Gateway de pagamento não suportado: ${provider}`);
  }
};
