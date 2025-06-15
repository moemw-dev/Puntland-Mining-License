"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface License {
    license_area: string
    company_name: string
    calculated_fee: string
}

interface MiningAreaChartProps {
    licenses: License[]
}

const COLORS = [
    "#8b5cf6", // Purple
    "#3730a3", // Blue
    "#10b981", // Green
    "#f59e0b", // Orange
    "#ef4444", // Red
]

export default function MiningAreaChart({ licenses }: MiningAreaChartProps) {
    // Group licenses by mining area
    const areaData = licenses.reduce(
        (acc, license) => {
            let area = license.license_area
            if (!area || area.trim() === "" || area.toLowerCase() === "undefined" || area.toLowerCase() === "null") {
                area = "Unknown Area"
            } else {
                area = area.trim()
            }

            if (!acc[area]) {
                acc[area] = { count: 0, companies: [], totalRevenue: 0 }
            }

            acc[area].count += 1
            acc[area].companies.push(license.company_name || "Unknown Company")
            acc[area].totalRevenue += Number.parseFloat(license.calculated_fee) || 0

            return acc
        },
        {} as Record<string, { count: number; companies: string[]; totalRevenue: number }>,
    )

    const chartData = Object.entries(areaData).map(([area, data]) => ({
        area,
        count: data.count,
        companies: data.companies,
        totalRevenue: data.totalRevenue,
        avgRevenue: data.totalRevenue / data.count,
    }))

    const chartConfig = {
        count: {
            label: "Number of Licenses",
            color: "#10b981",
        },
    }

    return (
        <div className="w-full p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Mining Area Distribution</h3>
                    <p className="text-sm text-gray-600">License distribution by mining area</p>
                </div>
            </div>

            <ChartContainer config={chartConfig} className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="area" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} interval={0} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    formatter={(value, name, props) => [
                                        `${value} license${Number(value) > 1 ? "s" : ""}`,
                                        `Total Revenue: $${props.payload.totalRevenue.toLocaleString()}`,
                                        `Companies: ${props.payload.companies.join(", ")}`,
                                    ]}
                                />
                            }
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>

            <div className="mt-4 text-sm text-muted-foreground">
                <p>
                    <strong>Key Insight:</strong>{" "}
                    {chartData.length > 1
                        ? `${chartData.reduce((max, curr) => (curr.count > max.count ? curr : max)).area} has the most licenses (${chartData.reduce((max, curr) => (curr.count > max.count ? curr : max)).count}) with total revenue of $${chartData.reduce((max, curr) => (curr.count > max.count ? curr : max)).totalRevenue.toLocaleString()}`
                        : `All licenses are in ${chartData[0]?.area}`}
                </p>
            </div>
        </div>
    )
}
