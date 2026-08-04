// Requests to /api/* go through Next.js Route Handlers which attach the httpOnly cookie token.
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    let errorMessage = body?.detail;
    if (!errorMessage && typeof body === 'object') {
      const errors = Object.entries(body)
        .map(([field, msgs]) => {
          const msgStr = Array.isArray(msgs) ? msgs[0] : msgs;
          return `${field}: ${msgStr}`;
        })
        .join(', ');
      errorMessage = errors || `Erro ${response.status}`;
    }
    throw new Error(errorMessage || `Erro ${response.status}`);
  }

  if (response.status === 204) return undefined as T;

  const result = await response.json();
  if (result === undefined) throw new Error("Resposta inválida da API");

  if (result && typeof result === "object" && "data" in result) {
    return result.data as T;
  }

  return result as T;
}

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  return handleApiResponse<T>(response);
}

// ─── Tomadores ───────────────────────────────────────────────────────────────

export interface ContatoAdicional {
  id?: number;
  nome: string;
  telefone: string;
  email: string;
}

export interface Socio {
  id?: number;
  nome: string;
  cpf: string;
  nascimento: string;
  qualificacao: string;
}

export interface TomadorPayload {
  cnpj: string;
  nome: string;
  nome_fantasia?: string;
  produtor: string;
  corretora: string;
  contato?: string;
  email?: string;
  habilitar_email?: boolean;
  telefone?: string;
  celular?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  ativar_cotacao?: boolean;
  observacoes?: string;
  contatos_adicionais?: ContatoAdicional[];
  socios?: Socio[];
}

export interface TomadorResponse extends TomadorPayload {
  id: number;
  criado_em: string;
  atualizado_em: string;
  contatos_adicionais: ContatoAdicional[];
  socios: Socio[];
}

export interface TomadorPremioAcumuladoResponse {
  premio_total: string;
  flex: string;
  seguradoras: Array<{
    id: number;
    nome: string;
    total: string;
  }>;
}

export interface TomadorAtividade {
  id: number;
  data: string;
  hora: string;
  situacao: string;
  usuario: string;
  detalhes: string;
}

export interface PaginatedAtividadeResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TomadorAtividade[];
}

