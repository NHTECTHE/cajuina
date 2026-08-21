/* eslint-disable @next/next/no-img-element */
import React from "react"
import { Phone, MapPin, Mail } from "lucide-react"

export interface SeguradoraPDFData {
  id: number
  nome: string
  logo?: string | null
  premio: string // already formatted string e.g. R$ 150,00
}

export interface CotacaoPDFData {
  tomador_nome: string
  tomador_cnpj: string
  modalidade_nome: string
  edital: string
  segurado_nome: string
  segurado_cnpj: string
  importancia_segurada: string // formatted R$
  data_inicio: string
  data_final: string
  prazo_dias: string
  criado_por_nome: string
  observacoes: string
  seguradoras: SeguradoraPDFData[]
}

export const CotacaoPdfTemplate = React.forwardRef<HTMLDivElement, { data: CotacaoPDFData }>(
  ({ data }, ref) => {
    return (
      <div 
        ref={ref} 
        className="w-[794px] min-h-[1123px] bg-white text-black font-sans relative flex flex-col pt-12 pb-0 px-0 shadow-lg"
        style={{ boxSizing: "border-box" }}
      >
        {/* CABEÇALHO - LOGO */}
        <div className="relative w-full h-[90px] mb-14">
          <img 
            src="/2 - 1.png" 
            alt="Cajuína Corretora de Seguros" 
            className="absolute w-[370px] left-1/2 -translate-x-1/2 top-[65%] -translate-y-1/2 object-contain" 
          />
        </div>

        {/* CONTEÚDO PRINCIPAL (DADOS) */}
        <div className="px-12 flex-1 flex flex-col">
          {/* Seção Dados da Cotação */}
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-[#a40f1a] text-xl font-bold uppercase whitespace-nowrap">DADOS DA COTAÇÃO</h2>
            <div className="h-px bg-[#a40f1a] flex-1"></div>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-0 mb-6">
            {/* Coluna Esquerda */}
            <div className="flex flex-col">
              <div className="border-b border-[#e4e4e7] py-2">
                <p className="text-[10px] font-bold text-[#18181b] uppercase">TOMADOR:</p>
                <p className="text-[12px] text-[#27272a] mt-0.5">{data.tomador_nome} - {data.tomador_cnpj}</p>
              </div>
              <div className="border-b border-[#e4e4e7] py-2">
                <p className="text-[10px] font-bold text-[#18181b] uppercase">MODALIDADE:</p>
                <p className="text-[12px] text-[#27272a] mt-0.5">{data.modalidade_nome}</p>
              </div>
              <div className="border-b border-[#e4e4e7] py-2">
                <p className="text-[10px] font-bold text-[#18181b] uppercase">EDITAL / CONTRATO:</p>
                <p className="text-[12px] text-[#27272a] mt-0.5 break-all">{data.edital}</p>
              </div>
              <div className="border-b border-[#e4e4e7] py-2">
                <p className="text-[10px] font-bold text-[#18181b] uppercase">SEGURADO:</p>
                <p className="text-[12px] text-[#27272a] mt-0.5">{data.segurado_nome} - {data.segurado_cnpj}</p>
              </div>
              <div className="py-2">
                <p className="text-[10px] font-bold text-[#18181b] uppercase">VALOR DA COBERTURA:</p>
                <p className="text-[12px] text-[#27272a] mt-0.5">{data.importancia_segurada}</p>
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="flex flex-col border-l border-[#e4e4e7] pl-12 -ml-[1px]">
              <div className="border-b border-[#e4e4e7] py-2">
                <p className="text-[10px] font-bold text-[#18181b] uppercase">VIGÊNCIA DE:</p>
                <p className="text-[12px] text-[#27272a] mt-0.5">{data.data_inicio}</p>
              </div>
              <div className="border-b border-[#e4e4e7] py-2">
                <p className="text-[10px] font-bold text-[#18181b] uppercase">VIGÊNCIA ATÉ:</p>
                <p className="text-[12px] text-[#27272a] mt-0.5">{data.data_final}</p>
              </div>
              <div className="border-b border-[#e4e4e7] py-2">
                <p className="text-[10px] font-bold text-[#18181b] uppercase">PRAZO TOTAL:</p>
                <p className="text-[12px] text-[#27272a] mt-0.5">{data.prazo_dias}</p>
              </div>
              <div className="border-b border-[#e4e4e7] py-2">
                <p className="text-[10px] font-bold text-[#18181b] uppercase">REALIZADO POR:</p>
                <p className="text-[12px] text-[#27272a] mt-0.5">{data.criado_por_nome}</p>
              </div>
              <div className="py-2">
                <p className="text-[10px] font-bold text-[#18181b] uppercase">OBSERVAÇÕES:</p>
                <p className="text-[12px] text-[#27272a] mt-0.5">{data.observacoes}</p>
              </div>
            </div>
          </div>

          {/* Seção Seguradoras */}
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-[#a40f1a] text-xl font-bold uppercase whitespace-nowrap">SEGURADORAS</h2>
            <div className="h-px bg-[#a40f1a] flex-1"></div>
          </div>

          {/* Lista de Seguradoras (Cards) */}
          <div className="grid grid-cols-4 gap-4 pb-6">
            {data.seguradoras.map((seg) => (
              <div 
                key={seg.id} 
                className="w-full border border-[#e4e4e7] rounded-xl flex flex-col items-center justify-between p-4 bg-[#f4f4f5]/30 shadow-sm"
                style={{ minHeight: "160px" }}
              >
                <h3 className="text-[11px] font-bold text-[#18181b] text-center uppercase tracking-wide leading-tight flex items-center justify-center w-full mb-3">
                  {seg.nome}
                </h3>
                
                <div className="flex-1 w-full flex items-center justify-center mb-4">
                  {seg.logo ? (
                    <img 
                      src={seg.logo} 
                      alt={seg.nome} 
                      className="max-w-[85%] max-h-14 object-contain mix-blend-multiply" 
                    />
                  ) : (
                    <div className="text-3xl font-black text-[#cf7458]">
                      {seg.nome.substring(0, 1)}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center justify-center w-full pt-3 border-t border-[#e4e4e7] mt-auto">
                  <span className="text-[9px] font-bold text-[#27272a] uppercase mb-1 tracking-wider">PRÊMIO</span>
                  <span className="text-[15px] font-black text-[#a40f1a]">{seg.premio}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RODAPÉ */}
        <div className="w-full bg-[#8c0811] text-white py-5 px-10 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center">
              <Phone className="w-4 h-4 text-white" />
            </div>
            <span className="text-[12px] font-medium tracking-wide">(86) 3081-0282</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <span className="text-[12px] font-medium tracking-wide">garantia@cajuinaseguros.com.br</span>
          </div>

          <div className="flex items-center gap-3 max-w-[200px]">
            <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="text-[11px] font-medium leading-tight opacity-90">
              Av. João XXIII, 250-Terreo-Noivos, Teresina-PI,<br />  64045-000
            </span>
          </div>
        </div>
      </div>
    )
  }
)

CotacaoPdfTemplate.displayName = "CotacaoPdfTemplate"
