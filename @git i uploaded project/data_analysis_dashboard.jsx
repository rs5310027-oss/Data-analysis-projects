import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, Brush
} from "recharts";

const COLORS = {
  blue: "#378ADD", teal: "#1D9E75", coral: "#D85A30",
  purple: "#7F77DD", amber: "#BA7517", green: "#639922",
  pink: "#D4537E", gray: "#888780"
};
const PALETTE = Object.values(COLORS);

function generateNormal(mean, std, n) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    arr.push(+(mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)).toFixed(2));
  }
  return arr;
}

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const timeSeriesData = months.map((m, i) => ({
  month: m,
  sales: Math.round(3000 + 800 * Math.sin(i / 2) + Math.random() * 400),
  profit: Math.round(1200 + 300 * Math.sin(i / 2 + 1) + Math.random() * 200),
  expenses: Math.round(1800 + 400 * Math.cos(i / 3) + Math.random() * 300),
}));

const categoryData = [
  { name: "Electronics", value: 4200, growth: 12 },
  { name: "Fashion", value: 3100, growth: 8 },
  { name: "Home", value: 2800, growth: -3 },
  { name: "Sports", value: 2200, growth: 15 },
  { name: "Books", value: 1600, growth: 5 },
  { name: "Beauty", value: 1900, growth: 20 },
];

const scatterData = Array.from({ length: 60 }, () => ({
  x: +(Math.random() * 100).toFixed(1),
  y: +(Math.random() * 80 + 20).toFixed(1),
  z: Math.round(Math.random() * 40 + 10),
}));

const radarData = [
  { axis: "Speed", A: 85, B: 72 },
  { axis: "Strength", A: 68, B: 90 },
  { axis: "Agility", A: 92, B: 65 },
  { axis: "Endurance", A: 78, B: 88 },
  { axis: "Precision", A: 80, B: 75 },
  { axis: "Recovery", A: 70, B: 82 },
];

const pieData = [
  { name: "Direct", value: 35 },
  { name: "Organic", value: 28 },
  { name: "Referral", value: 18 },
  { name: "Social", value: 12 },
  { name: "Email", value: 7 },
];

const normalSamples = generateNormal(50, 15, 100);
const histBins = Array.from({ length: 12 }, (_, i) => {
  const lo = 10 + i * 7, hi = lo + 7;
  return { range: `${lo}-${hi}`, count: normalSamples.filter(v => v >= lo && v < hi).length };
});

const heatmapData = Array.from({ length: 7 }, (_, d) =>
  Array.from({ length: 24 }, (_, h) => ({
    day: d, hour: h,
    value: Math.round(10 + 80 * Math.abs(Math.sin((h - 9) / 6)) * (d < 5 ? 1 : 0.4) + Math.random() * 15)
  }))
).flat();
const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const boxData = ["Control","Group A","Group B","Group C"].map((g, i) => {
  const samples = generateNormal(40 + i * 8, 8 + i * 2, 50).sort((a, b) => a - b);
  const q1 = samples[Math.floor(samples.length * 0.25)];
  const median = samples[Math.floor(samples.length * 0.5)];
  const q3 = samples[Math.floor(samples.length * 0.75)];
  return { group: g, min: samples[5], q1, median, q3, max: samples[samples.length - 6], mean: +(samples.reduce((a, b) => a + b, 0) / samples.length).toFixed(1) };
});

const TABS = ["Overview","Distribution","Correlation","Advanced"];

const StatCard = ({ label, value, sub, color }) => (
  <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "14px 16px", minWidth: 0 }}>
    <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 500, color: color || "var(--color-text-primary)" }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 3 }}>{sub}</div>}
  </div>
);

const SectionTitle = ({ children }) => (
  <h3 style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-secondary)", margin: "0 0 12px", textTransform: "none", letterSpacing: 0 }}>{children}</h3>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", padding: "8px 12px", fontSize: 12 }}>
      {label && <div style={{ fontWeight: 500, marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "var(--color-text-primary)" }}>{p.name}: <b>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</b></div>
      ))}
    </div>
  );
};

