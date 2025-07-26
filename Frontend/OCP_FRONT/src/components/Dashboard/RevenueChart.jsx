import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

function RevenueChart() {

    const data = [
        { month: "Jan", revenue: 45000, expenses: 32000 },
        { month: "Feb", revenue: 52000, expenses: 38000 },
        { month: "Mar", revenue: 48000, expenses: 35000 },
        { month: "Apr", revenue: 61000, expenses: 42000 },
        { month: "May", revenue: 55000, expenses: 40000 },
        { month: "Jun", revenue: 67000, expenses: 45000 },
        { month: "Jul", revenue: 72000, expenses: 48000 },
        { month: "Aug", revenue: 69000, expenses: 46000 },
        { month: "Sep", revenue: 78000, expenses: 52000 },
        { month: "Oct", revenue: 74000, expenses: 50000 },
        { month: "Nov", revenue: 82000, expenses: 55000 },
        { month: "Dec", revenue: 89000, expenses: 58000 }
    ];


    return (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                        Revenue Chart
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Monthly revenue and expenses
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            <span>Revenue</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full"></div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            <span>Expenses</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-80">

                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >

                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e2e8f0"
                            opacity={0.3}
                        />
                        <XAxis
                            dataKey="month"
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value / 1000}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: "none",
                                borderRadius: '12px',
                                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                            }}
                            formatter={(value) => [`$${value.toLocaleString()}`, '']}
                        />
                        <Bar
                            dataKey="revenue"
                            fill="url(#revenueGradient)"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                        />
                        <Bar
                            dataKey="expenses"
                            fill="url(#expensesGradient)"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                        />

                        <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#6366f1" />
                            </linearGradient>
                            <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#94a3b8" />
                                <stop offset="100%" stopColor="#64748b" />
                            </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
export default RevenueChart;