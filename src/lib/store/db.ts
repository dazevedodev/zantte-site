import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let client: NeonQueryFunction<false, false> | null = null;

// Lazy de propósito: chamar neon() no topo do módulo faz o Next tentar
// avaliar isso durante o build (mesmo em rotas dynamic="force-dynamic"),
// o que quebra o build local antes de DATABASE_URL existir. Só cria o
// client de verdade na primeira query, em tempo de request.
function getClient() {
  if (!client) {
    client = neon(process.env.DATABASE_URL!);
  }
  return client;
}

export function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  return getClient()(strings, ...values);
}
