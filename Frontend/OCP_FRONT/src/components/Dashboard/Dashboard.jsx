import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ComposedChart, Legend
} from 'recharts';
import { 
  Activity, AlertTriangle, Battery, Cpu, Gauge, 
  Thermometer, Zap, Settings, TrendingUp, TrendingDown,
  Clock, Shield, Wrench, Eye, Radio, Droplets, RefreshCw,
  Wifi, WifiOff, Server, Database, Factory, AlertCircle
} from 'lucide-react';

// API base URL - adjust this to match your Spring Boot server
const API_BASE_URL = 'http://localhost:8080/api/sensor-data';

function Dashboard() {
  const [realTimeData, setRealTimeData] = useState([]);
  const [machineHealthOverview, setMachineHealthOverview] = useState([]);
  const [temperatureTrends, setTemperatureTrends] = useState({});
  const [vibrationAnalysis, setVibrationAnalysis] = useState({});
  const [productionMetrics, setProductionMetrics] = useState({});
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [failurePredictions, setFailurePredictions] = useState({});
  const [environmentalData, setEnvironmentalData] = useState({});
  const [electricalMetrics, setElectricalMetrics] = useState({});
  const [connectivityStatus, setConnectivityStatus] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [componentHealth, setComponentHealth] = useState({});
  const [statisticalSummary, setStatisticalSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState('M002');
  const [timeRange, setTimeRange] = useState('24h');

  // Mock data for demonstration since we don't have the actual API running
  const generateMockData = () => {
    const now = new Date();
    const machines = ['M001', 'M002', 'M003', 'M004', 'M005'];
    
    // Real-time metrics
    setRealTimeData([
      {
        machineId: 'M001',
        timestamp: now.toISOString(),
        status: 'Running',
        utilization: 87.5,
        efficiency: 92.3,
        failureProbability: 0.12,
        rul: 245,
        ttf: 312,
        vibrationX: 1.2,
        vibrationY: 0.8,
        vibrationZ: 1.1,
        motorTemperature: 68.5,
        powerConsumption: 245.7
      },
      {
        machineId: 'M002',
        timestamp: now.toISOString(),
        status: 'Running',
        utilization: 76.2,
        efficiency: 88.9,
        failureProbability: 0.08,
        rul: 298,
        ttf: 356,
        vibrationX: 0.9,
        vibrationY: 1.0,
        vibrationZ: 0.7,
        motorTemperature: 64.2,
        powerConsumption: 198.3
      }
    ]);

    // Machine health overview
    setMachineHealthOverview([
      { machineId: 'M001', healthScore: 85, status: 'Good', utilization: 87.5, lastMaintenance: '2024-08-15' },
      { machineId: 'M002', healthScore: 92, status: 'Excellent', utilization: 76.2, lastMaintenance: '2024-08-10' },
      { machineId: 'M003', healthScore: 78, status: 'Warning', utilization: 65.8, lastMaintenance: '2024-08-18' },
      { machineId: 'M004', healthScore: 95, status: 'Excellent', utilization: 89.3, lastMaintenance: '2024-08-12' },
      { machineId: 'M005', healthScore: 69, status: 'Critical', utilization: 45.2, lastMaintenance: '2024-08-20' }
    ]);

    // Temperature trends
    const tempData = Array.from({ length: 24 }, (_, i) => ({
      time: `${23 - i}h ago`,
      motorTemp: 65 + Math.random() * 15,
      bearingTemp: 55 + Math.random() * 20,
      gearboxTemp: 45 + Math.random() * 25,
      coolantTemp: 25 + Math.random() * 15,
      oilTemp: 60 + Math.random() * 20,
      ambientTemp: 20 + Math.random() * 10
    }));
    setTemperatureTrends({ timeSeries: tempData.reverse() });

    // Vibration analysis
    setVibrationAnalysis({
      radarData: [
        { axis: 'X-Axis', current: 1.2, threshold: 2.0, healthy: 0.8 },
        { axis: 'Y-Axis', current: 0.8, threshold: 2.0, healthy: 0.8 },
        { axis: 'Z-Axis', current: 1.1, threshold: 2.0, healthy: 0.8 },
        { axis: 'RMS', current: 1.0, threshold: 1.8, healthy: 0.7 },
        { axis: 'Peak', current: 4.2, threshold: 6.0, healthy: 3.0 },
        { axis: 'Acoustic', current: 64.3, threshold: 80.0, healthy: 50.0 }
      ],
      trend: Array.from({ length: 50 }, (_, i) => ({
        time: i,
        x: 1.0 + 0.2 * Math.sin(i * 0.1) + Math.random() * 0.1,
        y: 0.8 + 0.15 * Math.cos(i * 0.12) + Math.random() * 0.1,
        z: 1.1 + 0.18 * Math.sin(i * 0.08) + Math.random() * 0.1
      }))
    });

    // Production metrics
    setProductionMetrics({
      efficiency: Array.from({ length: 12 }, (_, i) => ({
        hour: `${i}:00`,
        efficiency: 85 + Math.random() * 15,
        productionRate: 20 + Math.random() * 10,
        scrapRate: Math.random() * 5,
        utilization: 70 + Math.random() * 25
      })),
      summary: {
        totalProduced: 2456,
        scrapCount: 23,
        defectiveCount: 12,
        avgEfficiency: 89.2,
        avgUtilization: 82.7
      }
    });

    // Failure predictions
    setFailurePredictions({
      predictions: Array.from({ length: 20 }, (_, i) => ({
        time: `Day ${i + 1}`,
        failureProbability: Math.max(0, 0.05 + (i * 0.01) + Math.random() * 0.1),
        rul: Math.max(0, 500 - i * 15 - Math.random() * 50),
        ttf: Math.max(0, 600 - i * 18 - Math.random() * 60),
        componentHealth: Math.max(40, 100 - i * 2 - Math.random() * 10)
      })),
      riskComponents: [
        { component: 'Bearing', risk: 0.23, rul: 156 },
        { component: 'Motor', risk: 0.08, rul: 445 },
        { component: 'Gearbox', risk: 0.15, rul: 298 },
        { component: 'Hydraulic', risk: 0.05, rul: 567 }
      ]
    });

    // Electrical metrics
    setElectricalMetrics({
      phases: [
        { phase: 'Phase A', voltage: 220.3, current: 17.5, power: 3850 },
        { phase: 'Phase B', voltage: 221.8, current: 16.8, power: 3724 },
        { phase: 'Phase C', voltage: 219.7, current: 17.2, power: 3779 }
      ],
      powerTrend: Array.from({ length: 24 }, (_, i) => ({
        time: `${23 - i}h`,
        power: 3500 + Math.random() * 800,
        voltage: 218 + Math.random() * 8,
        powerFactor: 0.85 + Math.random() * 0.12,
        efficiency: 88 + Math.random() * 8
      })).reverse()
    });

    // Environmental data
    setEnvironmentalData({
      current: {
        ambientTemp: 28.5,
        humidity: 45.2,
        dustLevel: 12.8,
        soundLevel: 68.3,
        lightLevel: 142.5,
        ventilation: 76.8
      },
      trends: Array.from({ length: 24 }, (_, i) => ({
        time: `${23 - i}h`,
        temperature: 25 + Math.random() * 8,
        humidity: 40 + Math.random() * 20,
        dust: 10 + Math.random() * 10,
        sound: 65 + Math.random() * 10
      })).reverse()
    });

    // Connectivity status
    setConnectivityStatus({
      overall: 98.5,
      sensors: [
        { sensor: 'Temperature', status: 'online', latency: 12, packetLoss: 0.1 },
        { sensor: 'Vibration', status: 'online', latency: 8, packetLoss: 0.0 },
        { sensor: 'Pressure', status: 'warning', latency: 45, packetLoss: 2.3 },
        { sensor: 'Flow', status: 'online', latency: 15, packetLoss: 0.2 }
      ],
      networkMetrics: Array.from({ length: 12 }, (_, i) => ({
        time: `${i * 2}h`,
        bandwidth: 85 + Math.random() * 15,
        latency: 10 + Math.random() * 20,
        packetLoss: Math.random() * 3
      }))
    });

    // Alerts
    setAlerts([
      { id: 1, type: 'Critical', message: 'M005 temperature exceeding threshold', timestamp: new Date(Date.now() - 300000), machine: 'M005' },
      { id: 2, type: 'Warning', message: 'M003 vibration levels elevated', timestamp: new Date(Date.now() - 900000), machine: 'M003' },
      { id: 3, type: 'Info', message: 'Maintenance scheduled for M001', timestamp: new Date(Date.now() - 1800000), machine: 'M001' }
    ]);

    // Component health
    setComponentHealth({
      M002: [
        { component: 'Motor', health: 92, trend: 'stable', lastMaintenance: '2024-08-10' },
        { component: 'Bearing', health: 87, trend: 'declining', lastMaintenance: '2024-07-25' },
        { component: 'Gearbox', health: 94, trend: 'improving', lastMaintenance: '2024-08-05' },
        { component: 'Hydraulics', health: 89, trend: 'stable', lastMaintenance: '2024-08-12' },
        { component: 'Cooling', health: 91, trend: 'stable', lastMaintenance: '2024-08-08' }
      ]
    });

    setLoading(false);
  };

  useEffect(() => {
    generateMockData();
    const interval = setInterval(generateMockData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const MetricCard = ({ title, value, unit, icon: Icon, trend, color, bgColor, size = 'normal' }) => (
    <div className={`${bgColor} backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 ${size === 'large' ? 'col-span-2' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl ${color.replace('text-', 'bg-').replace('-600', '-100')} dark:${color.replace('text-', 'bg-').replace('-600', '-900/30')}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        {trend !== undefined && (
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
        <p className={`${size === 'large' ? 'text-3xl' : 'text-2xl'} font-bold text-slate-800 dark:text-white`}>
          {value}{unit && <span className="text-lg text-slate-500 ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  );

  const AlertBadge = ({ alert }) => (
    <div className={`flex items-center space-x-3 p-4 rounded-xl border ${
      alert.type === 'Critical' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
      alert.type === 'Warning' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' :
      'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
    }`}>
      <AlertCircle className={`w-5 h-5 ${
        alert.type === 'Critical' ? 'text-red-500' :
        alert.type === 'Warning' ? 'text-yellow-500' : 'text-blue-500'
      }`} />
      <div className="flex-1">
        <p className="font-medium text-slate-800 dark:text-white text-sm">{alert.message}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{alert.timestamp.toLocaleTimeString()}</p>
      </div>
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        alert.type === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
        alert.type === 'Warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
        'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      }`}>
        {alert.type}
      </span>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-xl text-slate-600 dark:text-slate-400">Loading IoT Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <div className="max-w-8xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center">
                <Factory className="w-8 h-8 mr-3 text-blue-500" />
                IoT Predictive Maintenance Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Real-time machine monitoring and predictive analytics</p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
              >
                <option value="M001">Machine M001</option>
                <option value="M002">Machine M002</option>
                <option value="M003">Machine M003</option>
                <option value="M004">Machine M004</option>
                <option value="M005">Machine M005</option>
              </select>
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Live Data</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {realTimeData.length > 0 && (
            <>
              <MetricCard 
                title="Machine Status" 
                value={realTimeData[0].status}
                icon={Activity} 
                color="text-emerald-600"
                bgColor="bg-white/80 dark:bg-slate-900/80"
              />
              <MetricCard 
                title="Utilization" 
                value={realTimeData[0].utilization?.toFixed(1) || '0.0'}
                unit="%"
                icon={Gauge} 
                color="text-blue-600"
                bgColor="bg-white/80 dark:bg-slate-900/80"
              />
              <MetricCard 
                title="Efficiency" 
                value={realTimeData[0].efficiency?.toFixed(1) || '0.0'}
                unit="%"
                icon={TrendingUp} 
                color="text-purple-600"
                bgColor="bg-white/80 dark:bg-slate-900/80"
              />
              <MetricCard 
                title="Failure Risk" 
                value={(realTimeData[0].failureProbability * 100)?.toFixed(1) || '0.0'}
                unit="%"
                icon={AlertTriangle} 
                color="text-orange-600"
                bgColor="bg-white/80 dark:bg-slate-900/80"
              />
              <MetricCard 
                title="RUL" 
                value={realTimeData[0].rul?.toFixed(0) || '0'}
                unit="hrs"
                icon={Clock} 
                color="text-indigo-600"
                bgColor="bg-white/80 dark:bg-slate-900/80"
              />
              <MetricCard 
                title="TTF" 
                value={realTimeData[0].ttf?.toFixed(0) || '0'}
                unit="hrs"
                icon={Shield} 
                color="text-cyan-600"
                bgColor="bg-white/80 dark:bg-slate-900/80"
              />
            </>
          )}
        </div>

        {/* Machine Health Overview */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
            <Server className="w-5 h-5 mr-2 text-blue-500" />
            Machine Health Overview
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {machineHealthOverview.map((machine, index) => (
              <div key={index} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-800 dark:text-white">{machine.machineId}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    machine.status === 'Excellent' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    machine.status === 'Good' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    machine.status === 'Warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {machine.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Health Score</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{machine.healthScore}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        machine.healthScore >= 90 ? 'bg-emerald-500' :
                        machine.healthScore >= 80 ? 'bg-blue-500' :
                        machine.healthScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${machine.healthScore}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Utilization: {machine.utilization}%</span>
                    <span className="text-slate-600 dark:text-slate-400">Last: {machine.lastMaintenance}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Temperature Trends & Vibration Analysis */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Temperature Monitoring */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
              <Thermometer className="w-5 h-5 mr-2 text-red-500" />
              Temperature Monitoring
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={temperatureTrends.timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Area dataKey="motorTemp" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Motor" />
                  <Line dataKey="bearingTemp" stroke="#f97316" strokeWidth={2} dot={false} name="Bearing" />
                  <Line dataKey="gearboxTemp" stroke="#22c55e" strokeWidth={2} dot={false} name="Gearbox" />
                  <Line dataKey="coolantTemp" stroke="#3b82f6" strokeWidth={2} dot={false} name="Coolant" />
                  <Line dataKey="oilTemp" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Oil" />
                  <Line dataKey="ambientTemp" stroke="#06b6d4" strokeWidth={2} dot={false} name="Ambient" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Vibration Analysis */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-500" />
              Vibration Analysis
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={vibrationAnalysis.radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <PolarRadiusAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Radar name="Current" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
                  <Radar name="Threshold" dataKey="threshold" stroke="#ef4444" fill="none" strokeWidth={2} strokeDasharray="5 5" />
                  <Radar name="Healthy" dataKey="healthy" stroke="#22c55e" fill="none" strokeWidth={1} strokeDasharray="3 3" />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Production Metrics & Electrical Analysis */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Production Metrics */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
              <Factory className="w-5 h-5 mr-2 text-emerald-500" />
              Production Efficiency
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={productionMetrics.efficiency}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="hour" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="efficiency" fill="#10b981" name="Efficiency %" radius={[4, 4, 0, 0]} />
                  <Line dataKey="productionRate" stroke="#3b82f6" strokeWidth={2} name="Production Rate" />
                  <Line dataKey="utilization" stroke="#8b5cf6" strokeWidth={2} name="Utilization %" />
                  <Area dataKey="scrapRate" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} name="Scrap Rate %" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Electrical System Monitoring */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-500" />
              Electrical System Analysis
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {electricalMetrics.phases && electricalMetrics.phases.map((phase, index) => (
                <div key={index} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <h4 className="font-semibold text-slate-800 dark:text-white text-sm mb-2">{phase.phase}</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Voltage</span>
                      <span className="font-medium text-slate-800 dark:text-white">{phase.voltage}V</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Current</span>
                      <span className="font-medium text-slate-800 dark:text-white">{phase.current}A</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Power</span>
                      <span className="font-medium text-slate-800 dark:text-white">{phase.power}W</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={electricalMetrics.powerTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip />
                  <Line dataKey="power" stroke="#f59e0b" strokeWidth={2} name="Power (W)" />
                  <Line dataKey="efficiency" stroke="#10b981" strokeWidth={2} name="Efficiency %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Predictive Analytics & Component Health */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Failure Predictions */}
          <div className="xl:col-span-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-purple-500" />
              Predictive Analytics
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={failurePredictions.predictions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Area dataKey="rul" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="RUL (hrs)" />
                  <Line dataKey="ttf" stroke="#06b6d4" strokeWidth={3} dot={false} name="TTF (hrs)" />
                  <Bar dataKey="failureProbability" fill="#f59e0b" radius={[2, 2, 0, 0]} name="Failure Probability" />
                  <Line dataKey="componentHealth" stroke="#10b981" strokeWidth={2} dot={false} name="Health Score" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Component Health Scores */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-emerald-500" />
              Component Health
            </h3>
            <div className="space-y-4">
              {componentHealth[selectedMachine] && componentHealth[selectedMachine].map((component, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{component.component}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-semibold ${
                        component.health >= 90 ? 'text-emerald-500' :
                        component.health >= 80 ? 'text-blue-500' :
                        component.health >= 70 ? 'text-yellow-500' : 'text-red-500'
                      }`}>{component.health}%</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        component.trend === 'improving' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        component.trend === 'stable' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {component.trend}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        component.health >= 90 ? 'bg-emerald-500' :
                        component.health >= 80 ? 'bg-blue-500' :
                        component.health >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${component.health}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Last maintenance: {component.lastMaintenance}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Environmental Monitoring & Network Status */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Environmental Conditions */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
              <Droplets className="w-5 h-5 mr-2 text-cyan-500" />
              Environmental Monitoring
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Temperature</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{environmentalData.current?.ambientTemp}°C</span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Humidity</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{environmentalData.current?.humidity}%</span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Dust Level</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{environmentalData.current?.dustLevel} μg/m³</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Sound Level</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{environmentalData.current?.soundLevel} dB</span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Light Level</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{environmentalData.current?.lightLevel} lux</span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Ventilation</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{environmentalData.current?.ventilation}%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={environmentalData.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip />
                  <Area dataKey="temperature" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Temperature" />
                  <Area dataKey="humidity" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Humidity" />
                  <Line dataKey="dust" stroke="#f59e0b" strokeWidth={2} name="Dust Level" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Network Connectivity Status */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
              <Radio className="w-5 h-5 mr-2 text-green-500" />
              Network Connectivity
            </h3>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Overall Status</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{connectivityStatus.overall}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                <div 
                  className="h-3 rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${connectivityStatus.overall}%` }}
                />
              </div>
            </div>
            <div className="space-y-3 mb-4">
              {connectivityStatus.sensors && connectivityStatus.sensors.map((sensor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {sensor.status === 'online' ? 
                      <Wifi className="w-4 h-4 text-emerald-500" /> : 
                      <WifiOff className="w-4 h-4 text-red-500" />
                    }
                    <span className="font-medium text-slate-800 dark:text-white">{sensor.sensor}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-800 dark:text-white">{sensor.latency}ms</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{sensor.packetLoss}% loss</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={connectivityStatus.networkMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip />
                  <Line dataKey="latency" stroke="#f59e0b" strokeWidth={2} name="Latency (ms)" />
                  <Line dataKey="bandwidth" stroke="#10b981" strokeWidth={2} name="Bandwidth %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Vibration Trends & Risk Assessment */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Vibration Time Series */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-500" />
              Vibration Trends (Real-time)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vibrationAnalysis.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line dataKey="x" stroke="#ef4444" strokeWidth={2} dot={false} name="X-Axis" />
                  <Line dataKey="y" stroke="#3b82f6" strokeWidth={2} dot={false} name="Y-Axis" />
                  <Line dataKey="z" stroke="#10b981" strokeWidth={2} dot={false} name="Z-Axis" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
              Component Risk Assessment
            </h3>
            <div className="space-y-4 mb-6">
              {failurePredictions.riskComponents && failurePredictions.riskComponents.map((component, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{component.component}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-semibold ${
                        component.risk < 0.1 ? 'text-emerald-500' :
                        component.risk < 0.2 ? 'text-yellow-500' : 'text-red-500'
                      }`}>{(component.risk * 100).toFixed(1)}%</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{component.rul}h</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        component.risk < 0.1 ? 'bg-emerald-500' :
                        component.risk < 0.2 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${component.risk * 500}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={failurePredictions.riskComponents}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="risk"
                  >
                    {failurePredictions.riskComponents && failurePredictions.riskComponents.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.risk < 0.1 ? '#10b981' :
                        entry.risk < 0.2 ? '#f59e0b' : '#ef4444'
                      } />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Risk Level']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
            Recent Alerts & Notifications
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {alerts.map((alert, index) => (
              <AlertBadge key={index} alert={alert} />
            ))}
          </div>
        </div>

        {/* Production Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard 
            title="Total Produced" 
            value={productionMetrics.summary?.totalProduced || 0}
            icon={Factory} 
            color="text-emerald-600"
            bgColor="bg-white/80 dark:bg-slate-900/80"
          />
          <MetricCard 
            title="Scrap Count" 
            value={productionMetrics.summary?.scrapCount || 0}
            icon={AlertTriangle} 
            color="text-orange-600"
            bgColor="bg-white/80 dark:bg-slate-900/80"
          />
          <MetricCard 
            title="Defective Units" 
            value={productionMetrics.summary?.defectiveCount || 0}
            icon={Settings} 
            color="text-red-600"
            bgColor="bg-white/80 dark:bg-slate-900/80"
          />
          <MetricCard 
            title="Avg Efficiency" 
            value={productionMetrics.summary?.avgEfficiency?.toFixed(1) || '0.0'}
            unit="%"
            icon={TrendingUp} 
            color="text-blue-600"
            bgColor="bg-white/80 dark:bg-slate-900/80"
          />
          <MetricCard 
            title="Avg Utilization" 
            value={productionMetrics.summary?.avgUtilization?.toFixed(1) || '0.0'}
            unit="%"
            icon={Gauge} 
            color="text-purple-600"
            bgColor="bg-white/80 dark:bg-slate-900/80"
          />
        </div>

      </div>
    </div>
  );
}

export default Dashboard;