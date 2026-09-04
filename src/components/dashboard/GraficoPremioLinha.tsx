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

const chartData = [
  {
    month: "Jan",
    porto: 100000,
    bradesco: 100000,
    sulamerica: 100000,
    mapfre: 100000,
    allianz: 100000,
    hdi: 100000,
  },
  {
    month: "Fev",
    porto: 340000,
    bradesco: 250000,
    sulamerica: 160000,
    mapfre: 130000,
    allianz: 100000,
    hdi: 200000,
  },
  {
    month: "Mar",
    porto: 410000,
    bradesco: 270000,
    sulamerica: 210000,
    mapfre: 150000,
    allianz: 500000,
    hdi: 90000,
  },
  {
    month: "Abr",
    porto: 360000,
    bradesco: 420000,
    sulamerica: 180000,
    mapfre: 170000,
    allianz: 280000,
    hdi: 280000,
  },
  {
    month: "Mai",
    porto: 480000,
    bradesco: 350000,
    sulamerica: 220000,
    mapfre: 160000,
    allianz: 100000,
    hdi: 80000,
  },
  {
    month: "Jun",
    porto: 440000,
    bradesco: 390000,
    sulamerica: 250000,
    mapfre: 140000,
    allianz: 300000,
    hdi: 50000,
  },
  {
    month: "Jul",
    porto: 500000,
    bradesco: 430000,
    sulamerica: 290000,
    mapfre: 250000,
    allianz: 130000,
    hdi: 90000,
  },
  {
    month: "Ago",
    porto: 600000,
    bradesco: 400000,
    sulamerica: 400000,
    mapfre: 220000,
    allianz: 150000,
    hdi: 290000,
  },
  {
    month: "Set",
    porto: 300000,
    bradesco: 350000,
    sulamerica: 20000,
    mapfre: 500000,
    allianz: 130000,
    hdi: 90000,
  },
  {
    month: "Out",
    porto: 600000,
    bradesco: 370000,
    sulamerica: 230000,
    mapfre: 220000,
    allianz: 140000,
    hdi: 200000,
  },
  {
    month: "Nov",
    porto: 450000,
    bradesco: 390000,
    sulamerica: 400000,
    mapfre: 250000,
    allianz: 170000,
    hdi: 110000,
  },
  {
    month: "Dez",
    porto: 550000,
    bradesco: 480000,
    sulamerica: 300000,
    mapfre: 280000,
    allianz: 190000,
    hdi: 120000,
  },
]

/* =========================================================
   CONFIGURAÇÃO DAS SEGURADORAS
   ========================================================= */

const chartConfig = {
  porto: {
    label: "Porto Seguro",
    color: "#ef4444",
  },

  bradesco: {
    label: "Bradesco Seguros",
    color: "#3b82f6",
  },

  sulamerica: {
    label: "SulAmérica",
    color: "#22c55e",
  },

  mapfre: {
    label: "Mapfre",
    color: "#a855f7",
  },

  allianz: {
    label: "Allianz",
    color: "#f59e0b",
  },

  hdi: {
    label: "HDI Seguros",
    color: "#14b8a6",
  },
} satisfies ChartConfig

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

  /* -------------------------------------------------------
     FILTRO DE PERÍODO
     ------------------------------------------------------- */

  const filteredData = React.useMemo(() => {
    if (period === "3m") {
      return chartData.slice(-3)
    }

    if (period === "6m") {
      return chartData.slice(-6)
    }

    return chartData
  }, [period])

  /* -------------------------------------------------------
     CALCULA O TOTAL DO PERÍODO
     ------------------------------------------------------- */

  const totalPremios = React.useMemo(() => {
    return filteredData.reduce((total, item) => {
      return (
        total +
        item.porto +
        item.bradesco +
        item.sulamerica +
        item.mapfre +
        item.allianz +
        item.hdi
      )
    }, 0)
  }, [filteredData])

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

          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500 text-white">
                R$
              </span>

              Prêmios das Seguradoras
            </CardTitle>

            <CardDescription>
              Evolução dos prêmios das seguradoras
            </CardDescription>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="text-3xl font-bold tracking-tight">
                {formatCurrency(totalPremios)}
              </span>

              <span className="flex items-center gap-1 rounded-md bg-green-500/10 px-2.5 py-1 text-sm font-medium text-green-500">
                <TrendingUp className="h-4 w-4" />
                50%
              </span>

              <span className="text-sm text-muted-foreground">
                em relação a 12 meses atrás
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
              {["porto", "bradesco", "sulamerica", "mapfre", "allianz", "hdi"].map((key) => (
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

                return `R$ ${(value / 1000).toFixed(0)}k`
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
                PORTO SEGURO
                ================================================= */}

            <Line
              filter={isDark ? "url(#glow-porto)" : undefined}
              dataKey="porto"
              type="linear"
              stroke="var(--color-porto)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 2,
              }}
            />

            {/* =================================================
                BRADESCO
                ================================================= */}

            <Line
              filter={isDark ? "url(#glow-bradesco)" : undefined}
              dataKey="bradesco"
              type="linear"
              stroke="var(--color-bradesco)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 2,
              }}
            />

            {/* =================================================
                SULAMÉRICA
                ================================================= */}

            <Line
              filter={isDark ? "url(#glow-sulamerica)" : undefined}
              dataKey="sulamerica"
              type="linear"
              stroke="var(--color-sulamerica)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 2,
              }}
            />

            {/* =================================================
                MAPFRE
                ================================================= */}

            <Line
              filter={isDark ? "url(#glow-mapfre)" : undefined}
              dataKey="mapfre"
              type="linear"
              stroke="var(--color-mapfre)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 2,
              }}
            />

            {/* =================================================
                ALLIANZ
                ================================================= */}

            <Line
              filter={isDark ? "url(#glow-allianz)" : undefined}
              dataKey="allianz"
              type="linear"
              stroke="var(--color-allianz)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 2,
              }}
            />

            {/* =================================================
                HDI
                ================================================= */}

            <Line
              filter={isDark ? "url(#glow-hdi)" : undefined}
              dataKey="hdi"
              type="linear"
              stroke="var(--color-hdi)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 2,
              }}
            />

            {/* -------------------------------------------------
                LEGENDA
                ------------------------------------------------- */}

            <ChartLegend
              content={<ChartLegendContent />}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

