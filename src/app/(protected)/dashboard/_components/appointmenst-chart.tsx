"use client";

import dayjs from "dayjs";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrencyInCents } from "@/helpers/currency";

export const description = "An area chart with gradient fill";

interface RevenueChartProps {
  dailyAppointmentsData: {
    date: string;
    appointments: number;
    revenue: number;
  }[];
}

export const AppointmentsChart = ({
  dailyAppointmentsData,
}: RevenueChartProps) => {
  // Gera 21 dias: 10 antes + hoje + 10 depois
  const chartDays = Array.from({ length: 21 }).map((_item, index) =>
    dayjs()
      .subtract(10 - index, "days")
      .format("YYYY-MM-DD"),
  );

  const chartData = chartDays.map((date) => {
    const dayData = dailyAppointmentsData.find((item) => item.date === date);
    return {
      date: dayjs(date).format("DD/MM"),
      fullDate: date,
      appointments: dayData?.appointments || 0,
      revenue: dayData?.revenue || 0,
    };
  });

  const chartConfig = {
    appointments: {
      label: "Agendamentos",
      color: "var(--sidebar-primary)",
    },
    revenue: {
      label: "Receita",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Area Chart - Gradient</CardTitle>
        <CardDescription>
          Showing total visitors for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
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
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    if (name === "revenue") {
                      return (
                        <>
                          <div className="h3 w-3 rounded bg-[var(--chart-2)]">
                            <span className="text-muted-foreground">
                              Faturamento:
                            </span>
                            <span className="font-semibold">
                              {formatCurrencyInCents(Number(value))}
                            </span>
                          </div>
                        </>
                      );
                    }

                    return (
                      <>
                        <div className="h3 w-3 rounded bg-[var(--side-bar-primary)]">
                          <span className="text-muted-foreground">
                            Agendamentos:
                          </span>
                          <span className="font-semibold">{value}</span>
                        </div>
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
      </CardContent>
    </Card>
  );
};
