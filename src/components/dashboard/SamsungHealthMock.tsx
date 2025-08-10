import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Footprints,
  Moon,
  Wind,
  Brain,
  Zap,
  Watch,
  ChevronRight,
  ChevronUp,
  Target,
  TrendingUp,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, RadialBarChart, RadialBar,
  ResponsiveContainer, Tooltip, XAxis, Cell
} from 'recharts';

// --- TYPE DEFINITIONS for Strict TypeScript ---
interface HealthMetric {
  time: string;
  value: number;
}
interface SleepData {
  totalHours: number;
  deepHours: number;
  remHours: number;
  score: number;
}
interface ActivityData {
  steps: number;
  goal: number;
  activeEnergy: number;
  hourlySteps: { hour: string; steps: number }[];
}
interface BodyCompositionData {
    weight: number;
    skeletalMuscle: number;
    bodyFatMass: number;
}
interface FullHealthData {
  activity: ActivityData;
  heartRate: HealthMetric[];
  sleep: SleepData;
  stress: HealthMetric[];
  spo2: number;
  bodyComposition: BodyCompositionData;
}

// --- REALISTIC MOCK DATA GENERATION ---
const generateHealthData = (): FullHealthData => {
  const hourlySteps = Array.from({ length: 24 }, (_, i) => {
    let steps = 0;
    if (i > 6 && i < 22) {
      const randomFactor = Math.random();
      if (i === 8 || i === 18) steps = 300 + randomFactor * 1000;
      else if (i > 12 && i < 14) steps = 200 + randomFactor * 400;
      else steps = 50 + randomFactor * 150;
    }
    return { hour: `${i}:00`, steps: Math.floor(steps) };
  });
  const totalSteps = hourlySteps.reduce((sum, item) => sum + item.steps, 0);

  return {
    activity: {
      steps: totalSteps,
      goal: 10000,
      activeEnergy: Math.floor(totalSteps * 0.045),
      hourlySteps,
    },
    heartRate: Array.from({ length: 12 }, (_, i) => ({
      time: `${i * 2}:00`,
      value: Math.floor(60 + Math.sin(i) * 10 + Math.random() * 15),
    })),
    sleep: {
      totalHours: 7 + Math.random() * 1.5,
      deepHours: (7 + Math.random() * 1.5) * (0.18 + Math.random() * 0.1),
      remHours: (7 + Math.random() * 1.5) * (0.20 + Math.random() * 0.08),
      score: Math.floor(65 + Math.random() * 25),
    },
    stress: Array.from({ length: 12 }, (_, i) => ({
      time: `${i * 2}:00`,
      value: Math.floor(30 + Math.cos(i) * 15 + Math.random() * 20),
    })),
    spo2: 96 + Math.floor(Math.random() * 4),
    bodyComposition: {
        weight: 75.4,
        skeletalMuscle: 34.2,
        bodyFatMass: 15.1,
    }
  };
};

// --- Reusable UI Components ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 dark:bg-black/80 backdrop-blur-sm p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="font-bold text-sm text-gray-900 dark:text-white">{`${payload[0].value} ${payload[0].name}`}</p>
      </div>
    );
  }
  return null;
};

const MetricWidget = ({ icon: Icon, title, value, unit, children, iconBgColor }: any) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.3, type: 'spring' }}
    className="bg-gray-100/50 dark:bg-gray-800/40 p-4 rounded-2xl flex flex-col h-full"
  >
    <div className="flex items-center gap-3 mb-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${iconBgColor}`}>
        <Icon size={18} />
      </div>
      <h3 className="font-semibold text-gray-700 dark:text-gray-200">{title}</h3>
    </div>
    {value && (
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {value} <span className="text-base font-medium text-gray-500">{unit}</span>
      </div>
    )}
    <div className="flex-grow">{children}</div>
  </motion.div>
);

