import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ComposedChart, Legend
} from 'recharts';
import {
  Activity, AlertTriangle, Battery, Cpu, Gauge,
  Thermometer, Zap, Settings, TrendingUp, TrendingDown, Cog,
  Clock, Shield, Wrench, Eye, Radio, Droplets, RefreshCw,
  Wifi, WifiOff, Server, Database, Factory, AlertCircle,
  Monitor, Power, BarChart3, Users, Calendar, PieChart as PieChartIcon
} from 'lucide-react';
import { format, subHours, subDays } from 'date-fns';

// API Configuration
const API_BASE_URL = 'http://localhost:5455/api/sensors';

// API Service Functions
const apiService = {

  getFailureCountByMachine: async (start, end) => {
    try {
      const response = await fetch(`${API_BASE_URL}/failure-count?start=${start}&end=${end}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return generateMockFailureCount();
    }
  },

  getMLMetrics: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ml-metrics`);
      const data = await response.json();
      console.log('ML Metrics API Response:', data);
      return data
    } catch (error) {
      console.error('API Error:', error);
      return generateMockMLMetrics();
    }
  },

  // Electrical Metrics
  getElectricalMetrics: async (machineId, start, end) => {
    try {
      const response = await fetch(`${API_BASE_URL}/electrical-metrics/${machineId}?start=${start}&end=${end}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return generateMockElectricalMetrics();
    }
  },

  // Dashboard Summary
  getDashboardSummary: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard-summary`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },

  // Machine Health Overview
  getMachineHealthOverview: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health-overview`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  },



  // Failure Readings (Critical for your requirement)
  getFailureReadings: async (limit = 10) => {
    try {
      const response = await fetch(`${API_BASE_URL}/failures?limit=${limit}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  },

  // High Risk Machines

  getHighRiskMachines: async (limit = 10) => {
    try {
      const response = await fetch(`${API_BASE_URL}/high-risk-machines?limit=${limit}`);
      const data = await response.json();

      // Transform the data to match the new field names if needed
      return data.map(machine => ({
        machineId: machine.machineId,
        timestamp: machine.timestamp,        // Changed from lastUpdate
        failureProbability: machine.failureProbability, // Changed from maxFailureProbability
        rul: machine.rul                     // Changed from minRul
      }));
    } catch (error) {
      console.error('API Error:', error);
      return generateMockHighRisk();
    }
  },

  // Time Series Data for Charts
  getTimeSeriesData: async (machineId, start, end) => {
    try {
      const response = await fetch(`${API_BASE_URL}/time-series/${machineId}?start=${start}&end=${end}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  },

  // Production Metrics
  getProductionMetrics: async (start, end) => {
    try {
      const startParam = start ? `start=${start}` : '';
      const endParam = end ? `end=${end}` : '';
      const params = [startParam, endParam].filter(p => p).join('&');
      const response = await fetch(`${API_BASE_URL}/production-metrics${params ? '?' + params : ''}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return {};
    }
  },

  // Alerts
  getAlerts: async (limit = 20) => {
    try {
      const response = await fetch(`${API_BASE_URL}/alerts?limit=${limit}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  },

  // Available Machines
  getAvailableMachines: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/machines`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  },

  // Vibration Analysis
  getVibrationAnalysis: async (machineId, start, end) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vibration-analysis/${machineId}?start=${start}&end=${end}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return {};
    }
  },

  // Temperature Trends
  getTemperatureTrends: async (machineId, start, end) => {
    try {
      const response = await fetch(`${API_BASE_URL}/temperature-trends/${machineId}?start=${start}&end=${end}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return {};
    }
  }
};

function Dashboard() {
  // State Management
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [machineHealthData, setMachineHealthData] = useState([]);
  const [failureReadings, setFailureReadings] = useState([]);
  const [highRiskMachines, setHighRiskMachines] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [productionMetrics, setProductionMetrics] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [availableMachines, setAvailableMachines] = useState([]);
  const [vibrationData, setVibrationData] = useState({});
  const [temperatureData, setTemperatureData] = useState({});

  const [selectedMachine, setSelectedMachine] = useState('M002');
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [electricalData, setElectricalData] = useState({});
  const [mlMetrics, setMLMetrics] = useState({});
  const [failureCountData, setFailureCountData] = useState([]);



  const getDateRange = (range) => {
    const end = new Date();
    let start;

    switch (range) {
      case '1h':
        start = subHours(end, 1);
        break;
      case '24h':
        start = subHours(end, 24);
        break;
      case '7d':
        start = subDays(end, 7);
        break;
      case '30d':
        start = subDays(end, 30);
        break;
      default:
        start = subHours(end, 24);
    }

    return {
      start: format(start, "yyyy-MM-dd'T'HH:mm:ss"),
      end: format(end, "yyyy-MM-dd'T'HH:mm:ss")
    };
  };

  // Fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Get date range
      const { start, end } = getDateRange(timeRange);



      // Fetch all data concurrently
      const [
        summary,
        machineHealth,
        failures,
        highRisk,
        timeSeries,
        production,
        alertsData,
        machines,
        vibration,
        temperature,
        electricalMetrics,
        mlMetricsData,
        failureCount
      ] = await Promise.all([
        apiService.getDashboardSummary(),
        apiService.getMachineHealthOverview(),
        apiService.getFailureReadings(20),
        apiService.getHighRiskMachines(10),
        apiService.getTimeSeriesData(selectedMachine, start, end),
        apiService.getProductionMetrics(start, end),
        apiService.getAlerts(30),
        apiService.getAvailableMachines(),
        apiService.getVibrationAnalysis(selectedMachine, start, end),
        apiService.getTemperatureTrends(selectedMachine, start, end),
        apiService.getElectricalMetrics(selectedMachine, start, end),
        apiService.getMLMetrics(),
        apiService.getFailureCountByMachine(start, end)
      ]);

      // Update state with real data or fallback to mock data
      setDashboardSummary(summary || generateMockSummary());
      setMachineHealthData(machineHealth || generateMockMachineHealth());
      setFailureReadings(failures || []);
      setHighRiskMachines(highRisk || generateMockHighRisk());
      setTimeSeriesData(timeSeries || generateMockTimeSeries());
      setProductionMetrics(production || generateMockProduction());
      setAlerts(alertsData || generateMockAlerts());
      setAvailableMachines(machines || ['M001', 'M002', 'M003', 'M004']);
      setVibrationData(vibration || generateMockVibration());
      setTemperatureData(temperature || generateMockTemperature());
      setElectricalData(electricalMetrics || generateMockElectricalMetrics());
      setMLMetrics(mlMetricsData || generateMockMLMetrics());
      setFailureCountData(failureCount || generateMockFailureCount());

      setLastUpdate(new Date());
      setError(null);
      console.log('Production Metrics Response:', production);
      console.log('start:', start, 'end:', end);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data from API');
      // Load mock data as fallback
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  // Mock data generators (fallback when API is not available)
  const generateMockSummary = () => ({
    overallStats: {
      totalReadings: 1547832,
      uniqueMachines: 5,
      totalFailures: 23,
      avgFailureProbability: 0.08,
      avgHealthScore: 87.3
    },
    highRiskMachines: generateMockHighRisk(),
    recentAlerts: generateMockAlerts(),
    productionMetrics: generateMockProduction(),
    lastUpdated: new Date().toISOString()
  });

  const generateMockMachineHealth = () => [
    { machineId: 'M001', avgHealthScore: 85.2, maxFailureProbability: 0.15, minRul: 245, readingCount: 8760, lastUpdate: new Date(Date.now() - 300000).toISOString() },
    { machineId: 'M002', avgHealthScore: 92.1, maxFailureProbability: 0.08, minRul: 298, readingCount: 8761, lastUpdate: new Date(Date.now() - 180000).toISOString() },
    { machineId: 'M003', avgHealthScore: 78.9, maxFailureProbability: 0.23, minRul: 156, readingCount: 8759, lastUpdate: new Date(Date.now() - 420000).toISOString() },
    { machineId: 'M004', avgHealthScore: 94.7, maxFailureProbability: 0.05, minRul: 445, readingCount: 8762, lastUpdate: new Date(Date.now() - 120000).toISOString() },
    { machineId: 'M005', avgHealthScore: 69.3, maxFailureProbability: 0.35, minRul: 89, readingCount: 8758, lastUpdate: new Date(Date.now() - 600000).toISOString() }
  ];

  // Update your mock data to match the new field names
  const generateMockHighRisk = () => [
    {
      machineId: "M005",
      failureProbability: 0.35,    // Changed from maxFailureProbability
      rul: 89,                     // Changed from minRul
      timestamp: new Date(Date.now() - 600000).toISOString() // Changed from lastUpdate
    },
    {
      machineId: "M003",
      failureProbability: 0.23,    // Changed
      rul: 156,                    // Changed
      timestamp: new Date(Date.now() - 420000).toISOString() // Changed
    },
    {
      machineId: "M001",
      failureProbability: 0.15,    // Changed
      rul: 245,                    // Changed
      timestamp: new Date(Date.now() - 300000).toISOString() // Changed
    }
  ];

  const generateMockTimeSeries = () => {
    const now = new Date();
    return Array.from({ length: 48 }, (_, i) => {
      const timestamp = new Date(now.getTime() - (47 - i) * 30 * 60 * 1000); // 30-minute intervals
      return {
        timestamp: timestamp.toISOString(),
        vibrationX: 1.0 + 0.3 * Math.sin(i * 0.1) + Math.random() * 0.2,
        vibrationY: 0.8 + 0.2 * Math.cos(i * 0.12) + Math.random() * 0.15,
        vibrationZ: 1.1 + 0.25 * Math.sin(i * 0.08) + Math.random() * 0.18,
        motorTemperature: 65 + 10 * Math.sin(i * 0.05) + Math.random() * 8,
        bearingTemperature: 55 + 12 * Math.cos(i * 0.07) + Math.random() * 6,
        powerConsumption: 220 + 50 * Math.sin(i * 0.06) + Math.random() * 20,
        failureProbability: Math.max(0, 0.05 + 0.15 * Math.sin(i * 0.03) + Math.random() * 0.1)
      };
    });
  };

  const generateMockProduction = () => ({
    avgProductionRate: 24.7,
    totalDefects: 45,
    avgScrapRate: 2.3,
    avgUtilization: 82.4,
    avgEnergyEfficiency: 89.1,
    activeMachines: 5,
    totalCycleTime: 1547.8
  });

  const generateMockAlerts = () => [
    { timestamp: new Date(Date.now() - 180000).toISOString(), machineId: 'M005', machineType: 'CNC', failureType: 'Temperature', alertType: 'Critical', probability: 0.89, failureOccurred: 0, healthScore: 69.3 },
    { timestamp: new Date(Date.now() - 420000).toISOString(), machineId: 'M003', machineType: 'Lathe', failureType: null, alertType: 'Warning', probability: 0.67, failureOccurred: 0, healthScore: 78.9 },
    { timestamp: new Date(Date.now() - 720000).toISOString(), machineId: 'M001', machineType: 'CNC', failureType: 'Vibration', alertType: 'Critical', probability: 0.78, failureOccurred: 1, healthScore: 85.2 }
  ];

  const generateMockVibration = () => ({
    avgVibrationX: 1.12,
    avgVibrationY: 0.89,
    avgVibrationZ: 1.05,
    maxVibration: 4.32,
    minVibration: 0.45,
    stdDevX: 0.23,
    stdDevY: 0.18,
    stdDevZ: 0.21,
    readingCount: 1440
  });

  const generateMockTemperature = () => ({
    avgBearingTemp: 58.7,
    avgMotorTemp: 71.2,
    avgGearboxTemp: 48.9,
    avgOilTemp: 62.3,
    maxMotorTemp: 89.5,
    minBearingTemp: 45.1,
    readingCount: 1440,
    overheatCount: 3
  });

  const generateMockMLMetrics = () => ({
    avgPredictionLatency: 45,
    maxPredictionLatency: 120,
    minPredictionLatency: 12,
    modelVersion: "v2.1.5",
    totalPredictions: 1547832
  });

  const generateMockFailureCount = () => [
    { machineId: 'M005', failureCount: 12 },
    { machineId: 'M003', failureCount: 8 },
    { machineId: 'M001', failureCount: 5 },
    { machineId: 'M002', failureCount: 3 },
    { machineId: 'M004', failureCount: 2 }
  ];

  // Mock data generator
  const generateMockElectricalMetrics = () => ({
    avgVoltageA: 220 + Math.random() * 10,
    avgVoltageB: 220 + Math.random() * 8,
    avgVoltageC: 220 + Math.random() * 12,
    avgCurrentA: 15 + Math.random() * 5,
    avgCurrentB: 16 + Math.random() * 4,
    avgCurrentC: 14 + Math.random() * 6,
    avgPowerFactor: 0.85 + Math.random() * 0.1,
    avgPowerConsumption: 3500 + Math.random() * 1000,
    avgEnergyEfficiency: 88 + Math.random() * 5,
    maxVoltageA: 235,
    maxVoltageB: 232,
    maxVoltageC: 238,
    maxCurrentA: 25,
    maxCurrentB: 24,
    maxCurrentC: 23,
    maxPowerConsumption: 4500,
    minVoltageA: 215,
    minVoltageB: 218,
    minVoltageC: 212,
    minPowerFactor: 0.78,
    readingCount: 1440
  });

  const loadMockData = () => {
    setDashboardSummary(generateMockSummary());
    setMachineHealthData(generateMockMachineHealth());
    setFailureReadings([]);
    setHighRiskMachines(generateMockHighRisk());
    setTimeSeriesData(generateMockTimeSeries());
    setProductionMetrics(generateMockProduction());
    setAlerts(generateMockAlerts());
    setAvailableMachines(['M001', 'M002', 'M003', 'M004']);
    setVibrationData(generateMockVibration());
    setTemperatureData(generateMockTemperature());
  };

  // Effects
  useEffect(() => {
    fetchAllData();
  }, [selectedMachine, timeRange]);

  useEffect(() => {
    const interval = setInterval(fetchAllData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [selectedMachine, timeRange]);

  // UI Components
  const MetricCard = ({ title, value, unit, icon: Icon, trend, color, bgColor, size = 'normal', subtitle }) => (
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
          {typeof value === 'number' ? value.toLocaleString() : value}
          {unit && <span className="text-lg text-slate-500 ml-1">{unit}</span>}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );

  const AlertBadge = ({ alert }) => {
    const alertType = alert.alertType || 'Info';
    const isFailure = alert.failureOccurred === 1;

    return (
      <div className={`flex items-center space-x-3 p-4 rounded-xl border ${isFailure || alertType === 'Critical' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
        alertType === 'Warning' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' :
          'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
        }`}>
        <AlertCircle className={`w-5 h-5 ${isFailure || alertType === 'Critical' ? 'text-red-500' :
          alertType === 'Warning' ? 'text-yellow-500' : 'text-blue-500'
          }`} />
        <div className="flex-1">
          <p className="font-medium text-slate-800 dark:text-white text-sm">
            {isFailure ? `FAILURE OCCURRED: ${alert.machineId}` : `${alert.machineId} - ${alert.failureType || 'Alert'}`}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {new Date(alert.timestamp).toLocaleString()} | Risk: {((alert.probability || 0) * 100).toFixed(1)}%
          </p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${isFailure || alertType === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
          alertType === 'Warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
            'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
          }`}>
          {isFailure ? 'FAILURE' : alertType}
        </span>
      </div>
    );
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-xl text-slate-600 dark:text-slate-400">Loading Predictive Maintenance Dashboard...</p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Connecting to IoT sensors and ML models...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <div className="max-w-8xl mx-auto space-y-6">

        {/* Enhanced Header */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center">
                <Factory className="w-8 h-8 mr-3 text-blue-500" />
                Predictive Maintenance Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Real-time IoT monitoring with ML-powered failure prediction | Last update: {lastUpdate.toLocaleTimeString()}
              </p>
              {error && (
                <p className="text-red-500 text-sm mt-1">⚠️ API Connection Issues - Using cached data</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
              >
                {availableMachines.map(machine => (
                  <option key={machine} value={machine}>Machine {machine}</option>
                ))}
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

        {/* Critical Status Overview */}
        {dashboardSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <MetricCard
              title="Total Machines"
              value={dashboardSummary.overallStats?.uniqueMachines || 0}
              icon={Server}
              color="text-blue-600"
              bgColor="bg-white/80 dark:bg-slate-900/80"
            />
            <MetricCard
              title="Total Pridected Failures"
              value={dashboardSummary.overallStats?.totalFailures || 0}
              icon={AlertTriangle}
              color="text-red-600"
              bgColor="bg-white/80 dark:bg-slate-900/80"
              subtitle="Recorded incidents"
            />
            <MetricCard
              title="Avg Health Score"
              value={dashboardSummary.overallStats?.avgHealthScore?.toFixed(1) || '0.0'}
              unit="%"
              icon={Shield}
              color="text-emerald-600"
              bgColor="bg-white/80 dark:bg-slate-900/80"
            />
            <MetricCard
              title="Avg Failure Risk"
              value={(dashboardSummary.overallStats?.avgFailureProbability * 100)?.toFixed(1) || '0.0'}
              unit="%"
              icon={Eye}
              color="text-orange-600"
              bgColor="bg-white/80 dark:bg-slate-900/80"
            />
            <MetricCard
              title="Data Points"
              value={dashboardSummary.overallStats?.totalReadings || 0}
              icon={Database}
              color="text-purple-600"
              bgColor="bg-white/80 dark:bg-slate-900/80"
              subtitle="Total Records"
            />
            <MetricCard
              title="Avg Utilization Rate"
              value={(dashboardSummary.overallStats?.avgUtilization)?.toFixed(1) || '0.0'}
              unit="%"
              icon={Cog}
              color="text-blue-600"
              bgColor="bg-white/80 dark:bg-slate-900/80"
            />
          </div>
        )}

        {/* High Risk Machines Alert */}
        {highRiskMachines.length > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-4 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2" />
              High Risk Machines - Immediate Attention Required
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {highRiskMachines.slice(0, 3).map((machine, index) => (
                <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-red-200 dark:border-red-700">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 dark:text-white">{machine.machineId}</h4>
                    <span className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
                      HIGH RISK
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Failure Risk</span>
                      <span className="font-bold text-red-600">
                        {((machine.failureProbability || 0) * 100).toFixed(1)}% {/* Changed from maxFailureProbability */}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">RUL</span>
                      <span className="font-bold text-orange-600">
                        {(machine.rul || 0).toFixed(2)}h {/* Changed from minRul */}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      timestamp :{" "}
                      {new Date(machine.timestamp).toLocaleString([], { /* Changed from lastUpdate */
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Machine Health Overview */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
            <Monitor className="w-5 h-5 mr-2 text-blue-500" />
            Machine Health Overview
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {machineHealthData.map((machine, index) => {
              const riskLevel = machine.avgFailureProbability > 0.3 ? 'HIGH' :
                machine.avgFailureProbability > 0.15 ? 'MEDIUM' : 'LOW';
              const riskColor = riskLevel === 'HIGH' ? 'red' : riskLevel === 'MEDIUM' ? 'yellow' : 'green';

              return (
                <div key={index} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-800 dark:text-white">{machine.machineId}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${riskLevel === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                      {riskLevel} RISK
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Health Score</span>
                      <span className="font-semibold text-slate-800 dark:text-white">{machine.avgHealthScore?.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${machine.avgHealthScore >= 90 ? 'bg-emerald-500' :
                          machine.avgHealthScore >= 80 ? 'bg-blue-500' :
                            machine.avgHealthScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        style={{ width: `${machine.avgHealthScore}%` }}
                      />
                    </div>
                    <div className="flex justify-between  text-sm ">
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Failure Risk:</span>
                        <span className={`ml-1 font-medium ${riskColor === 'red' ? 'text-red-600' : riskColor === 'yellow' ? 'text-yellow-600' : 'text-green-600'}`}>
                          {((machine.avgFailureProbability || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">RUL:</span>
                        <span className="ml-1 font-medium text-slate-800 dark:text-white">{(machine.avgRul).toFixed(2)}h</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {machine.readingCount} readings | Last:{" "}{new Date(machine.lastUpdate).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true // remove if you want AM/PM
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time Sensor Data Visualization */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Time Series Chart */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
              Real-time Sensor Metrics - {selectedMachine}
            </h3>
            <div className="h-100">
              <ResponsiveContainer width="100%" height="110%">
                <ComposedChart data={timeSeriesData.slice(-24)}> {/* Show last 24 data points */}
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                  <XAxis
                    dataKey="timestamp"
                    stroke="#64748b"
                    fontSize={10}
                    tickFormatter={formatTimestamp}
                  />
                  <YAxis yAxisId="left" stroke="#64748b" fontSize={10} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} />
                  <Tooltip
                    labelFormatter={(label) => `Time: ${formatTimestamp(label)}`}
                    formatter={(value, name) => [Number(value).toFixed(3), name]}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="powerConsumption" fill="#10b981" opacity={0.6} name="Power" />
                  <Area yAxisId="right" dataKey="failureProbability" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} name="Failure Risk" />
                  <Line yAxisId="left" dataKey="energyEfficiency" stroke="#f59e0b" strokeWidth={2} dot={false} name="Energy Efficiency" />

                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Vibration Analysis */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-purple-500" />
              Vibration Analysis - {selectedMachine}
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Average X-Axis</div>
                  <div className="text-lg font-bold text-slate-800 dark:text-white">{vibrationData.avgVibrationX?.toFixed(3)} g</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Average Y-Axis</div>
                  <div className="text-lg font-bold text-slate-800 dark:text-white">{vibrationData.avgVibrationY?.toFixed(3)} g</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Average Z-Axis</div>
                  <div className="text-lg font-bold text-slate-800 dark:text-white">{vibrationData.avgVibrationZ?.toFixed(3)} g</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Peak Vibration (Current reading)</div>
                  <div className="text-lg font-bold text-orange-600">
                    {timeSeriesData[timeSeriesData.length - 1]?.peakVibration?.toFixed(3) || 'N/A'} g
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">RMS Vibration (Current reading)</div>
                  <div className="text-lg font-bold text-emerald-600">
                    {timeSeriesData[timeSeriesData.length - 1]?.rmsVibration?.toFixed(3) || 'N/A'} g
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Data Points</div>
                  <div className="text-lg font-bold text-slate-800 dark:text-white">{vibrationData.readingCount}</div>
                </div>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData.slice(-20)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="timestamp" stroke="#64748b" fontSize={10} tickFormatter={formatTimestamp} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip
                    labelFormatter={(label) => `Time: ${formatTimestamp(label)}`}
                    formatter={(value, name) => [Number(value).toFixed(3), name]}
                  />
                  <Legend />
                  <Line dataKey="vibrationX" stroke="#ef4444" strokeWidth={2} name="X-Axis" />
                  <Line dataKey="vibrationY" stroke="#3b82f6" strokeWidth={2} name="Y-Axis" />
                  <Line dataKey="vibrationZ" stroke="#10b981" strokeWidth={2} name="Z-Axis" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Temperature Monitoring & Production Metrics */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Temperature Analysis */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
              <Thermometer className="w-5 h-5 mr-2 text-red-500" />
              Temperature Analysis - {selectedMachine}
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Motor Temperature</div>
                    <Thermometer className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="text-2xl font-bold text-red-600">{temperatureData.avgMotorTemp?.toFixed(1)}°C</div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>Min: {temperatureData.minMotorTemp?.toFixed(1)}°C</span>
                    <span>Max: {temperatureData.maxMotorTemp?.toFixed(1)}°C</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Bearing Temperature</div>
                    <Settings className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold text-orange-600">{temperatureData.avgBearingTemp?.toFixed(1)}°C</div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>Min: {temperatureData.minBearingTemp?.toFixed(1)}°C</span>
                    <span>Max: {temperatureData.maxBearingTemp?.toFixed(1)}°C</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Gearbox Temperature</div>
                    <Cpu className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{temperatureData.avgGearboxTemp?.toFixed(1)}°C</div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>Min: {temperatureData.minGearboxTemp?.toFixed(1)}°C</span>
                    <span>Max: {temperatureData.maxGearboxTemp?.toFixed(1)}°C</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Oil Temperature</div>
                    <Droplets className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{temperatureData.avgOilTemp?.toFixed(1)}°C</div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>Min: {temperatureData.minOilTemp?.toFixed(1)}°C</span>
                    <span>Max: {temperatureData.maxOilTemp?.toFixed(1)}°C</span>
                  </div>
                </div>
              </div>
            </div>
            {/*{temperatureData.overheatCount > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    {temperatureData.overheatCount} overheating events detected in this period
                  </span>
                </div>
              </div>
            )}*/}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData.slice(-20)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="timestamp" stroke="#64748b" fontSize={10} tickFormatter={formatTimestamp} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip labelFormatter={(label) => `Time: ${formatTimestamp(label)}`}
                    formatter={(value, name) => [Number(value).toFixed(3), name]}
                  />
                  <Legend />
                  <Line dataKey="motorTemperature" stroke="#ef4444" strokeWidth={2} name="Motor" />
                  <Line dataKey="bearingTemperature" stroke="#f59e0b" strokeWidth={2} name="Bearing" />
                  <Line dataKey="gearboxTemperature" stroke="#239c21" strokeWidth={2} name="gearbox" />
                  <Line dataKey="oilTemperature" stroke="#1d66cc" strokeWidth={2} name="oil" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Production Metrics */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
              <Factory className="w-5 h-5 mr-2 text-emerald-500" />
              Production Performance Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Production Rate</div>
                  <div className="text-lg font-bold text-emerald-600">{productionMetrics.avgProductionRate?.toFixed(1)} units/hr</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Energy Efficiency</div>
                  <div className="text-lg font-bold text-blue-600">{productionMetrics.avgEnergyEfficiency?.toFixed(1)}%</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Active Machines</div>
                  <div className="text-lg font-bold text-purple-600">{productionMetrics.activeMachines}</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Defects</div>
                  <div className="text-lg font-bold text-red-600">{(productionMetrics.totalDefects).toFixed(2)}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Scrap Rate</div>
                  <div className="text-lg font-bold text-orange-600">{productionMetrics.avgScrapRate?.toFixed(1)}%</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Utilization</div>
                  <div className="text-lg font-bold text-cyan-600">{productionMetrics.avgUtilization?.toFixed(1)}%</div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">Overall Efficiency</span>
                <span className="font-semibold text-slate-800 dark:text-white">{productionMetrics.avgEnergyEfficiency?.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
                  style={{ width: `${productionMetrics.avgEnergyEfficiency || 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-slate-600 dark:text-slate-400">Machine Utilization</span>
                <span className="font-semibold text-slate-800 dark:text-white">{productionMetrics.avgUtilization?.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                  style={{ width: `${productionMetrics.avgUtilization || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-500" />
            Electrical System Metrics - {selectedMachine}
          </h3>

          {/* Voltage Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Phase A Voltage</div>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              <div className="text-2xl font-bold text-blue-600">{electricalData.avgVoltageA?.toFixed(1)}V</div>
              <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 mt-1">
                <span>Min: {electricalData.minVoltageA?.toFixed(1)}V</span>
                <span>Max: {electricalData.maxVoltageA?.toFixed(1)}V</span>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-green-700 dark:text-green-300">Phase B Voltage</div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-2xl font-bold text-green-600">{electricalData.avgVoltageB?.toFixed(1)}V</div>
              <div className="flex justify-between text-xs text-green-600 dark:text-green-400 mt-1">
                <span>Min: {electricalData.minVoltageB?.toFixed(1)}V</span>
                <span>Max: {electricalData.maxVoltageB?.toFixed(1)}V</span>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-purple-700 dark:text-purple-300">Phase C Voltage</div>
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              </div>
              <div className="text-2xl font-bold text-purple-600">{electricalData.avgVoltageC?.toFixed(1)}V</div>
              <div className="flex justify-between text-xs text-purple-600 dark:text-purple-400 mt-1">
                <span>Min: {electricalData.minVoltageC?.toFixed(1)}V</span>
                <span>Max: {electricalData.maxVoltageC?.toFixed(1)}V</span>
              </div>
            </div>
          </div>

          {/* Current Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-orange-700 dark:text-orange-300">Phase A Current</div>
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              </div>
              <div className="text-2xl font-bold text-orange-600">{electricalData.avgCurrentA?.toFixed(1)}A</div>
              <div className="flex justify-between text-xs text-orange-600 dark:text-orange-400 mt-1">
                <span>Min: {electricalData.minCurrentA?.toFixed(1)}A</span>
                <span>Max: {electricalData.maxCurrentA?.toFixed(1)}A</span>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-red-700 dark:text-red-300">Phase B Current</div>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              <div className="text-2xl font-bold text-red-600">{electricalData.avgCurrentB?.toFixed(1)}A</div>
              <div className="flex justify-between text-xs text-red-600 dark:text-red-400 mt-1">
                <span>Min: {electricalData.minCurrentB?.toFixed(1)}A</span>
                <span>Max: {electricalData.maxCurrentB?.toFixed(1)}A</span>
              </div>
            </div>

            <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4 border border-pink-200 dark:border-pink-700">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-pink-700 dark:text-pink-300">Phase C Current</div>
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              </div>
              <div className="text-2xl font-bold text-pink-600">{electricalData.avgCurrentC?.toFixed(1)}A</div>
              <div className="flex justify-between text-xs text-pink-600 dark:text-pink-400 mt-1">
                <span>Min: {electricalData.minCurrentC?.toFixed(1)}A</span>
                <span>Max: {electricalData.maxCurrentC?.toFixed(1)}A</span>
              </div>
            </div>
          </div>

          {/* Power Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4 border border-cyan-200 dark:border-cyan-700">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Power Factor</div>
                <Activity className="w-4 h-4 text-cyan-500" />
              </div>
              <div className="text-2xl font-bold text-cyan-600">{electricalData.avgPowerFactor?.toFixed(3)}</div>
              <div className="flex justify-between text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                <span>Min: {electricalData.minPowerFactor?.toFixed(3)}</span>
                <span>Ideal: 1.0</span>
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-700">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Power Consumption</div>
                <Zap className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-emerald-600">{electricalData.avgPowerConsumption?.toFixed(0)}W</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                Peak: {electricalData.maxPowerConsumption?.toFixed(0)}W
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-amber-700 dark:text-amber-300">Energy Efficiency</div>
                <TrendingUp className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-amber-600">{electricalData.avgEnergyEfficiency?.toFixed(1)}%</div>
              <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Target: ≥90%
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${electricalData.avgPowerFactor > 0.9 ? 'bg-green-500' :
                electricalData.avgPowerFactor > 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Power Factor: {electricalData.avgPowerFactor > 0.9 ? 'Excellent' :
                  electricalData.avgPowerFactor > 0.8 ? 'Good' : 'Needs Improvement'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${electricalData.avgEnergyEfficiency > 80 ? 'bg-green-500' :
                electricalData.avgEnergyEfficiency > 70 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Efficiency: {electricalData.avgEnergyEfficiency > 80 ? 'High' :
                  electricalData.avgEnergyEfficiency > 70 ? 'Moderate' : 'Low'}
              </span>
            </div>
          </div>
          {/* Bar Chart for Voltage and Current */}


          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    name: 'Phase A',
                    voltage: electricalData.avgVoltageA.toFixed(2),
                    current: electricalData.avgCurrentA.toFixed(2),
                    maxVoltage: electricalData.maxVoltageA.toFixed(2),
                    maxCurrent: electricalData.maxCurrentA.toFixed(2),
                  },
                  {
                    name: 'Phase B',
                    voltage: electricalData.avgVoltageB.toFixed(2),
                    current: electricalData.avgCurrentB.toFixed(2),
                    maxVoltage: electricalData.maxVoltageB.toFixed(2),
                    maxCurrent: electricalData.maxCurrentB.toFixed(2),
                  },
                  {
                    name: 'Phase C',
                    voltage: electricalData.avgVoltageC.toFixed(2),
                    current: electricalData.avgCurrentC.toFixed(2),
                    maxVoltage: electricalData.maxVoltageC.toFixed(2),
                    maxCurrent: electricalData.maxCurrentC.toFixed(2),
                  }
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis yAxisId="left" orientation="left" stroke="#64748b" label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" label={{ value: 'Current (A)', angle: -90, position: 'insideRight' }} />
                <Tooltip
                  formatter={(value, name) => {
                    if (name.includes('voltage')) return [`${value} V`, 'Voltage'];
                    if (name.includes('current')) return [`${value} A`, 'Current'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="voltage" name="Avg Voltage" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="maxVoltage" name="Max Voltage" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="current" name="Avg Current" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="maxCurrent" name="Max Current" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>


        {/* Failure Events & Alerts Section */}
        {(failureReadings.length > 0) && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Failure Events */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 backdrop-blur-xl rounded-2xl border border-red-200 dark:border-red-800 p-6">
              <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-6 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Recent Predicted Failure Events
              </h3>
              <div className="space-y-3 max-h-160 overflow-y-auto pr-2">
                {failureReadings.slice(0,-1).map((failure, index) => (
                  <div key={index} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-red-200 dark:border-red-700">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-red-800 dark:text-red-200">FAILURE: {failure.machineId}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{failure.machineType || 'Unknown Type'}</p>
                      </div>
                      <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded-full">
                        CRITICAL
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Failure Probability:</span>
                        <span className="ml-1 font-medium text-slate-800 dark:text-white">{failure.mlFailureProbability?.toFixed(2) || ''}%</span>
                      </div>
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Health Score:</span>
                        <span className="ml-1 font-medium text-red-600">{failure.componentHealthScore?.toFixed(1) || 'N/A'}%</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      {new Date(failure.timestampreal).toLocaleString([], {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Failure Distribution Pie Chart - ADDED TO THE RIGHT */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
                <PieChartIcon className="w-5 h-5 mr-2 text-red-500" />
                Failure Distribution by Machine
              </h3>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={failureCountData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={60}
                      paddingAngle={2}
                      dataKey="failureCount"
                      nameKey="machineId"
                      label={({ name, value, percent }) =>
                        `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                      }
                      labelLine={false}
                    >
                      {failureCountData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={[
                            '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6',
                            '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f43f5e'
                          ][index % 10]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} failures`, `Machine ${name}`]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Failure Statistics Summary */}
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {failureCountData.reduce((total, item) => total + (item.failureCount || 0), 0)}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Total Failures</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {failureCountData.length}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Affected Machines</div>
                  </div>
                </div>

                {failureCountData.length > 0 && (
                  <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-700">
                    <div className="flex items-center justify-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-red-800 dark:text-red-200">
                        Machine {failureCountData[0]?.machineId} has the most failures
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Top Failure Machines List */}
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Top Machines by Failures:</h4>
                {failureCountData.slice(0, 4).map((item, index) => (
                  <div key={item.machineId} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/30 rounded">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: ['#ef4444', '#f97316', '#eab308'][index % 3]
                        }}
                      ></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        Machine {item.machineId}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-red-600">{item.failureCount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-4 text-center">
            <Server className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-sm text-slate-600 dark:text-slate-400">Data Sources</div>
            <div className="font-bold text-slate-800 dark:text-white">{availableMachines.length} Machines</div>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-4 text-center">
            <Database className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Records</div>
            <div className="font-bold text-slate-800 dark:text-white">{(dashboardSummary?.overallStats?.totalReadings || 0).toLocaleString()}</div>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-4 text-center">
            <Clock className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <div className="text-sm text-slate-600 dark:text-slate-400">Update Frequency</div>
            <div className="font-bold text-slate-800 dark:text-white">Every 1 min</div>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-4 text-center">
            <Eye className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <div className="text-sm text-slate-600 dark:text-slate-400">ML Predictions</div>
            <div className="font-bold text-slate-800 dark:text-white">{mlMetrics.modelVersion || 'No Model'}</div>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-4 text-center">
            <Clock className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <div className="text-sm text-slate-600 dark:text-slate-400">Prediction Latency</div>
            <div className="font-bold text-slate-800 dark:text-white">{mlMetrics.predictionLatency || ''}ms</div>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-4 text-center">
            <RefreshCw className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
            <div className="text-sm text-slate-600 dark:text-slate-400">Last Refresh</div>
            <div className="font-bold text-slate-800 dark:text-white">{lastUpdate.toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;