import React, { useState, useEffect } from 'react';

// Simple Slider component since we can't use shadcn in this setup
const Slider = ({ value, onValueChange, min, max, step }) => {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={(e) => onValueChange([parseInt(e.target.value)])}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
    />
  );
};

export default function DiffusionCurve() {
  const [speed, setSpeed] = useState(50);
  const [saturation, setSaturation] = useState(85);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval;
    if (isPlaying && animationProgress < 100) {
      interval = setInterval(() => {
        setAnimationProgress(prev => Math.min(prev + 0.5, 100));
      }, 20);
    } else if (animationProgress >= 100) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, animationProgress]);

  const segments = [
    { name: 'Innovators', percent: 2.5, color: '#3b82f6', description: 'Risk-takers who embrace new ideas first' },
    { name: 'Early Adopters', percent: 13.5, color: '#10b981', description: 'Opinion leaders who validate innovations' },
    { name: 'Early Majority', percent: 34, color: '#f59e0b', description: 'Deliberate pragmatists who follow proven success' },
    { name: 'Late Majority', percent: 34, color: '#ef4444', description: 'Skeptics who adopt under pressure or necessity' },
    { name: 'Laggards', percent: 16, color: '#6b7280', description: 'Traditionalists resistant to change' }
  ];

  const determinants = [
    { name: 'Relative Advantage', value: 'higher', impact: '+', description: 'Clear superiority over existing solutions' },
    { name: 'Compatibility', value: 'higher', impact: '+', description: 'Fits existing values and practices' },
    { name: 'Complexity', value: 'lower', impact: '+', description: 'Easy to understand and use' },
    { name: 'Trialability', value: 'higher', impact: '+', description: 'Can be tested on limited basis' },
    { name: 'Observability', value: 'higher', impact: '+', description: 'Results are visible to others' }
  ];

  const generateCurvePoints = () => {
    const points = [];
    const totalMonths = 120;
    const speedFactor = speed / 50;
    const maxAdoption = saturation;
    
    for (let month = 0; month <= totalMonths; month++) {
      const x = (month - (totalMonths / (2 * speedFactor))) / (totalMonths / (6 * speedFactor));
      const y = maxAdoption / (1 + Math.exp(-x));
      const displayMonth = month <= animationProgress * totalMonths / 100 ? month : null;
      if (displayMonth !== null) {
        points.push({ month, adoption: y });
      }
    }
    return points;
  };

  const curvePoints = generateCurvePoints();
  
  const getSegmentBoundaries = () => {
    const boundaries = [];
    let cumulative = 0;
    const maxAdoption = saturation;
    
    segments.forEach(segment => {
      const startPercent = cumulative;
      cumulative += segment.percent;
      const endPercent = Math.min(cumulative, maxAdoption);
      
      const startMonth = curvePoints.find(p => p.adoption >= startPercent)?.month || 0;
      const endMonth = curvePoints.find(p => p.adoption >= endPercent)?.month || 120;
      
      boundaries.push({
        ...segment,
        startMonth,
        endMonth,
        startPercent,
        endPercent
      });
    });
    
    return boundaries;
  };

  const segmentBoundaries = getSegmentBoundaries();

  const handlePlayPause = () => {
    if (animationProgress >= 100) {
      setAnimationProgress(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    setAnimationProgress(0);
    setIsPlaying(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">The Diffusion of Innovation</h2>
        <p className="text-slate-600 leading-relaxed">
          Explore how innovations spread through populations following Rogers' universal S-curve pattern. 
          Adjust the parameters to see how adoption speed and market saturation affect the timeline.
        </p>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-md mb-6">
        <div className="relative h-96 mb-4">
          <svg width="100%" height="100%" viewBox="0 0 800 400" className="overflow-visible">
            {[0, 25, 50, 75, 100].map(y => (
              <g key={y}>
                <line 
                  x1="60" 
                  y1={360 - (y * 3)} 
                  x2="760" 
                  y2={360 - (y * 3)} 
                  stroke="#e5e7eb" 
                  strokeWidth="1"
                />
                <text 
                  x="45" 
                  y={365 - (y * 3)} 
                  textAnchor="end" 
                  className="text-xs fill-slate-500"
                >
                  {y}%
                </text>
              </g>
            ))}

            {[0, 24, 48, 72, 96, 120].map(month => (
              <text 
                key={month}
                x={60 + (month / 120) * 700} 
                y="385" 
                textAnchor="middle" 
                className="text-xs fill-slate-500"
              >
                {month}mo
              </text>
            ))}

            {segmentBoundaries.map((segment, i) => {
              const x1 = 60 + (segment.startMonth / 120) * 700;
              const x2 = 60 + (segment.endMonth / 120) * 700;
              const isHovered = hoveredSegment === segment.name;
              
              return (
                <g key={i}>
                  <rect
                    x={x1}
                    y="40"
                    width={x2 - x1}
                    height="320"
                    fill={segment.color}
                    opacity={isHovered ? 0.15 : 0.05}
                    className="transition-opacity cursor-pointer"
                    onMouseEnter={() => setHoveredSegment(segment.name)}
                    onMouseLeave={() => setHoveredSegment(null)}
                  />
                  {isHovered && (
                    <text
                      x={(x1 + x2) / 2}
                      y="30"
                      textAnchor="middle"
                      className="text-sm font-semibold"
                      fill={segment.color}
                    >
                      {segment.name}
                    </text>
                  )}
                </g>
              );
            })}

            <path
              d={curvePoints.map((p, i) => {
                const x = 60 + (p.month / 120) * 700;
                const y = 360 - (p.adoption * 3);
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              stroke="#1e293b"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />

            {curvePoints.length > 0 && (
              <circle
                cx={60 + (curvePoints[curvePoints.length - 1].month / 120) * 700}
                cy={360 - (curvePoints[curvePoints.length - 1].adoption * 3)}
                r="6"
                fill="#3b82f6"
                className="drop-shadow-lg"
              />
            )}

            <line x1="60" y1="40" x2="60" y2="360" stroke="#64748b" strokeWidth="2" />
            <line x1="60" y1="360" x2="760" y2="360" stroke="#64748b" strokeWidth="2" />
            
            <text x="400" y="410" textAnchor="middle" className="text-sm font-medium fill-slate-700">
              Time (months)
            </text>
            <text 
              x="20" 
              y="200" 
              textAnchor="middle" 
              className="text-sm font-medium fill-slate-700"
              transform="rotate(-90, 20, 200)"
            >
              Market Adoption (%)
            </text>
          </svg>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={handlePlayPause}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {isPlaying ? 'Pause' : animationProgress >= 100 ? 'Replay' : 'Play'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
          >
            Reset
          </button>
          <div className="flex-1 text-sm text-slate-600">
            Progress: <span className="font-semibold">{animationProgress.toFixed(0)}%</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {segments.map(segment => (
            <div
              key={segment.name}
              className="p-3 rounded-lg border-2 cursor-pointer transition-all"
              style={{ 
                borderColor: hoveredSegment === segment.name ? segment.color : '#e5e7eb',
                backgroundColor: hoveredSegment === segment.name ? segment.color + '10' : 'white'
              }}
              onMouseEnter={() => setHoveredSegment(segment.name)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <div className="flex items-center gap-2 mb-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-xs font-semibold text-slate-700">{segment.name}</span>
              </div>
              <div className="text-xs text-slate-500 mb-1">{segment.percent}%</div>
              <div className="text-xs text-slate-600">{segment.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Adoption Parameters</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Adoption Speed</label>
                <span className="text-sm text-slate-600">
                  {speed < 40 ? 'Slow' : speed < 70 ? 'Moderate' : 'Fast'}
                </span>
              </div>
              <Slider
                value={[speed]}
                onValueChange={(val) => setSpeed(val[0])}
                min={10}
                max={100}
                step={1}
              />
              <p className="text-xs text-slate-500 mt-1">
                How quickly the innovation moves through adoption phases
              </p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Market Saturation</label>
                <span className="text-sm text-slate-600">{saturation}%</span>
              </div>
              <Slider
                value={[saturation]}
                onValueChange={(val) => setSaturation(val[0])}
                min={40}
                max={100}
                step={5}
              />
              <p className="text-xs text-slate-500 mt-1">
                Maximum market penetration the innovation will achieve
              </p>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-slate-600">
                <strong>Current scenario:</strong> Reaches {saturation}% adoption in approximately{' '}
                <strong>{Math.round(120 / (speed / 50))} months</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Rogers' Five Determinants</h3>
          <p className="text-xs text-slate-600 mb-4">
            These attributes predict adoption velocity across all contexts
          </p>
          
          <div className="space-y-3">
            {determinants.map((det, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                  det.impact === '+' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {det.impact}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-slate-800">{det.name}</div>
                  <div className="text-xs text-slate-600 mt-1">{det.description}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900">
              <strong>Key insight:</strong> While the S-curve pattern is universal, these determinants 
              control the speed and scale of adoption in each specific context.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-6 bg-slate-800 text-white rounded-lg">
        <h4 className="font-semibold mb-2">From Universal to Contextual</h4>
        <p className="text-sm text-slate-300 leading-relaxed">
          In oncology, this elegant curve encounters regulatory gatekeepers, economic constraints, 
          operational barriers, and complex human psychology. The universal pattern remains, but 
          the determinants become domain-specific: clinical evidence strength, payer coverage decisions, 
          institutional protocols, physician familiarity, and patient access dynamics all reshape 
          how—and how quickly—a therapy moves from approval to routine care.
        </p>
      </div>
    </div>
  );
}
