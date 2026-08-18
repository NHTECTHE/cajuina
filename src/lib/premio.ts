/** Cálculo do prêmio na tela da simulação.
 *
 *  Espelha `cotacao_calcular_premio` do backend: pro rata temporis sobre 365
 *  dias, com piso no prêmio mínimo do par tomador × seguradora. Fica isolado
 *  aqui porque três telas precisam do mesmo número — card, PDF e WhatsApp —
 *  e antes cada uma recalculava por conta.
 */

const DIAS_NO_ANO = 365

export interface BasePremio {
  importanciaSegurada: number
  prazoDias: number
  taxa: number
  premioMinimo: number
}

export interface PremioEfetivo {
  valor: number
  /** true quando o número veio da seguradora, false quando é estimativa nossa. */
  real: boolean
}

export function premioEstimado({
  importanciaSegurada,
  prazoDias,
  taxa,
  premioMinimo,
}: BasePremio): number {
  const calculado = (importanciaSegurada / DIAS_NO_ANO) * (taxa / 100) * prazoDias
  return Math.max(calculado, premioMinimo)
}

/** O prêmio da seguradora ganha do estimado: depois de cotar de verdade,
 *  mostrar o número calculado seria mostrar um preço que ninguém honra. */
export function premioEfetivo(
  base: BasePremio & { premioReal: string | null | undefined }
): PremioEfetivo {
  const real = base.premioReal ? Number(base.premioReal) : NaN
  if (!Number.isNaN(real)) return { valor: real, real: true }
  return { valor: premioEstimado(base), real: false }
}