// --- Child Components for Views ---
const HealthDashboardView = ({ healthData }: { healthData: FullHealthData }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { activity, heartRate, sleep, stress, spo2, bodyComposition } = healthData;
    const activityProgress = (activity.steps / activity.goal) * 100;
    const [activeBar, setActiveBar] = useState<number | null>(null);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
        >
            <div className="flex justify-end -mb-2 px-2">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors"
                >
                    {isExpanded ? 'Collapse' : 'More'}
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                        <ChevronUp size={16} className="transform transition-transform"/>
                    </motion.div>
                </button>
            </div>
             <motion.div layout className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <motion.div layout className="lg:col-span-2">
                    <div className="bg-gray-100/50 dark:bg-gray-800/40 p-4 rounded-2xl h-full flex flex-col">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Daily Activity</h3>
                        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            <div className="relative w-48 h-48 mx-auto">
                                <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart innerRadius="60%" outerRadius="100%" data={[{ value: activityProgress }]} startAngle={90} endAngle={450}>
                                    <RadialBar dataKey="value" cornerRadius={10} background fill="#2563eb" />
                                </RadialBarChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <Footprints size={24} className="text-blue-500"/>
                                    <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{activity.steps.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500">/ {activity.goal.toLocaleString()} steps</p>
                                </div>
                            </div>
                            <div className="w-full h-40">
                                <ResponsiveContainer>
                                    <BarChart data={activity.hourlySteps.filter(d => d.steps > 0)} onMouseMove={(state) => { if (state.isTooltipActive) setActiveBar(state.activeTooltipIndex);}} onMouseLeave={() => setActiveBar(null)}>
                                        <XAxis dataKey="hour" tickLine={false} axisLine={false} fontSize={10}/>
                                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(37, 99, 235, 0.1)'}}/>
                                        <Bar dataKey="steps" radius={[4, 4, 0, 0]}>
                                        {activity.hourlySteps.filter(d => d.steps > 0).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === activeBar ? '#1d4ed8' : '#60a5fa'}/>
                                        ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </motion.div>
                <div className="grid grid-cols-2 gap-4">
                    <MetricWidget icon={Zap} title="Active" value={activity.activeEnergy} unit="kcal" iconBgColor="bg-orange-500"><p className="text-xs text-gray-500 dark:text-gray-400">Energy burned</p></MetricWidget>
                    <MetricWidget icon={Heart} title="Heart Rate" value={heartRate[heartRate.length - 1].value} unit="bpm" iconBgColor="bg-red-500"><div className="h-10 w-full -ml-4"><ResponsiveContainer><LineChart data={heartRate}><Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={false}/><Tooltip content={<CustomTooltip />}/></LineChart></ResponsiveContainer></div></MetricWidget>
                </div>
                <AnimatePresence>
                    {isExpanded && (
                        <>
                        <MetricWidget icon={Moon} title="Sleep" value={sleep.totalHours.toFixed(1)} unit="hrs" iconBgColor="bg-indigo-500"><p className="text-xs text-gray-500 dark:text-gray-400">Score: <span className="font-bold">{sleep.score}</span> | Deep: <span className="font-bold">{sleep.deepHours.toFixed(1)}h</span></p></MetricWidget>
                        <MetricWidget icon={Brain} title="Stress" value="Low" unit="" iconBgColor="bg-green-500"><p className="text-xs text-gray-500 dark:text-gray-400">Well balanced day</p></MetricWidget>
                        <MetricWidget icon={Wind} title="Blood Oxygen" value={spo2} unit="%" iconBgColor="bg-sky-500"><p className="text-xs text-gray-500 dark:text-gray-400">During sleep</p></MetricWidget>
                        <MetricWidget icon={Target} title="Body Composition" iconBgColor="bg-teal-500"><div className="text-xs space-y-1 text-gray-600 dark:text-gray-300"><p>Weight: <span className="font-bold">{bodyComposition.weight.toFixed(1)} kg</span></p><p>Skeletal Muscle: <span className="font-bold">{bodyComposition.skeletalMuscle.toFixed(1)} kg</span></p><p>Body Fat: <span className="font-bold">{bodyComposition.bodyFatMass.toFixed(1)} kg</span></p></div></MetricWidget>
                        <MetricWidget icon={TrendingUp} title="Workouts" iconBgColor="bg-purple-500"><div className="text-xs space-y-1 text-gray-600 dark:text-gray-300"><p className="font-bold">3 sessions this week</p><p>Last: <span className="font-medium">Running, 3.2 km</span></p></div></MetricWidget>
                        </>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

const DisconnectedView = ({ onConnect }: { onConnect: () => void }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center py-10"
    >
      <Watch className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No Watch Connected</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6 max-w-xs mx-auto">
        Connect your Samsung Galaxy Watch to see your daily activity and health insights.
      </p>
      <button
        onClick={onConnect}
        className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
      >
        Connect
      </button>
    </motion.div>
  );

// --- MAIN COMPONENT ---
export const SamsungHealthMock: React.FC = () => {
  const [isConnected, setIsConnected] = useState(true);
  const healthData = useMemo(() => generateHealthData(), []);

  return (
    <motion.div
      layout
      transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
      className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg border border-gray-200 dark:border-gray-700/50 rounded-3xl p-4 sm:p-6 shadow-xl"
    >
      <header className="flex justify-between items-center mb-4 px-2">
        <div className="flex items-center gap-3">
          <Watch className="text-blue-500" size={28} />
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Samsung Health</h2>
            <AnimatePresence mode="wait">
            <motion.p
                key={isConnected ? 'connected' : 'disconnected'}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className={`text-xs font-medium flex items-center gap-1 ${isConnected ? 'text-green-500' : 'text-gray-500'}`}
            >
                {isConnected ? <CheckCircle size={12}/> : <XCircle size={12}/>}
                {isConnected ? 'Watch8 Classic' : 'Disconnected'}
            </motion.p>
            </AnimatePresence>
          </div>
        </div>
        {isConnected && (
            <button
                onClick={() => setIsConnected(false)}
                className="text-xs font-semibold text-red-500 bg-red-100 dark:bg-red-900/50 px-3 py-1.5 rounded-full hover:bg-red-200 dark:hover:bg-red-800/50"
            >
                Disconnect
            </button>
        )}
      </header>
      <AnimatePresence mode="wait">
        {isConnected ? (
          <HealthDashboardView key="dash" healthData={healthData} />
        ) : (
          <DisconnectedView key="disco" onConnect={() => setIsConnected(true)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SamsungHealthMock;