// Requests to /api/* go through Next.js Route Handlers which attach the httpOnly cookie token.
async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });

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

  const result: { data?: T } = await response.json();
  if (result.data === undefined) throw new Error("Resposta inválida da API");
  return result.data;
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

