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

export const tomadoresApi = {
  list: (params?: { search?: string; uf?: string; tipo?: string }) => {
    const qs = new URLSearchParams(
      Object.entries(params ?? {}).filter(([, v]) => Boolean(v)) as [string, string][]
    ).toString();
    return apiRequest<TomadorResponse[]>(`/tomadores${qs ? `?${qs}` : ""}`);
  },

  get: (id: number) => apiRequest<TomadorResponse>(`/tomadores/${id}`),

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

export const seguradosApi = {
  list: (params?: { search?: string }) => {
    const qs = new URLSearchParams(
      Object.entries(params ?? {}).filter(([, v]) => Boolean(v)) as [string, string][]
    ).toString();
    return apiRequest<SeguradoResponse[]>(`/segurados${qs ? `?${qs}` : ""}`);
  },
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
  dia_vencimento: number | null;
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

// ─── Cotações ────────────────────────────────────────────────────────────────

export interface CotacaoPayload {
  tomador: number;
  modalidade: number;
  segurado?: number | null;
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
  edital: string;
  data_inicio: string | null;
  prazo_dias: number | null;
  data_final: string | null;
  importancia_segurada: string | null;
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

  aprovar: (id: number) =>
    apiRequest<CotacaoResponse>(`/cotacoes/${id}/aprovar`, { method: "POST" }),
};

