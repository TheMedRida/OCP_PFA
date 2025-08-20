


import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ComposedChart
} from 'recharts';
import { 
  Activity, AlertTriangle, Battery, Cpu, Gauge, 
  Thermometer, Zap, Settings, TrendingUp, TrendingDown,
  Clock, Shield, Wrench, Eye, Radio, Droplets
} from 'lucide-react';

// Sample data based on your sensor structure
const generateTimeSeriesData = () => {
  const data = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      timestamp: timestamp.toLocaleTimeString(),
      vibrationX: 1.2 + Math.random() * 0.4,
      vibrationY: 0.3 + Math.random() * 0.2,
      vibrationZ: 0.9 + Math.random() * 0.3,
      bearingTemp: 98 + Math.random() * 8,
      motorTemp: 145 + Math.random() * 10,
      gearboxTemp: 32 + Math.random() * 6,
      powerConsumption: 650 + Math.random() * 120,
      shaftSpeed: 1580 + Math.random() * 100,
      efficiency: 58 + Math.random() * 8,
      pressure: 24 + Math.random() * 4,
      rul: 200 + Math.random() * 40,
      ttf: 600 + Math.random() * 100
    });
  }
  return data;
};

const machineHealthData = [
  { component: 'Motor', health: 85, status: 'Good' },
  { component: 'Bearing', health: 72, status: 'Fair' },
  { component: 'Gearbox', health: 91, status: 'Excellent' },
  { component: 'Hydraulics', health: 67, status: 'Warning' },
  { component: 'Cooling System', health: 88, status: 'Good' },
  { component: 'Power System', health: 94, status: 'Excellent' }
];

const temperatureDistribution = [
  { name: 'Motor', value: 149, fill: '#ef4444' },
  { name: 'Bearing', value: 102, fill: '#f97316' },
  { name: 'Gearbox', value: 35, fill: '#22c55e' },
  { name: 'Coolant', value: 28, fill: '#3b82f6' },
  { name: 'Oil', value: 26, fill: '#8b5cf6' },
  { name: 'Ambient', value: 28, fill: '#06b6d4' }
];

const vibrationData = [
  { axis: 'X-Axis', current: 1.36, threshold: 2.0 },
  { axis: 'Y-Axis', current: 0.38, threshold: 2.0 },
  { axis: 'Z-Axis', current: 0.99, threshold: 2.0 },
  { axis: 'RMS', current: 1.01, threshold: 2.0 },
  { axis: 'Peak', current: 4.42, threshold: 5.0 }
];

const maintenanceSchedule = [
  { task: 'Oil Change', dueIn: 15, type: 'Preventive', priority: 'High' },
  { task: 'Bearing Inspection', dueIn: 32, type: 'Predictive', priority: 'Medium' },
  { task: 'Filter Replacement', dueIn: 8, type: 'Preventive', priority: 'High' },
  { task: 'Calibration', dueIn: 45, type: 'Scheduled', priority: 'Low' },
  { task: 'Vibration Analysis', dueIn: 7, type: 'Predictive', priority: 'Critical' }
];

const powerMetrics = [
  { phase: 'Phase A', voltage: 200.3, current: 17.5 },
  { phase: 'Phase B', voltage: 201.8, current: 136.7 },
  { phase: 'Phase C', voltage: 220.6, current: 35.4 }
];