function Heatmap() {
  const maxVal = Math.max(...heatmapData.map(d => d.value));
  const cellW = 22, cellH = 22, pad = 2;
  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={24 * (cellW + pad) + 40} height={7 * (cellH + pad) + 30} style={{ display: "block" }}>
        {days.map((d, di) => (
          <text key={d} x={32} y={di * (cellH + pad) + cellH / 2 + 4} fontSize={10} fill="var(--color-text-secondary)" textAnchor="end">{d}</text>
        ))}
        {Array.from({ length: 8 }, (_, i) => i * 3).map(h => (
          <text key={h} x={36 + h * (cellW + pad) + cellW / 2} y={7 * (cellH + pad) + 18} fontSize={10} fill="var(--color-text-secondary)" textAnchor="middle">{h}:00</text>
        ))}
        {heatmapData.map(({ day, hour, value }) => {
          const t = value / maxVal;
          const r = Math.round(55 + t * 183), g = Math.round(130 - t * 80), b = Math.round(221 - t * 180);
          return (
            <rect key={`${day}-${hour}`} x={36 + hour * (cellW + pad)} y={day * (cellH + pad)} width={cellW} height={cellH} rx={3} fill={`rgb(${r},${g},${b})`} opacity={0.85}>
              <title>{days[day]} {hour}:00 — {value}</title>
            </rect>
          );
        })}
      </svg>
    </div>
  );
}

