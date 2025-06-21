import React from 'react';
import { Activity, Scale, Heart, TrendingUp, TrendingDown } from 'lucide-react';

const DashboardCards = () => {
  const healthMetrics = [
    { 
      title: 'Daily Steps', 
      value: '8,432', 
      change: '+12% vs yesterday', 
      trend: 'up',
      icon: Activity,
      color: 'from-pink-400 to-pink-600',
      bgColor: 'bg-gradient-to-br from-pink-50 to-pink-100',
      chartData: [10, 50, 35, 25, 40, 30, 35]
    },
    { 
      title: 'Weight Tracking', 
      value: '68.5 kg', 
      change: '-0.5 kg this week', 
      trend: 'down',
      icon: Scale,
      color: 'from-rose-400 to-rose-600',
      bgColor: 'bg-gradient-to-br from-rose-50 to-rose-100',
      chartData: [50, 20, 35, 25, 40, 30, 25]
    },
    { 
      title: 'Blood Pressure', 
      value: '120/80', 
      change: 'Normal range', 
      trend: 'stable',
      icon: Heart,
      color: 'from-red-400 to-red-600',
      bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
      chartData: [35, 40, 30, 45, 35, 40, 35]
    }
  ];

  const generatePath = (data, width = 180, height = 50) => {
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - (value / 60) * height;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  const generateAreaPath = (data, width = 180, height = 50) => {
    const linePath = generatePath(data, width, height);
    return `${linePath} L ${width},${height} L 0,${height} Z`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {healthMetrics.map((metric, index) => (
        <div key={index} className={`${metric.bgColor} rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-shadow`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-xl flex items-center justify-center shadow-lg`}>
              <metric.icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-1">
              {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
              {metric.trend === 'down' && <TrendingDown className="w-4 h-4 text-blue-500" />}
              {metric.trend === 'stable' && <div className="w-4 h-4 rounded-full bg-gray-400"></div>}
            </div>
          </div>

          {/* Metrics */}
          <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.title}</h3>
          <p className="text-2xl font-bold text-gray-800 mb-1">{metric.value}</p>
          <p className="text-sm text-gray-500 mb-4">{metric.change}</p>
          
          {/* Mini Chart */}
          <div className="h-12 relative">
            <svg className="w-full h-full" viewBox="0 0 180 50" preserveAspectRatio="none">
              {/* Area fill */}
              <path
                d={generateAreaPath(metric.chartData)}
                fill="currentColor"
                className="text-pink-300 opacity-20"
              />
              {/* Line */}
              <path
                d={generatePath(metric.chartData)}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-pink-500"
              />
              {/* Data points */}
              {metric.chartData.map((value, i) => (
                <circle
                  key={i}
                  cx={(i / (metric.chartData.length - 1)) * 180}
                  cy={50 - (value / 60) * 50}
                  r="2"
                  fill="currentColor"
                  className="text-pink-600"
                />
              ))}
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;