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

// ─── E-mail ──────────────────────────────────────────────────────────────────

/** Mensagem montada pelo servidor a partir do objeto (cotação/apólice).
 *  O cliente exibe e envia, mas não compõe: é isso que impede o endpoint de
 *  ser usado para mandar qualquer texto para qualquer endereço. */
export interface EmailPreview {
  destinatario: string;
  assunto: string;
  mensagem: string;
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
  /** `null` enquanto a regra de cálculo do flex não existe no backend. */
  flex: string | null;
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
  /** `""` = emissão manual; `"junto"` = Junto Seguros API v2. */
  integracao: string;
  /** O backend diz que a credencial existe sem devolver o segredo. */
  tem_credencial_api: boolean;
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
  /** Prêmio real da seguradora escolhida, quando ela já foi cotada. `null` no
   *  caso contrário — aí vale o `premio`, que é a nossa estimativa. */
  premio_seguradora: string | null;
  /** Alguma seguradora ficou com a emissão em análise nesta simulação. Serve
   *  ao selo da lista, para não ser preciso abrir cotação por cotação. */
  emissao_aguardando: boolean;
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

  // O corpo, o assunto e o destinatário são montados no servidor a partir da
  // cotação. Daqui só sai a observação — ver EmailPreview.
  emailPreview: (id: number, observacao = "") =>
    apiRequest<EmailPreview>(
      `/cotacoes/${id}/email-preview/?observacao=${encodeURIComponent(observacao)}`
    ),

