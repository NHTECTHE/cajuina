"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import { useTheme } from "next-themes"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/* =========================================================
   DADOS DO GRÁFICO
   ========================================================= */

import { apolicesApi } from "@/services/api"
import { BlocoErro, Skeleton } from "./BlocoEstado"

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#14b8a6', '#0ea5e9']
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

/* =========================================================
   FORMATADOR DE MOEDA
   ========================================================= */

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value)
}

/* =========================================================
   COMPONENTE
   ========================================================= */

export function GraficoPremioLinha() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [period, setPeriod] = React.useState("12m")

  const [chartData, setChartData] = React.useState<any[]>([])
  const [chartConfig, setChartConfig] = React.useState<ChartConfig>({})
  const [carregando, setCarregando] = React.useState(true)
  const [erro, setErro] = React.useState<string | null>(null)

  const recarregar = React.useCallback(() => {
    setCarregando(true)
    setErro(null)
    apolicesApi.list()
      .then(apolices => {
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth()
        const dynamicMonths = []
        for (let i = 23; i >= 0; i--) {
          const m = new Date(currentDate.getFullYear(), currentMonth - i, 1)
          dynamicMonths.push({ index: m.getMonth(), name: MONTHS[m.getMonth()], year: m.getFullYear() })
        }

        const monthsData: any[] = dynamicMonths.map(m => ({ month: m.name, _monthIndex: m.index, _year: m.year }))
        const seguradorasSet = new Set<string>()
        
        for (const apolice of apolices) {
          if (!apolice.criado_em) continue
          const date = new Date(apolice.criado_em)
          const monthIndex = date.getMonth()
          const year = date.getFullYear()
          
          const monthDataEntry = monthsData.find(m => m._monthIndex === monthIndex && m._year === year)
          if (!monthDataEntry) continue

          const segName = apolice.seguradora_nome || 'Outros'
          const val = Number(apolice.valor_seguradora) || 0
          
          seguradorasSet.add(segName)
          const key = segName.toLowerCase().replace(/[^a-z0-9]/g, '')
          
          if (!monthDataEntry[key]) {
            monthDataEntry[key] = 0
          }
          monthDataEntry[key] += val
        }

        const seguradoras = Array.from(seguradorasSet)
        const config: ChartConfig = {}
        
        seguradoras.forEach((seg, index) => {
          const key = seg.toLowerCase().replace(/[^a-z0-9]/g, '')
          config[key] = {
            label: seg,
            color: COLORS[index % COLORS.length]
          }
          
          monthsData.forEach(m => {
            if (m[key] === undefined) m[key] = 0
          })
        })

        setChartConfig(config)
        setChartData(monthsData)
      })
      .catch(err => setErro(err.message || 'Erro ao carregar'))
      .finally(() => setCarregando(false))
  }, [])

  React.useEffect(() => {
    recarregar()
  }, [recarregar])

  const { filteredData, currentTotal, prevTotal } = React.useMemo(() => {
    let current = chartData
    let prev = []
    
    if (period === "3m") {
      current = chartData.slice(-3)
      prev = chartData.slice(-6, -3)
    } else if (period === "6m") {
      current = chartData.slice(-6)
      prev = chartData.slice(-12, -6)
    } else if (period === "12m") {
      current = chartData.slice(-12)
      prev = chartData.slice(-24, -12)
    }
    
    const sumData = (data: any[]) => data.reduce((total, item) => {
      let sum = 0
      for (const k of Object.keys(chartConfig)) {
        sum += (item[k] || 0)
      }
      return total + sum
    }, 0)
    
    return {
      filteredData: current,
      currentTotal: sumData(current),
      prevTotal: sumData(prev)
    }
  }, [period, chartData, chartConfig])

  const variation = React.useMemo(() => {
    if (prevTotal === 0) return currentTotal > 0 ? 100 : 0
    return ((currentTotal - prevTotal) / prevTotal) * 100
  }, [currentTotal, prevTotal])

  /* -------------------------------------------------------
     RENDER
     ------------------------------------------------------- */

  return (
    <Card className="w-full h-full overflow-hidden border-zinc-200 dark:border-zinc-800/60 bg-white dark:bg-[#1a1c23] shadow-sm rounded-xl">
      {/* =====================================================
          CABEÇALHO
          ===================================================== */}

      <CardHeader className="border-b border-border/50">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          {/* TÍTULO + TOTAL */}

          <div className="space-y-1">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/20">
                <span className="relative z-10 text-sm font-bold">R$</span>
                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity hover:opacity-100" />
              </div>
              <span className="font-semibold text-zinc-800 dark:text-zinc-100">Prêmios das Seguradoras</span>
            </CardTitle>

            <CardDescription className="ml-13 text-sm text-zinc-500 dark:text-zinc-400">
              Evolução dos prêmios das seguradoras
            </CardDescription>

            <div className="ml-13 flex flex-wrap items-center gap-3 pt-3 pb-2">
              <span className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-zinc-800 to-zinc-500 dark:from-white dark:to-zinc-400">
                {formatCurrency(currentTotal)}
              </span>
            </div>
          </div>

          {/* FILTRO */}

          <div className="flex items-center gap-2">
            <Select
              value={period}
              onValueChange={setPeriod}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="12m">
                  Últimos 12 meses
                </SelectItem>

                <SelectItem value="6m">
                  Últimos 6 meses
                </SelectItem>

                <SelectItem value="3m">
                  Últimos 3 meses
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      {/* =====================================================
          GRÁFICO
          ===================================================== */}

      <CardContent className="pt-6">
        {erro ? (
          <BlocoErro mensagem={erro} onRetry={recarregar} />
        ) : carregando ? (
          <div className="h-[220px] w-full flex items-center justify-center">
            <Skeleton className="h-full w-full rounded-md" />
          </div>
        ) : chartData.length === 0 || currentTotal === 0 ? (
          <div className="h-[220px] w-full flex items-center justify-center text-sm text-zinc-500">
            Nenhuma apólice registrada para o período.
          </div>
        ) : (
        <ChartContainer
          config={chartConfig}
          className="h-[220px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={filteredData}
            margin={{
              top: 15,
              right: 20,
              left: 10,
              bottom: 10,
            }}
          >
            <defs>
              {Object.keys(chartConfig).map((key) => (
                <filter key={key} id={`glow-${key}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor={`var(--color-${key})`} floodOpacity="0.4" />
                </filter>
              ))}
            </defs>

            {/* -------------------------------------------------
                GRADE
                ------------------------------------------------- */}

            <CartesianGrid
              vertical={false}
              strokeDasharray="4 4"
              className="stroke-muted"
            />

            {/* -------------------------------------------------
                EIXO X
                ------------------------------------------------- */}

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              className="text-xs"
            />

            {/* -------------------------------------------------
                EIXO Y
                ------------------------------------------------- */}

            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              width={70}
              tickFormatter={(value) => {
                if (value >= 1000000) {
                  return `R$ ${(value / 1000000).toFixed(1)}M`
                }
                if (value >= 1000) {
                  return `R$ ${(value / 1000).toFixed(0)}k`
                }
                return `R$ ${value}`
              }}
            />

            {/* -------------------------------------------------
                TOOLTIP
                ------------------------------------------------- */}

            <ChartTooltip
              cursor={{
                stroke: "hsl(var(--border))",
                strokeDasharray: "4 4",
              }}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value, name) => {
                    const label = chartConfig[name as keyof typeof chartConfig]?.label || name
                    const color = chartConfig[name as keyof typeof chartConfig]?.color || "var(--color-bg)"
                    
                    return (
                      <>
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px] mt-0.5"
                          style={{ backgroundColor: color }}
                        />
                        <div className="flex flex-1 justify-between items-center gap-4 leading-none">
                          <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
                          <span className="font-mono font-medium text-zinc-900 dark:text-zinc-50">
                            {formatCurrency(Number(value))}
                          </span>
                        </div>
                      </>
                    )
                  }}
                />
              }
            />

            {/* =================================================
                LINHAS DINÂMICAS
                ================================================= */}

            {Object.keys(chartConfig).map((key) => (
              <Line
                key={key}
                filter={isDark ? `url(#glow-${key})` : undefined}
                dataKey={key}
                type="monotone"
                stroke={`var(--color-${key})`}
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 6,
                  strokeWidth: 0,
                }}
              />
            ))}

            {/* -------------------------------------------------
                LEGENDA
                ------------------------------------------------- */}

            <ChartLegend
              content={<ChartLegendContent />}
            />
          </LineChart>
        </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