function BoxPlot() {
  const W = 580, H = 220, pad = { l: 60, r: 20, t: 20, b: 30 };
  const allVals = boxData.flatMap(d => [d.min, d.max]);
  const minY = Math.min(...allVals) - 5, maxY = Math.max(...allVals) + 5;
  const scaleY = v => pad.t + (1 - (v - minY) / (maxY - minY)) * (H - pad.t - pad.b);
  const bw = 50, gap = (W - pad.l - pad.r - boxData.length * bw) / (boxData.length + 1);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {[0, 25, 50, 75, 100].map(v => {
        const val = minY + v * (maxY - minY) / 100;
        const y = scaleY(val);
        return (
          <g key={v}>
            <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="var(--color-border-tertiary)" strokeWidth={0.5} />
            <text x={pad.l - 6} y={y + 4} fontSize={9} fill="var(--color-text-secondary)" textAnchor="end">{val.toFixed(0)}</text>
          </g>
        );
      })}
      {boxData.map(({ group, min, q1, median, q3, max, mean }, i) => {
        const cx = pad.l + gap + i * (bw + gap) + bw / 2;
        const x0 = cx - bw / 2;
        return (
          <g key={group}>
            <line x1={cx} x2={cx} y1={scaleY(min)} y2={scaleY(max)} stroke={PALETTE[i]} strokeWidth={1.5} strokeDasharray="3,2" />
            <line x1={cx - 10} x2={cx + 10} y1={scaleY(min)} y2={scaleY(min)} stroke={PALETTE[i]} strokeWidth={1.5} />
            <line x1={cx - 10} x2={cx + 10} y1={scaleY(max)} y2={scaleY(max)} stroke={PALETTE[i]} strokeWidth={1.5} />
            <rect x={x0} y={scaleY(q3)} width={bw} height={Math.abs(scaleY(q1) - scaleY(q3))} fill={PALETTE[i]} opacity={0.25} rx={2} />
            <rect x={x0} y={scaleY(q3)} width={bw} height={Math.abs(scaleY(q1) - scaleY(q3))} fill="none" stroke={PALETTE[i]} strokeWidth={1.5} rx={2} />
            <line x1={x0} x2={x0 + bw} y1={scaleY(median)} y2={scaleY(median)} stroke={PALETTE[i]} strokeWidth={2.5} />
            <circle cx={cx} cy={scaleY(mean)} r={3} fill={PALETTE[i]} />
            <text x={cx} y={H - 8} fontSize={10} fill="var(--color-text-secondary)" textAnchor="middle">{group}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState("Overview");
  const [chartType, setChartType] = useState("line");

  const stats = [
    { label: "Total Sales", value: "$" + (timeSeriesData.reduce((a, b) => a + b.sales, 0) / 1000).toFixed(1) + "K", sub: "12-month cumulative", color: COLORS.blue },
    { label: "Avg Profit Margin", value: "38.2%", sub: "+2.4% vs last year", color: COLORS.teal },
    { label: "Top Category", value: "Electronics", sub: "$4,200 revenue", color: COLORS.purple },
    { label: "Peak Month", value: "Jun", sub: "Sales $4,203", color: COLORS.coral },
  ];

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: "1rem 0", color: "var(--color-text-primary)" }}>
      <h2 style={{ fontSize: 18, fontWeight: 500, margin: "0 0 4px" }}>Data Analysis Dashboard</h2>
      <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 20px" }}>pandas · numpy · seaborn · matplotlib — all chart types</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 10, marginBottom: 20 }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "6px 14px", fontSize: 13, fontWeight: tab === t ? 500 : 400,
            color: tab === t ? "var(--color-text-primary)" : "var(--color-text-secondary)",
            borderBottom: tab === t ? "2px solid " + COLORS.blue : "2px solid transparent",
            marginBottom: -1,
          }}>{t}</button>
        ))}
      </div>

      {tab === "Overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <SectionTitle>Time Series — Sales / Profit / Expenses</SectionTitle>
              <div style={{ display: "flex", gap: 6 }}>
                {["line","area","bar"].map(t => (
                  <button key={t} onClick={() => setChartType(t)} style={{
                    fontSize: 11, padding: "3px 10px", borderRadius: "var(--border-radius-md)",
                    border: "0.5px solid var(--color-border-secondary)", cursor: "pointer",
                    background: chartType === t ? "var(--color-background-info)" : "none",
                    color: chartType === t ? "var(--color-text-info)" : "var(--color-text-secondary)"
                  }}>{t}</button>
                ))}
              </div>
            </div>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "line" ? (
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--color-border-secondary)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--color-border-secondary)" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="sales" stroke={COLORS.blue} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="profit" stroke={COLORS.teal} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="expenses" stroke={COLORS.coral} strokeWidth={2} dot={{ r: 3 }} />
                    <Brush dataKey="month" height={20} stroke="var(--color-border-tertiary)" />
                  </LineChart>
                ) : chartType === "area" ? (
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--color-border-secondary)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--color-border-secondary)" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="sales" stroke={COLORS.blue} fill={COLORS.blue} fillOpacity={0.15} strokeWidth={2} />
                    <Area type="monotone" dataKey="profit" stroke={COLORS.teal} fill={COLORS.teal} fillOpacity={0.15} strokeWidth={2} />
                    <Area type="monotone" dataKey="expenses" stroke={COLORS.coral} fill={COLORS.coral} fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                ) : (
                  <BarChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--color-border-secondary)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--color-border-secondary)" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="sales" fill={COLORS.blue} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="profit" fill={COLORS.teal} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="expenses" fill={COLORS.coral} radius={[3, 3, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <SectionTitle>Category Breakdown — Horizontal Bar</SectionTitle>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
                    <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--color-border-secondary)" />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={65} stroke="var(--color-border-secondary)" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                      {categoryData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <SectionTitle>Market Share — Donut / Pie</SectionTitle>
              <div style={{ height: 220, position: "relative" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={2}>
                      {pieData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "Distribution" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <SectionTitle>Histogram — Normal Distribution (μ=50, σ=15, n=100)</SectionTitle>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histBins} barCategoryGap="5%">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
                  <XAxis dataKey="range" tick={{ fontSize: 10 }} stroke="var(--color-border-secondary)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--color-border-secondary)" />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine x="43-50" stroke={COLORS.coral} strokeDasharray="4 2" label={{ value: "μ", position: "top", fontSize: 11, fill: COLORS.coral }} />
                  <Bar dataKey="count" fill={COLORS.purple} fillOpacity={0.75} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <SectionTitle>Box Plot — Quartiles, Median, Outliers</SectionTitle>
            <BoxPlot />
            <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 8 }}>
              Box = IQR (Q1–Q3) · Center line = median · Dot = mean · Whiskers = min/max (trimmed)
            </div>
          </div>
          <div>
            <SectionTitle>Activity Heatmap — Hour × Day of Week</SectionTitle>
            <Heatmap />
          </div>
        </div>
      )}

      {tab === "Correlation" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <SectionTitle>Scatter Plot — X vs Y (bubble = Z)</SectionTitle>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
                  <XAxis dataKey="x" name="Feature X" tick={{ fontSize: 10 }} stroke="var(--color-border-secondary)" label={{ value: "Feature X", position: "insideBottom", offset: -2, fontSize: 11 }} />
                  <YAxis dataKey="y" name="Feature Y" tick={{ fontSize: 10 }} stroke="var(--color-border-secondary)" label={{ value: "Feature Y", angle: -90, position: "insideLeft", fontSize: 11 }} />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<CustomTooltip />} />
                  <Scatter data={scatterData} fill={COLORS.teal} fillOpacity={0.6} name="Observations" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <SectionTitle>Radar Chart — Multi-metric Comparison</SectionTitle>
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--color-border-tertiary)" />
                    <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: "var(--color-text-secondary)" }} />
                    <Radar name="Team A" dataKey="A" stroke={COLORS.blue} fill={COLORS.blue} fillOpacity={0.2} strokeWidth={2} />
                    <Radar name="Team B" dataKey="B" stroke={COLORS.coral} fill={COLORS.coral} fillOpacity={0.2} strokeWidth={2} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <SectionTitle>Growth vs Revenue — Bubble Chart</SectionTitle>
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
                    <XAxis dataKey="value" name="Revenue" tick={{ fontSize: 10 }} stroke="var(--color-border-secondary)" />
                    <YAxis dataKey="growth" name="Growth %" tick={{ fontSize: 10 }} stroke="var(--color-border-secondary)" />
                    <Tooltip content={<CustomTooltip />} />
                    <Scatter data={categoryData} name="Category">
                      {categoryData.map((d, i) => (
                        <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "Advanced" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <SectionTitle>Stacked Area — Cumulative Trend</SectionTitle>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--color-border-secondary)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--color-border-secondary)" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="expenses" stackId="1" stroke={COLORS.coral} fill={COLORS.coral} fillOpacity={0.4} />
                  <Area type="monotone" dataKey="profit" stackId="1" stroke={COLORS.teal} fill={COLORS.teal} fillOpacity={0.4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <SectionTitle>Waterfall — Monthly Sales Delta</SectionTitle>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeSeriesData.map((d, i, arr) => ({
                  month: d.month,
                  delta: i === 0 ? d.sales : d.sales - arr[i - 1].sales,
                  base: i === 0 ? 0 : Math.min(d.sales, arr[i - 1].sales),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--color-border-secondary)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--color-border-secondary)" />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={0} stroke="var(--color-border-secondary)" />
                  <Bar dataKey="delta" radius={[3, 3, 0, 0]}>
                    {timeSeriesData.map((d, i, arr) => {
                      const delta = i === 0 ? d.sales : d.sales - arr[i - 1].sales;
                      return <Cell key={i} fill={i === 0 ? COLORS.blue : delta >= 0 ? COLORS.teal : COLORS.coral} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <SectionTitle>Multi-axis — Sales + Profit Margin %</SectionTitle>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeSeriesData.map(d => ({ ...d, margin: +((d.profit / d.sales) * 100).toFixed(1) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--color-border-secondary)" />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="var(--color-border-secondary)" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="var(--color-border-secondary)" unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar yAxisId="left" dataKey="sales" fill={COLORS.blue} fillOpacity={0.7} radius={[3, 3, 0, 0]} name="Sales" />
                  <Line yAxisId="right" type="monotone" dataKey="margin" stroke={COLORS.amber} strokeWidth={2.5} dot={{ r: 3 }} name="Margin %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 24, padding: "12px 14px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
        <strong style={{ color: "var(--color-text-primary)" }}>Python equivalents: </strong>
        <code style={{ fontFamily: "var(--font-mono)" }}>sns.lineplot · plt.hist · sns.boxplot · sns.heatmap · plt.scatter · sns.radar · plt.stackplot · df.plot.bar</code>
      </div>
    </div>
  );
}