  enviarEmail: (id: number, data: { observacao?: string }) =>
    apiRequest<void>(`/cotacoes/${id}/enviar-email/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

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

// ─── Emissão integrada com a seguradora ──────────────────────────────────────

export interface ParcelaEmissao {
  numero: number;
  vencimento: string | null;
  /** Dinheiro chega como string para não perder centavo no float do JS. */
  valor: string;
  iof: string;
  custo_apolice: string;
  adicional_fracionamento: string;
}

export interface OpcaoParcelamento {
  numero_parcelas: number;
  vencimento_primeira_parcela: string | null;
  premio_total: string;
  parcelas: ParcelaEmissao[];
}

export interface PendenciaEmissao {
  codigo: number;
  descricao: string;
  departamento: string;
  /** E-mail do setor da seguradora que resolve esta pendência. */
  email: string;
}

export type EtapaEmissao = "cotada" | "minuta" | "aguardando" | "emitida" | "recusada";

/** Um documento já anexado à análise, como a seguradora o enumera de volta. */
export interface AnexoEmissao {
  nome: string;
  tamanho: number;
}

export interface EmissaoResponse {
  id: number;
  cotacao: number;
  seguradora: number;
  seguradora_nome: string;
  integracao: string;
  ambiente: "sandbox" | "producao";
  etapa: EtapaEmissao;
  external_id: string;
  document_number: string;
  premio_liquido: string | null;
  premio_total: string | null;
  taxa: string | null;
  comissao_percentual: string | null;
  comissao_valor: string | null;
  numero_parcelas: number | null;
  numero_max_parcelas: number | null;
  opcoes_parcelamento: OpcaoParcelamento[];
  tem_pendencias: boolean;
  pendencias: PendenciaEmissao[];
  anexos_enviados: number;
  anexos: AnexoEmissao[];
  /** Número da apólice na seguradora. Vazio enquanto ela não emite. */
  policy_number: string;
  emitida_em: string | null;
  condicoes_adicionais: string;
  /** `quoteStatusId` e a descrição que a seguradora deu ao documento
   *  (3 emitida, 6 em análise…). É o vocabulário dela; `etapa` é o nosso. */
  codigo_retorno: string;
  mensagem: string;
  url_cotacao: string;
  url_minuta: string;
  /** PDFs finais. Só vêm preenchidos depois de emitida — a apólice integrada
   *  não baixa arquivo, então é daqui que a tela oferece os documentos. */
  url_apolice: string;
  url_boleto: string;
  tem_apolice: boolean;
  /** A cotação foi editada depois de ir para a seguradora. Enquanto for `true`
   *  o backend recusa a emissão — recotar é o caminho de volta. */
  desatualizada: boolean;
  criado_em: string;
  atualizado_em: string;
}

export const emissaoApi = {
  /** Estado persistido do wizard: uma linha por seguradora já cotada. */
  estado: (cotacaoId: number) =>
    apiRequest<EmissaoResponse[]>(`/cotacoes/${cotacaoId}/emissao`),

  /** Passo 1 para uma seguradora. Chamar de novo não duplica: o backend vira
   *  PUT na seguradora em vez de criar uma segunda cotação lá.
   *
   *  `parcelas` é como se escolhe o parcelamento — a seguradora só aceita esse
   *  campo na atualização, então a primeira cotação nunca o leva. */
  cotar: (cotacaoId: number, seguradoraId: number, parcelas?: number) =>
    apiRequest<EmissaoResponse>(`/cotacoes/${cotacaoId}/emissao/cotar`, {
      method: "POST",
      body: JSON.stringify({ seguradora: seguradoraId, ...(parcelas ? { parcelas } : {}) }),
    }),

  /** Passo 2. `forcarUrl` traz o PDF mesmo com pendências — a Junto devolve o
   *  link vazio quando há alguma, e seguir assim é decisão do usuário. */
  minuta: (cotacaoId: number, seguradoraId: number, forcarUrl = false) =>
    apiRequest<EmissaoResponse>(`/cotacoes/${cotacaoId}/emissao/minuta`, {
      method: "POST",
      body: JSON.stringify({ seguradora: seguradoraId, forcar_url: forcarUrl }),
    }),

  /** Passo 3: documentos da análise. Obrigatório quando a minuta veio com
   *  pendência — o backend recusa a emissão sem eles.
   *
   *  A resposta traz a lista **inteira** do que está anexado na seguradora, não
   *  só o que subiu agora: reenviar um arquivo de mesmo nome sobrescreve lá. */
  anexos: async (cotacaoId: number, seguradoraId: number, arquivos: File[]) => {
    const form = new FormData();
    form.append("seguradora", String(seguradoraId));
    for (const arquivo of arquivos) form.append("arquivos", arquivo);

    // Sem Content-Type manual: o browser define o boundary do multipart.
    const response = await fetch(`/api/cotacoes/${cotacaoId}/emissao/anexos`, {
      method: "POST",
      body: form,
    });
    return handleApiResponse<EmissaoResponse>(response);
  },

  /** Passo 4. Dois desfechos, os dois normais: a seguradora emite na hora
   *  (`etapa: "emitida"`, com `policy_number`) ou manda para análise humana
   *  (`etapa: "aguardando"`). Leva de 20s a 40s. */
  emitir: (cotacaoId: number, seguradoraId: number, condicoesAdicionais = "") =>
    apiRequest<EmissaoResponse>(`/cotacoes/${cotacaoId}/emissao/emitir`, {
      method: "POST",
      body: JSON.stringify({
        seguradora: seguradoraId,
        condicoes_adicionais: condicoesAdicionais,
      }),
    }),

  /** Relê o estado na seguradora. É o que tira uma emissão de "em análise":
   *  a API da Junto não tem webhook, então ou alguém pergunta, ou a apólice
   *  fica emitida lá e desconhecida aqui. */
  sincronizar: (cotacaoId: number, seguradoraId: number) =>
    apiRequest<EmissaoResponse>(`/cotacoes/${cotacaoId}/emissao/sincronizar`, {
      method: "POST",
      body: JSON.stringify({ seguradora: seguradoraId }),
    }),
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
  tomador: number;
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
  /** PDFs do lado da seguradora, quando a emissão foi integrada. Emissão
   *  integrada não baixa arquivo, então os `arquivo_*` acima ficam vazios e é
   *  por aqui que se chega no documento. Campos separados de propósito: um é
   *  cópia nossa, o outro é link de terceiro, que pode expirar. */
  url_apolice: string;
  url_boleto: string;
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

  emailPreview: (id: number, observacao = "") =>
    apiRequest<EmailPreview>(
      `/apolices/${id}/email-preview/?observacao=${encodeURIComponent(observacao)}`
    ),

  enviarEmail: (id: number, data: { observacao?: string }) =>
    apiRequest<void>(`/apolices/${id}/enviar-email/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};


// ─── Dashboard ───────────────────────────────────────────────────────────────

export type PeriodoDashboard = "dia" | "mes" | "ano";

export interface ResumoPeriodo {
  tipo: PeriodoDashboard;
  inicio: string;
  fim: string;
  rotulo: string;
}

export interface DashboardResumo {
  producao: string;
  apolices: number;
  tomadores: { periodo: number; total: number };
  cotacoes: { iniciadas: number; aprovadas: number; emitidas: number };
  periodo: ResumoPeriodo;
}

export interface DashboardComissoes {
  a_receber: string;
  pago: string;
  em_atraso: string;
  a_pagar: string;
}

export interface PremioSeguradora {
  id: number;
  seguradora: string;
  valor_atual: string;
  meta: string | null;
  falta: string | null;
}

export interface NovoCadastro {
  id: number;
  nome: string;
  contato: string;
  telefone: string;
  email: string;
  criado_por: string | null;
  criado_em: string;
}

export interface NovosCadastrosPagina {
  results: NovoCadastro[];
  count: number;
  page: number;
  page_size: number;
}

export function getDashboardResumo(periodo: PeriodoDashboard): Promise<DashboardResumo> {
  return apiRequest<DashboardResumo>(`/dashboard/resumo/?periodo=${periodo}`);
}

export function getDashboardComissoes(): Promise<DashboardComissoes> {
  return apiRequest<DashboardComissoes>("/dashboard/comissoes/");
}

export function getPremioSeguradoras(ano?: number): Promise<PremioSeguradora[]> {
  const query = ano ? `?ano=${ano}` : "";
  return apiRequest<PremioSeguradora[]>(`/dashboard/premio-seguradoras/${query}`);
}

export function getNovosCadastros(
  params: { search?: string; page?: number; pageSize?: number } = {}
): Promise<NovosCadastrosPagina> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("page_size", String(params.pageSize));
  const qs = query.toString();
  return apiRequest<NovosCadastrosPagina>(`/dashboard/novos-cadastros/${qs ? `?${qs}` : ""}`);
}
