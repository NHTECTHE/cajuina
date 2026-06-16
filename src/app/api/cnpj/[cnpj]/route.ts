import { NextRequest, NextResponse } from "next/server";

// Usa a BrasilAPI (pública, sem chave) como fonte primária,
// com fallback para a ReceitaWS.
const BRASILAPI = "https://brasilapi.com.br/api/cnpj/v1";
const RECEITAWS = "https://www.receitaws.com.br/v1/cnpj";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ cnpj: string }> }
) {
  const { cnpj } = await params;
  const digits = cnpj.replace(/\D/g, "");

  if (digits.length !== 14) {
    return NextResponse.json({ error: "CNPJ inválido" }, { status: 400 });
  }

  // Tenta BrasilAPI primeiro
  try {
    const res = await fetch(`${BRASILAPI}/${digits}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 }, // cache 24h — dados da Receita mudam raramente
    });

    if (res.ok) {
      const raw = await res.json();
      return NextResponse.json({ data: normalizeBrasilApi(raw) });
    }
  } catch {
    // BrasilAPI indisponível, tenta fallback
  }

  // Fallback: ReceitaWS
  try {
    const res = await fetch(`${RECEITAWS}/${digits}`, {
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      const raw = await res.json();
      if (raw.status === "ERROR") {
        return NextResponse.json({ error: raw.message ?? "CNPJ não encontrado" }, { status: 404 });
      }
      return NextResponse.json({ data: normalizeReceitaWs(raw) });
    }
  } catch {
    // ambos falharam
  }

  return NextResponse.json({ error: "Não foi possível consultar o CNPJ" }, { status: 502 });
}

// Normaliza resposta da BrasilAPI para o shape que o front espera
function normalizeBrasilApi(r: Record<string, unknown>) {
  const socios = (r.qsa as Array<Record<string, unknown>> | undefined) ?? [];
  return {
    razao_social: r.razao_social ?? "",
    nome_fantasia: r.nome_fantasia ?? "",
    email: r.email ?? "",
    telefone: r.ddd_telefone_1
      ? formatPhone(String(r.ddd_telefone_1))
      : "",
    cep: r.cep ? String(r.cep).replace(/\D/g, "").replace(/^(\d{5})(\d{3})$/, "$1-$2") : "",
    logradouro: r.logradouro ?? "",
    numero: r.numero ?? "",
    complemento: r.complemento ?? "",
    bairro: r.bairro ?? "",
    municipio: r.municipio ?? "",
    uf: r.uf ?? "",
    socios: socios.map((s) => ({
      nome: s.nome_socio ?? s.nome ?? "",
      cpf: s.cnpj_cpf_do_socio ? String(s.cnpj_cpf_do_socio) : "",
      qualificacao: s.qualificacao_socio ?? "",
    })),
  };
}

// Normaliza resposta da ReceitaWS para o mesmo shape
function normalizeReceitaWs(r: Record<string, unknown>) {
  const socios = (r.qsa as Array<Record<string, unknown>> | undefined) ?? [];
  return {
    razao_social: r.nome ?? "",
    nome_fantasia: r.fantasia ?? "",
    email: r.email ?? "",
    telefone: r.telefone ? formatPhone(String(r.telefone)) : "",
    cep: r.cep ? String(r.cep).replace(/\D/g, "").replace(/^(\d{5})(\d{3})$/, "$1-$2") : "",
    logradouro: r.logradouro ?? "",
    numero: r.numero ?? "",
    complemento: r.complemento ?? "",
    bairro: r.bairro ?? "",
    municipio: r.municipio ?? "",
    uf: r.uf ?? "",
    socios: socios.map((s) => ({
      nome: s.nome ?? "",
      cpf: "",
      qualificacao: s.qual ?? "",
    })),
  };
}

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  return raw;
}
