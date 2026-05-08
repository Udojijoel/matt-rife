import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, differenceInCalendarDays, addDays, startOfDay, endOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

const TRACKED = [
  "get_tickets_click",
  "whatsapp_checkout_click",
  "checkout_submit",
  "checkout_success",
  "receipt_share_click",
] as const;

const LABELS: Record<string, string> = {
  get_tickets_click: "Get Tickets",
  whatsapp_checkout_click: "WhatsApp Click",
  checkout_submit: "Checkout Submit",
  checkout_success: "Checkout Success",
  receipt_share_click: "Receipt Share",
};

const config: ChartConfig = {
  count: { label: "Events", color: "hsl(var(--primary))" },
};

interface DayRow {
  day: string;
  [k: string]: string | number;
}

const PRESETS: { label: string; days: number }[] = [
  { label: "7d", days: 7 },
  { label: "14d", days: 14 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

export default function AnalyticsChart() {
  const [range, setRange] = useState<DateRange>(() => ({
    from: startOfDay(addDays(new Date(), -13)),
    to: endOfDay(new Date()),
  }));
  const [data, setData] = useState<DayRow[]>([]);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const { from, to } = range;

  useEffect(() => {
    if (!from || !to) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const start = startOfDay(from);
      const end = endOfDay(to);

      const { data: events, error } = await supabase
        .from("analytics_events")
        .select("event_name, created_at")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .order("created_at", { ascending: true })
        .limit(1000);

      if (cancelled) return;
      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const days = differenceInCalendarDays(end, start) + 1;
      const byDay: Record<string, Record<string, number>> = {};
      const tot: Record<string, number> = {};
      for (let i = 0; i < days; i++) {
        const d = addDays(start, i);
        byDay[format(d, "MM-dd")] = {};
      }

      (events ?? []).forEach((e) => {
        const key = format(new Date(e.created_at), "MM-dd");
        if (!byDay[key]) byDay[key] = {};
        byDay[key][e.event_name] = (byDay[key][e.event_name] || 0) + 1;
        tot[e.event_name] = (tot[e.event_name] || 0) + 1;
      });

      setData(Object.entries(byDay).map(([day, counts]) => ({ day, ...counts })));
      setTotals(tot);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  const colors = [
    "hsl(var(--primary))",
    "hsl(var(--accent))",
    "hsl(142 70% 45%)",
    "hsl(45 93% 55%)",
    "hsl(20 90% 55%)",
  ];

  const rangeLabel = useMemo(() => {
    if (!from) return "Pick a range";
    if (!to) return format(from, "LLL d, y");
    return `${format(from, "LLL d, y")} – ${format(to, "LLL d, y")}`;
  }, [from, to]);

  const applyPreset = (days: number) => {
    setRange({
      from: startOfDay(addDays(new Date(), -(days - 1))),
      to: endOfDay(new Date()),
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-display text-2xl">Funnel Analytics</h2>
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p) => (
            <Button
              key={p.label}
              size="sm"
              variant="outline"
              onClick={() => applyPreset(p.days)}
            >
              {p.label}
            </Button>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn("justify-start text-left font-normal", !from && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {rangeLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={range}
                onSelect={(r) => r && setRange(r)}
                numberOfMonths={2}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          {loading && <span className="text-sm text-muted-foreground">Loading…</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {TRACKED.map((name) => (
          <div key={name} className="bg-secondary/40 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">{LABELS[name]}</p>
            <p className="text-2xl font-bold mt-1">{totals[name] || 0}</p>
          </div>
        ))}
      </div>

      <ChartContainer config={config} className="h-[300px] w-full">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
          <XAxis dataKey="day" />
          <YAxis allowDecimals={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          {TRACKED.map((name, i) => (
            <Bar
              key={name}
              dataKey={name}
              name={LABELS[name]}
              fill={colors[i]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ChartContainer>
    </div>
  );
}