export const tomadoresApi = {
  list: (params?: { search?: string; uf?: string; tipo?: string }) => {
    const qs = new URLSearchParams(
      Object.entries(params ?? {}).filter(([, v]) => Boolean(v)) as [string, string][]
    ).toString();
    return apiRequest<TomadorResponse[]>(`/tomadores${qs ? `?${qs}` : ""}`);
  },

  get: (id: number) => apiRequest<TomadorResponse>(`/tomadores/${id}`),

  getPremioAcumulado: (id: number) => apiRequest<TomadorPremioAcumuladoResponse>(`/tomadores/${id}/premio-acumulado/`),

  getAtividades: (id: number, page: number = 1) => apiRequest<PaginatedAtividadeResponse>(`/tomadores/${id}/atividades/?page=${page}`),

  create: (data: TomadorPayload) =>
    apiRequest<TomadorResponse>("/tomadores", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<TomadorPayload>) =>
    apiRequest<TomadorResponse>(`/tomadores/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  remove: (id: number) =>
    apiRequest<void>(`/tomadores/${id}`, { method: "DELETE" }),
};

// ─── CNPJ lookup ─────────────────────────────────────────────────────────────

export interface CnpjData {
  razao_social: string;
  nome_fantasia: string;
  email: string;
  telefone: string;
  cep: string;
  natureza_juridica: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  socios: Array<{ nome: string; cpf: string; qualificacao: string }>;
}

export async function lookupCnpj(cnpj: string): Promise<CnpjData> {
  const digits = cnpj.replace(/\D/g, "");
  const response = await fetch(`/api/cnpj/${digits}`);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error ?? "Erro ao buscar CNPJ");
  }

  const result: { data?: CnpjData } = await response.json();

  if (!result.data) {
    throw new Error("Resposta inválida ao buscar CNPJ");
  }

  return result.data;
}

// ─── Segurados ───────────────────────────────────────────────────────────────

export interface SeguradoResponse {
  id: number;
  cnpj: string;
  nome: string;
  natureza_juridica: string;
  endereco: string;
  cidade: string;
  estado: string;
  bairro: string;
  numero: string;
  cep: string;
  complemento: string;
  observacoes: string;
  criado_em: string;
  atualizado_em: string;
}

export interface SeguradoPayload {
  cnpj: string;
  nome: string;
  natureza_juridica: string;
  endereco: string;
  cidade: string;
  estado: string;
  bairro: string;
  numero: string;
  cep: string;
  complemento: string;
  observacoes: string;
}

export const seguradosApi = {
  list: (params?: { search?: string }) => {
    const qs = new URLSearchParams(
      Object.entries(params ?? {}).filter(([, v]) => Boolean(v)) as [string, string][]
    ).toString();
    return apiRequest<SeguradoResponse[]>(`/segurados${qs ? `?${qs}` : ""}`);
  },
  create: (data: SeguradoPayload) =>
    apiRequest<SeguradoResponse>("/segurados", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Modalidades ─────────────────────────────────────────────────────────────

export interface ModalidadeResponse {
  id: number;
  nome: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export const modalidadesApi = {
  list: (params?: { search?: string; ativo?: boolean }) => {
    const entries = Object.entries(params ?? {})
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)] as [string, string]);
    const qs = new URLSearchParams(entries).toString();
    return apiRequest<ModalidadeResponse[]>(`/modalidades${qs ? `?${qs}` : ""}`);
  },
};

// ─── Seguradoras ─────────────────────────────────────────────────────────────

export interface SeguradoraResponse {
  id: number;
  nome: string;
  logo: string | null;
  meta: string | null;
  premio_minimo: string;
  taxa_comissao: string | null;
  vencimento_dias: number | null;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export const seguradorasApi = {
  list: (params?: { search?: string; ativo?: boolean }) => {
    const entries = Object.entries(params ?? {})
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)] as [string, string]);
    const qs = new URLSearchParams(entries).toString();
    return apiRequest<SeguradoraResponse[]>(`/seguradoras${qs ? `?${qs}` : ""}`);
  },
};

export interface TomadorSeguradoraResponse {
  id: number;
  seguradora: number;
  seguradora_nome: string;
  seguradora_ativo: boolean;
  taxa: string;
  premio_minimo: string | null;
  premio_minimo_efetivo: string;
  dias_vencimento: number | null;
  dias_vencimento_efetivo: number | null;
  apto: boolean;
  criado_em: string;
  atualizado_em: string;
}

// Busca o vínculo comercial do tomador com uma seguradora específica.
// Retorna null quando não há vínculo cadastrado (o par ainda não foi taxado).
export async function getTomadorSeguradoraVinculo(
  tomadorId: number,
  seguradoraId: number,
): Promise<TomadorSeguradoraResponse | null> {
  try {
    return await apiRequest<TomadorSeguradoraResponse>(
      `/tomadores/${tomadorId}/seguradoras/${seguradoraId}`,
    );
  } catch {
    return null;
  }
}

// ─── Cotações ────────────────────────────────────────────────────────────────

export interface CotacaoPayload {
  tomador: number;
  modalidade: number;
  segurado?: number | null;
  seguradora?: number | null;
  edital?: string;
  data_inicio?: string | null;
  prazo_dias?: number | null;
  data_final?: string | null;
  importancia_segurada?: string | null;
  observacoes?: string;
}

export type CotacaoStatus = "Iniciado" | "Aprovado" | "Emitido";

export interface CotacaoResponse {
  id: number;
  status: CotacaoStatus;
  tomador: number;
  tomador_nome: string;
  tomador_cnpj: string;
  modalidade: number;
  modalidade_nome: string;
  segurado: number | null;
  segurado_nome: string | null;
  segurado_cnpj: string | null;
  seguradora: number | null;
  seguradora_nome: string | null;
  edital: string;
  data_inicio: string | null;
  prazo_dias: number | null;
  data_final: string | null;
  importancia_segurada: string | null;
  premio: string | null;
  observacoes: string;
  criado_por: number | null;
  criado_por_nome: string | null;
  criado_em: string;
  atualizado_em: string;
}

export const cotacoesApi = {
  list: (params?: { search?: string; status?: CotacaoStatus }) => {
    const entries = Object.entries(params ?? {})
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)] as [string, string]);
    const qs = new URLSearchParams(entries).toString();
    return apiRequest<CotacaoResponse[]>(`/cotacoes${qs ? `?${qs}` : ""}`);
  },

  get: (id: number) => apiRequest<CotacaoResponse>(`/cotacoes/${id}`),

  create: (data: CotacaoPayload) =>
    apiRequest<CotacaoResponse>("/cotacoes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<CotacaoPayload>) =>
    apiRequest<CotacaoResponse>(`/cotacoes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  remove: (id: number) =>
    apiRequest<void>(`/cotacoes/${id}`, { method: "DELETE" }),

  // Emite a apólice da cotação (multipart: pode levar os PDFs da apólice e do
  // boleto). Aprova → Emitido, e a apólice criada é devolvida.
  emitir: async (id: number, data: EmitirPayload): Promise<ApoliceResponse> => {
    const form = new FormData();
    form.append("seguradora", String(data.seguradora));
    form.append("numero_apolice", data.numero_apolice);
    form.append("valor_seguradora", data.valor_seguradora);
    if (data.vencimento_boleto) form.append("vencimento_boleto", data.vencimento_boleto);
    if (data.arquivo_apolice) form.append("arquivo_apolice", data.arquivo_apolice);
    if (data.arquivo_boleto) form.append("arquivo_boleto", data.arquivo_boleto);

    // Sem Content-Type manual: o browser define o boundary do multipart.
    const response = await fetch(`/api/cotacoes/${id}/emitir`, {
      method: "POST",
      body: form,
    });
    return handleApiResponse<ApoliceResponse>(response);
  },
};

export interface EmitirPayload {
  seguradora: number;
  numero_apolice: string;
  valor_seguradora: string;
  vencimento_boleto?: string | null;
  arquivo_apolice?: File | null;
  arquivo_boleto?: File | null;
}

// ─── Apólices ────────────────────────────────────────────────────────────────

export interface ApoliceResponse {
  id: number;
  cotacao: number;
  tomador_nome: string;
  tomador_cnpj: string;
  modalidade_nome: string;
  segurado_nome?: string | null;
  segurado_cnpj?: string | null;
  seguradora: number;
  seguradora_nome: string;
  numero_apolice: string;
  valor_seguradora: string;
  vencimento_boleto: string | null;
  arquivo_apolice: string | null;
  arquivo_boleto: string | null;
  arquivo_proposta: string | null;
  observacoes: string;
  status_pagamento_premio: string;
  status_pagamento_comissao: string;
  emitido_por: number | null;
  emitido_por_nome: string | null;
  criado_em: string;
  atualizado_em: string;
  
  // Campos derivados da cotação que podem estar disponíveis na mesma consulta (se o serializer retornar, ou adaptado visualmente)
  edital?: string | null;
  data_inicio?: string | null;
  prazo_dias?: number | null;
  data_final?: string | null;
  importancia_segurada?: string | null;
}

export const apolicesApi = {
  list: (params?: { search?: string; tomador?: string; seguradora?: string; numero_apolice?: string }) => {
    const entries = Object.entries(params ?? {})
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)] as [string, string]);
    const qs = new URLSearchParams(entries).toString();
    return apiRequest<ApoliceResponse[]>(`/apolices${qs ? `?${qs}` : ""}`);
  },

  get: (id: number) => apiRequest<ApoliceResponse>(`/apolices/${id}`),

  update: (id: number, data: FormData) =>
    apiRequest<ApoliceResponse>(`/apolices/${id}`, {
      method: "PATCH",
      body: data,
    }),

  remove: (id: number) =>
    apiRequest<void>(`/apolices/${id}`, { method: "DELETE" }),
};

