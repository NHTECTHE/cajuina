import { NextRequest, NextResponse } from "next/server";

// Fonte primária: BrasilAPI. Fallbacks: ReceitaWS → CNPJ.ws
const BRASILAPI = "https://brasilapi.com.br/api/cnpj/v1";
const RECEITAWS = "https://www.receitaws.com.br/v1/cnpj";
const CNPJWS = "https://publica.cnpj.ws/cnpj";

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
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const raw = await res.json();
      return NextResponse.json({ data: normalizeBrasilApi(raw) });
    }
  } catch {
    // BrasilAPI indisponível
  }

  // Fallback 1: ReceitaWS
  try {
    const res = await fetch(`${RECEITAWS}/${digits}`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const raw = await res.json();
      if (raw.status !== "ERROR") {
        return NextResponse.json({ data: normalizeReceitaWs(raw) });
      }
    }
  } catch {
    // ReceitaWS indisponível
  }

  // Fallback 2: CNPJ.ws
  try {
    const res = await fetch(`${CNPJWS}/${digits}`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const raw = await res.json();
      return NextResponse.json({ data: normalizeCnpjWs(raw) });
    }
  } catch {
    // CNPJ.ws indisponível
  }

  return NextResponse.json({ error: "Não foi possível consultar o CNPJ" }, { status: 502 });
}

function normalizeBrasilApi(r: Record<string, unknown>) {
  const socios = (r.qsa as Array<Record<string, unknown>> | undefined) ?? [];
  return {
    razao_social: r.razao_social ?? "",
    nome_fantasia: r.nome_fantasia ?? "",
    email: r.email ?? "",
    telefone: r.ddd_telefone_1 ? formatPhone(String(r.ddd_telefone_1)) : "",
    cep: r.cep ? String(r.cep).replace(/\D/g, "").replace(/^(\d{5})(\d{3})$/, "$1-$2") : "",
    natureza_juridica: r.natureza_juridica ? String(r.natureza_juridica) : "",
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

function normalizeReceitaWs(r: Record<string, unknown>) {
  const socios = (r.qsa as Array<Record<string, unknown>> | undefined) ?? [];
  return {
    razao_social: r.nome ?? "",
    nome_fantasia: r.fantasia ?? "",
    email: r.email ?? "",
    telefone: r.telefone ? formatPhone(String(r.telefone)) : "",
    cep: r.cep ? String(r.cep).replace(/\D/g, "").replace(/^(\d{5})(\d{3})$/, "$1-$2") : "",
    natureza_juridica: r.natureza_juridica ? String(r.natureza_juridica) : "",
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

function normalizeCnpjWs(r: Record<string, unknown>) {
  const estabelecimento = (r.estabelecimento as Record<string, unknown> | undefined) ?? r;
  const socios = (r.socios as Array<Record<string, unknown>> | undefined) ?? [];
  const nat = r.natureza_juridica as Record<string, unknown> | undefined;
  const end = estabelecimento;
  const cepRaw = String(end.cep ?? "").replace(/\D/g, "");
  return {
    razao_social: r.razao_social ?? "",
    nome_fantasia: estabelecimento.nome_fantasia ?? r.nome_fantasia ?? "",
    email: estabelecimento.email ?? "",
    telefone: estabelecimento.ddd1 && estabelecimento.telefone1
      ? formatPhone(`${estabelecimento.ddd1}${estabelecimento.telefone1}`)
      : "",
    cep: cepRaw ? cepRaw.replace(/^(\d{5})(\d{3})$/, "$1-$2") : "",
    natureza_juridica: nat ? `${nat.id ?? ""} - ${nat.descricao ?? ""}`.trim().replace(/^-\s*/, "") : "",
    logradouro: estabelecimento.logradouro ?? "",
    numero: estabelecimento.numero ?? "",
    complemento: estabelecimento.complemento ?? "",
    bairro: estabelecimento.bairro ?? "",
    municipio: (estabelecimento.cidade as Record<string, unknown> | undefined)?.descricao ?? estabelecimento.municipio ?? "",
    uf: (estabelecimento.estado as Record<string, unknown> | undefined)?.sigla ?? estabelecimento.uf ?? "",
    socios: socios.map((s) => ({
      nome: s.nome ?? "",
      cpf: s.cpf_representante_legal ? String(s.cpf_representante_legal) : "",
      qualificacao: (s.qualificacao_socio as Record<string, unknown> | undefined)?.descricao ?? "",
    })),
  };
}

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  return raw;
}
