"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/context/session-context"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { format, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachMonthOfInterval, eachYearOfInterval } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface Order {
  id: string
  created_at: string
  total: number
}

type Timeframe = "daily" | "monthly" | "yearly"

export function IncomeChart() {
  const { supabase } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      setError(null)
      if (!supabase) {
        setError("Supabase client not initialized");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, total") // Added 'id' to the select statement
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching orders for chart:", error)
        setError(error.message)
      } else {
        setOrders(data || [])
      }
      setLoading(false)
    }

    fetchOrders()
  }, [supabase])

  const aggregateData = (data: Order[], timeframe: Timeframe) => {
    const aggregated: { [key: string]: number } = {}

    data.forEach((order) => {
      const date = parseISO(order.created_at)
      let key: string

      if (timeframe === "daily") {
        key = format(date, "yyyy-MM-dd")
      } else if (timeframe === "monthly") {
        key = format(date, "yyyy-MM")
      } else { // yearly
        key = format(date, "yyyy")
      }

      aggregated[key] = (aggregated[key] || 0) + parseFloat(order.total.toString())
    })

    // Fill in missing dates/months/years with 0 for a continuous chart
    if (data.length === 0) return []

    const firstDate = parseISO(data[0].created_at);
    const lastDate = parseISO(data[data.length - 1].created_at);

    let dateRange: Date[] = [];
    if (timeframe === "daily") {
      dateRange = eachDayOfInterval({ start: firstDate, end: lastDate });
    } else if (timeframe === "monthly") {
      dateRange = eachMonthOfInterval({ start: startOfMonth(firstDate), end: endOfMonth(lastDate) });
    } else { // yearly
      dateRange = eachYearOfInterval({ start: startOfYear(firstDate), end: endOfYear(lastDate) });
    }

    return dateRange.map(date => {
      let key: string;
      if (timeframe === "daily") {
        key = format(date, "yyyy-MM-dd");
      } else if (timeframe === "monthly") {
        key = format(date, "yyyy-MM");
      } else { // yearly
        key = format(date, "yyyy");
      }
      return {
        name: key, // Use the parsable key as the name
        total: aggregated[key] || 0,
      };
    });
  }

  const chartData = aggregateData(orders, timeframe)

  const formatXAxis = (tickItem: string) => {
    if (timeframe === "daily") {
      return format(parseISO(tickItem), "MMM dd")
    } else if (timeframe === "monthly") {
      // Append '-01' to make it a valid ISO date for parseISO (e.g., "2023-01-01")
      return format(parseISO(`${tickItem}-01`), "MMM yy")
    } else { // yearly
      // Append '-01-01' to make it a valid ISO date for parseISO (e.g., "2023-01-01")
      return format(parseISO(`${tickItem}-01-01`), "yyyy")
    }
  }

  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Income Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-4">Loading income data...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Income Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error loading income data: {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Income Overview</CardTitle>
        <Select value={timeframe} onValueChange={(value: Timeframe) => setTimeframe(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tickFormatter={formatXAxis} />
                <YAxis tickFormatter={(value) => `$${value.toFixed(2)}`} />
                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, "Income"]} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#1e73be"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">No income data available for the selected period.</p>
        )}
      </CardContent>
    </Card>
  )
}