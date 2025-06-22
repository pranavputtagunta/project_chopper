import React, { useEffect, useRef } from 'react';
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

  const lineRefs = useRef([]);
  const areaRefs = useRef([]);
  const circleRefs = useRef([]);

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

  useEffect(() => {
    // Animate lines
    lineRefs.current.forEach((ref, index) => {
      if (ref) {
        const length = ref.getTotalLength();
        ref.style.strokeDasharray = length;
        ref.style.strokeDashoffset = length;
        ref.getBoundingClientRect(); // force reflow
        
        // Stagger animation timing
        setTimeout(() => {
          ref.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)';
          ref.style.strokeDashoffset = 0;
        }, index * 200);
      }
    });

    // Animate area fills
    areaRefs.current.forEach((ref, index) => {
      if (ref) {
        ref.style.opacity = '0';
        ref.style.transform = 'scaleY(0)';
        ref.style.transformOrigin = 'bottom';
        
        setTimeout(() => {
          ref.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
          ref.style.opacity = '0.2';
          ref.style.transform = 'scaleY(1)';
        }, index * 200 + 300);
      }
    });

    // Animate circles (data points)
    circleRefs.current.forEach((circleGroup, chartIndex) => {
      circleGroup.forEach((circle, pointIndex) => {
        if (circle) {
          circle.style.opacity = '0';
          circle.style.transform = 'scale(0)';
          
          setTimeout(() => {
            circle.style.transition = 'opacity 0.3s ease-out, transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            circle.style.opacity = '1';
            circle.style.transform = 'scale(1)';
          }, chartIndex * 200 + 800 + pointIndex * 100);
        }
      });
    });
  }, []);

  return (
    <>
      <style>
        {`
          .card-fade-in {
            opacity: 0;
            transform: translateY(20px);
            animation: cardFadeIn 0.6s ease-out forwards;
          }
          
          @keyframes cardFadeIn {
            to { 
              opacity: 1; 
              transform: translateY(0);
            }
          }
          
          .value-counter {
            opacity: 0;
            animation: valueCounter 0.8s ease-out 0.5s forwards;
          }
          
          @keyframes valueCounter {
            to { opacity: 1; }
          }
          
          .icon-bounce {
            animation: iconBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.3s forwards;
            transform: scale(0);
          }
          
          @keyframes iconBounce {
            to { transform: scale(1); }
          }
        `}
      </style>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {healthMetrics.map((metric, index) => (
          <div 
            key={index} 
            className={`${metric.bgColor} rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 card-fade-in`}
            style={{ animationDelay: `${index * 150}ms` }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-xl flex items-center justify-center shadow-lg icon-bounce`}>
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
            <p className="text-2xl font-bold text-gray-800 mb-1 value-counter">{metric.value}</p>
            <p className="text-sm text-gray-500 mb-4 value-counter">{metric.change}</p>
            
            {/* Mini Chart */}
            <div className="h-12 relative overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 180 50" preserveAspectRatio="none">
                {/* Area fill */}
                <path
                  ref={el => {
                    if (!areaRefs.current[index]) areaRefs.current[index] = el;
                    else areaRefs.current[index] = el;
                  }}
                  d={generateAreaPath(metric.chartData)}
                  fill="currentColor"
                  className="text-pink-300"
                />
                
                {/* Line */}
                <path
                  ref={el => {
                    if (!lineRefs.current[index]) lineRefs.current[index] = el;
                    else lineRefs.current[index] = el;
                  }}
                  d={generatePath(metric.chartData)}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-pink-500"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Data points */}
                {metric.chartData.map((value, i) => (
                  <circle
                    key={i}
                    ref={el => {
                      if (!circleRefs.current[index]) circleRefs.current[index] = [];
                      circleRefs.current[index][i] = el;
                    }}
                    cx={(i / (metric.chartData.length - 1)) * 180}
                    cy={50 - (value / 60) * 50}
                    r="3"
                    fill="currentColor"
                    className="text-pink-600"
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
                  />
                ))}
              </svg>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default DashboardCards;