import { Footer } from "@/components/footer";
import { COMPANY_CNPJ } from "@/lib/site-config";

// rodapé da loja — reaproveita o rodapé padrão, só acrescenta os links que
// só fazem sentido pra quem tá comprando (termos, dúvidas) na MESMA fileira
// de links, e o CNPJ embaixo quando preenchido.
export function StoreFooter() {
  return (
    <>
      <Footer
        extraLinks={[
          { href: "/loja/duvidas", label: "Dúvidas frequentes" },
          { href: "/loja/termos", label: "Termos e privacidade" },
        ]}
      />
      {COMPANY_CNPJ && <p className="store-footer-cnpj">Zantte — CNPJ {COMPANY_CNPJ}</p>}
    </>
  );
}
