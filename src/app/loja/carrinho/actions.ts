"use server";

import { redirect } from "next/navigation";
import { getProductById } from "@/lib/store/products";
import { createOrder, setOrderPreference, setOrderPixPayment } from "@/lib/store/orders";
import { createOrderPreference, createPixPayment, PIX_EXPIRATION_MINUTES } from "@/lib/store/mercadopago";
import { estimateCartShipping } from "@/lib/store/shipping";
import { onlyDigits, isValidCpf } from "@/lib/store/format";
import { sendOrderCreatedEmail } from "@/lib/store/email";

export type CartCheckoutState = { error: string } | null;

function requireField(formData: FormData, name: string): string {
  const value = formData.get(name);
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`campo obrigatório: ${name}`);
  }
  return value.trim();
}

export async function createCartOrderAction(
  _prevState: CartCheckoutState,
  formData: FormData,
): Promise<CartCheckoutState> {
  let redirectUrl: string;

  try {
    const cartJson = formData.get("cartJson");
    if (typeof cartJson !== "string") return { error: "carrinho vazio" };

    const cartInput = JSON.parse(cartJson) as {
      productId: string;
      variantName: string | null;
      quantity: number;
    }[];
    if (!Array.isArray(cartInput) || cartInput.length === 0) {
      return { error: "carrinho vazio" };
    }

    // nunca confiar no preço/nome que veio do carrinho do navegador — rebusca
    // cada produto no banco pra pegar os dados de verdade antes de cobrar.
    // o mesmo vale pro frete: o valor calculado no navegador é só preview,
    // quem decide o que é cobrado é o recálculo aqui embaixo.
    const items: {
      productId: string;
      productName: string;
      unitPriceCents: number;
      quantity: number;
      variantName: string | null;
    }[] = [];
    const shippingItems: { product: NonNullable<Awaited<ReturnType<typeof getProductById>>>; quantity: number }[] =
      [];
    for (const entry of cartInput) {
      const quantity = Math.max(1, Math.floor(Number(entry.quantity)) || 1);
      const product = await getProductById(entry.productId);
      if (!product || !product.active) {
        return { error: `um dos produtos do carrinho não está mais disponível` };
      }
      items.push({
        productId: product.id,
        productName: product.name,
        unitPriceCents: product.priceCents,
        quantity,
        variantName: typeof entry.variantName === "string" ? entry.variantName : null,
      });
      shippingItems.push({ product, quantity });
    }

    const customerName = requireField(formData, "customerName");
    const customerEmail = requireField(formData, "customerEmail");
    const customerPhone = onlyDigits(requireField(formData, "customerPhone"));
    const customerCpf = onlyDigits(requireField(formData, "customerCpf"));

    if (!isValidCpf(customerCpf)) {
      return { error: "CPF inválido — confere se digitou certo, o Mercado Pago recusa CPF errado sem avisar" };
    }
    if (customerPhone.length < 10 || customerPhone.length > 11) {
      return { error: "telefone inválido" };
    }

    const shippingCep = onlyDigits(requireField(formData, "shippingCep"));
    if (shippingCep.length !== 8) return { error: "CEP inválido" };

    const shippingStreet = requireField(formData, "shippingStreet");
    const shippingNumber = requireField(formData, "shippingNumber");
    const shippingComplement = (formData.get("shippingComplement") as string | null)?.trim() || null;
    const shippingNeighborhood = requireField(formData, "shippingNeighborhood");
    const shippingCity = requireField(formData, "shippingCity");
    const shippingState = requireField(formData, "shippingState").toUpperCase().slice(0, 2);

    const shipping = await estimateCartShipping(shippingItems, shippingCep);

    const order = await createOrder({
      items,
      customerName,
      customerEmail,
      customerPhone,
      customerCpf,
      shippingCep,
      shippingStreet,
      shippingNumber,
      shippingComplement,
      shippingNeighborhood,
      shippingCity,
      shippingState,
      shippingCostCents: shipping.costCents,
      shippingDaysEstimate: shipping.daysEstimate,
    });

    const preference = await createOrderPreference(order);
    if (!preference.id || !preference.init_point) {
      return { error: "não foi possível iniciar o pagamento, tenta de novo" };
    }
    await setOrderPreference(order.id, preference.id, preference.init_point);

    // Pix gerado direto pela API (não pelo checkout hospedado da MP) — assim
    // dá pra mostrar o código na própria página do pedido, que não some se
    // a pessoa sair da tela. Se essa chamada falhar, o pedido continua
    // válido: ela ainda paga com cartão pelo link da MP, ou gera o Pix de
    // novo na página do pedido.
    try {
      const pix = await createPixPayment(order, `pix-${order.id}`);
      const qrCode = pix.point_of_interaction?.transaction_data?.qr_code;
      const qrCodeBase64 = pix.point_of_interaction?.transaction_data?.qr_code_base64;
      if (pix.id && qrCode && qrCodeBase64) {
        await setOrderPixPayment(order.id, {
          mpPaymentId: String(pix.id),
          pixQrCode: qrCode,
          pixQrCodeBase64: qrCodeBase64,
          pixExpiresAt: pix.date_of_expiration ?? new Date(Date.now() + PIX_EXPIRATION_MINUTES * 60_000).toISOString(),
        });
      }
    } catch {
      // sem pix por enquanto — a página do pedido oferece gerar de novo.
    }

    try {
      await sendOrderCreatedEmail({
        ...order,
        mpPreferenceId: preference.id,
        mpInitPoint: preference.init_point,
      });
    } catch {
      // pedido e pagamento já foram criados; falha de e-mail não pode travar o checkout.
    }

    redirectUrl = `/pedido/${order.id}`;
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    return { error: "algo deu errado, tenta de novo" };
  }

  redirect(redirectUrl);
}