function Dashboard() {
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    machineStatus: 'Running',
    utilization: 76.3,
    efficiency: 60.1,
    failureProbability: 0.08,
    rul: 220.1,
    ttf: 644.5
  });

  useEffect(() => {
    setTimeSeriesData(generateTimeSeriesData());
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setTimeSeriesData(generateTimeSeriesData());
      setRealTimeMetrics(prev => ({
        ...prev,
        utilization: 70 + Math.random() * 15,
        efficiency: 55 + Math.random() * 15,
        failureProbability: 0.05 + Math.random() * 0.1
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const MetricCard = ({ title, value, unit, icon: Icon, trend, color, bgColor }) => (
    <div className={`${bgColor} backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('-600', '-100')} dark:${color.replace('text-', 'bg-').replace('-600', '-900/30')}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        {trend && (
          <div className="flex items-center space-x-1">
            {trend > 0 ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
            <span className={`text-sm font-medium ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-slate-800 dark:text-white">
          {value}{unit && <span className="text-lg text-slate-500 ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Industrial IoT Dashboard</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Real-time machine monitoring and predictive analytics</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Live Data</span>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Last Update: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <MetricCard 
            title="Machine Status" 
            value={realTimeMetrics.machineStatus}
            icon={Activity} 
            color="text-emerald-600"
            bgColor="bg-white/80 dark:bg-slate-900/80"
          />
          <MetricCard 
            title="Utilization" 
            value={realTimeMetrics.utilization.toFixed(1)}
            unit="%"
            icon={Gauge} 
            trend={2.3}
            color="text-blue-600"
            bgColor="bg-white/80 dark:bg-slate-900/80"
          />
          <MetricCard 
            title="Efficiency" 
            value={realTimeMetrics.efficiency.toFixed(1)}
            unit="%"
            icon={TrendingUp} 
            trend={-1.2}
            color="text-purple-600"
            bgColor="bg-white/80 dark:bg-slate-900/80"
          />
          <MetricCard 
            title="Failure Risk" 
            value={(realTimeMetrics.failureProbability * 100).toFixed(1)}
            unit="%"
            icon={AlertTriangle} 
            color="text-orange-600"
            bgColor="bg-white/80 dark:bg-slate-900/80"
          />
          <MetricCard 
            title="RUL" 
            value={realTimeMetrics.rul.toFixed(0)}
            unit="hrs"
            icon={Clock} 
            color="text-indigo-600"
            bgColor="bg-white/80 dark:bg-slate-900/80"
          />
          <MetricCard 
            title="TTF" 
            value={realTimeMetrics.ttf.toFixed(0)}
            unit="hrs"
            icon={Shield} 
            color="text-cyan-600"
            bgColor="bg-white/80 dark:bg-slate-900/80"
          />
        </div>

        {/* Temperature & Vibration Monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temperature Trends */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
                  <Thermometer className="w-5 h-5 mr-2 text-red-500" />
                  Temperature Monitoring
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Real-time temperature across components</p>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="timestamp" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area dataKey="motorTemp" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                  <Area dataKey="bearingTemp" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
                  <Line dataKey="gearboxTemp" stroke="#22c55e" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Vibration Analysis */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-500" />
                  Vibration Analysis
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Multi-axis vibration monitoring</p>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={vibrationData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <PolarRadiusAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Radar name="Current" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
                  <Radar name="Threshold" dataKey="threshold" stroke="#ef4444" fill="none" strokeWidth={2} strokeDasharray="5 5" />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Power & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Power Consumption */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                  Power Metrics
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">3-Phase power analysis</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={powerMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="phase" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="voltage" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="current" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Temperature Distribution */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                  <Thermometer className="w-5 h-5 mr-2 text-red-500" />
                  Temp Distribution
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Component temperatures</p>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={temperatureDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {temperatureDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}°C`, 'Temperature']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {temperatureDistribution.map((item, index) => (
                <div className="flex items-center space-x-2" key={index}>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-xs text-slate-600 dark:text-slate-400">{item.name}</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-white">{item.value}°</span>
                </div>
              ))}
            </div>
          </div>

          {/* Machine Health Score */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-emerald-500" />
                  Health Score
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Component health status</p>
              </div>
            </div>
            <div className="space-y-4">
              {machineHealthData.map((component, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{component.component}</span>
                    <span className={`text-sm font-semibold ${
                      component.health >= 85 ? 'text-emerald-500' :
                      component.health >= 70 ? 'text-yellow-500' : 'text-red-500'
                    }`}>{component.health}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        component.health >= 85 ? 'bg-emerald-500' :
                        component.health >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${component.health}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Trends & Maintenance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Trends */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-emerald-500" />
                  Performance Trends
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Efficiency and utilization over time</p>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="timestamp" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line dataKey="efficiency" stroke="#10b981" strokeWidth={3} dot={false} />
                  <Line dataKey="powerConsumption" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  <Line dataKey="shaftSpeed" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Maintenance Schedule */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
                  <Wrench className="w-5 h-5 mr-2 text-blue-500" />
                  Maintenance Schedule
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Upcoming maintenance tasks</p>
              </div>
            </div>
            <div className="space-y-4">
              {maintenanceSchedule.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-slate-200/30 dark:border-slate-700/30">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 dark:text-white text-sm">{task.task}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">{task.type}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        task.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        task.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-800 dark:text-white">{task.dueIn}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">days</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Predictive Analytics */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center">
                <Eye className="w-5 h-5 mr-2 text-purple-500" />
                Predictive Analytics
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">RUL and TTF predictions with failure probability</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="timestamp" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area dataKey="rul" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                <Line dataKey="ttf" stroke="#06b6d4" strokeWidth={3} dot={false} />
                <Bar dataKey="pressure" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;