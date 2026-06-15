"use client";

import "dayjs/locale/pt-br";

import dayjs from "dayjs";

dayjs.locale("pt-br");
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PageSection } from "@/components/ui/page-section";
import { formatCurrencyInCents } from "@/helpers/currency";

interface DailyAppointment {
  date: string;
  appointments: number;
  revenue: number | null;
}

interface AppointmentsChartProps {
  dailyAppointmentsData: DailyAppointment[];
}

export const AppointmentsChart = ({
  dailyAppointmentsData,
}: AppointmentsChartProps) => {
  const chartDays = Array.from({ length: 21 }).map((_, i) =>
    dayjs()
      .subtract(10 - i, "days")
      .format("YYYY-MM-DD"),
  );

  const chartData = chartDays.map((date) => {
    const dataForDay = dailyAppointmentsData.find((item) => item.date === date);
    return {
      date: dayjs(date).format("DD/MM"),
      fullDate: date,
      appointments: dataForDay?.appointments || 0,
      revenue: Number(dataForDay?.revenue || 0),
    };
  });

  const chartConfig = {
    appointments: {
      label: "Agendamentos",
      color: "var(--cta)",
    },
    revenue: {
      label: "Faturamento",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  return (
    <PageSection title="Agendamentos e faturamento">
      <ChartContainer config={chartConfig} className="h-80 w-full">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis
            yAxisId="left"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tickFormatter={(value) => formatCurrencyInCents(value)}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => {
                  if (name === "revenue") {
                    return (
                      <>
                        <div className="h-3 w-3 rounded bg-[var(--chart-2)]" />
                        <span className="text-muted-foreground">
                          Faturamento:
                        </span>
                        <span className="font-semibold">
                          {formatCurrencyInCents(Number(value))}
                        </span>
                      </>
                    );
                  }
                  return (
                    <>
                      <div className="h-3 w-3 rounded bg-[var(--cta)]" />
                      <span className="text-muted-foreground">
                        Agendamentos:
                      </span>
                      <span className="font-semibold">{value}</span>
                    </>
                  );
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return dayjs(payload[0].payload?.fullDate).format(
                      "DD/MM/YYYY (dddd)",
                    );
                  }
                  return label;
                }}
              />
            }
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="appointments"
            stroke="var(--color-appointments)"
            fill="var(--color-appointments)"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="revenue"
            stroke="var(--color-revenue)"
            fill="var(--color-revenue)"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </PageSection>
  );
};
