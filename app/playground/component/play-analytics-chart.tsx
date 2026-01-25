"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type Chat = {
  id: string;
  isPinned: boolean | null;
};

const LINE_COLOR = "#22c55e"; // emerald
const AREA_COLOR = "#22c55e";
const GRID_COLOR = "#2a2a2a";

const PIE_COLORS = [
  "#3b82f6", // blue (Pinned)
  "#f97316", // orange (Unpinned)
];

export function PlayAnalyticsCharts({ chats }: { chats: Chat[] }) {
  /* ---------- Line chart data ---------- */
  const lineChartData = chats.map((_, index) => ({
    index: index + 1,
    total: index + 1,
  }));

  /* ---------- Pie chart data ---------- */
  const pinned = chats.filter((c) => c.isPinned).length;
  const unpinned = chats.length - pinned;

  const pieChartData = [
    { name: "Pinned", value: pinned },
    { name: "Unpinned", value: unpinned },
  ];

  return (
    <section className="grid gap-6 px-4 md:grid-cols-2 md:px-6">
      {/* Chat Growth */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-zinc-100">
            Chat Growth
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineChartData}>
              <CartesianGrid stroke={GRID_COLOR} strokeDasharray="4 4" />
              <XAxis
                dataKey="index"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#09090b",
                  border: "1px solid #27272a",
                  borderRadius: 6,
                }}
                labelStyle={{ color: "#e4e4e7" }}
              />
              <Area
                type="monotone"
                dataKey="total"
                fill={AREA_COLOR}
                fillOpacity={0.25}
                stroke="none"
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke={LINE_COLOR}
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pinned vs Unpinned */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-zinc-100">
            Pinned vs Unpinned
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72 flex flex-col gap-4">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#09090b",
                    border: "1px solid #27272a",
                    borderRadius: 6,
                  }}
                  labelStyle={{ color: "#e4e4e7" }}
                />
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={6}
                >
                  {pieChartData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 text-sm text-zinc-200">
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: PIE_COLORS[0] }}
              />
              <span>Pinned ({pinned})</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: PIE_COLORS[1] }}
              />
              <span>Unpinned ({unpinned})</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
