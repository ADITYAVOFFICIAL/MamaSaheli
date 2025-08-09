import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Watch, HeartPulse, Moon, Footprints, RefreshCw, CheckCircle, XCircle, BatteryFull, Wifi, Smartphone, ChevronDown, HardDrive, Info
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// --- Mock Data ---
const mockHeartRate = [
  { time: '6 AM', value: 62 },
  { time: '9 AM', value: 70 },
  { time: '12 PM', value: 76 },
  { time: '3 PM', value: 72 },
  { time: '6 PM', value: 68 },
  { time: '9 PM', value: 65 },
];
const mockSleep = [
  { stage: 'Deep', hours: 2.1 },
  { stage: 'Light', hours: 4.5 },
  { stage: 'REM', hours: 1.4 },
];
const mockSteps = [
  { hour: '8 AM', steps: 500 },
  { hour: '10 AM', steps: 1200 },
  { hour: '12 PM', steps: 2100 },
  { hour: '2 PM', steps: 3200 },
  { hour: '4 PM', steps: 4500 },
  { hour: '6 PM', steps: 6000 },
];

const deviceInfo = {
  name: 'Galaxy Watch 8 Classic',
  model: 'SM-R960',
  softwareVersion: 'R960XXU1AWL1',
  battery: 87,
  storage: '12.1GB / 16GB used',
  connected: true,
  lastSync: 'Just now',
  wifi: true,
  phone: 'Galaxy S24 Ultra',
};

export const SamsungHealthMock: React.FC = () => {
  const [connected, setConnected] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [showDetails, setShowDetails] = useState(false);

  const handleToggle = () => setConnected((c) => !c);

  const handleSync = () => {
    if (!connected) return;
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastSync(new Date());
    }, 1800);
  };

  return (
    <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 mb-8 overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between pb-2 bg-gradient-to-r from-blue-500/90 to-blue-400/80 dark:from-blue-900 dark:to-blue-700 rounded-t-2xl px-6 py-4">
        <div className="flex items-center gap-3">
          <Watch className="h-8 w-8 text-white drop-shadow" />
          <div>
            <CardTitle className="text-lg font-bold text-white tracking-tight">Samsung Health</CardTitle>
            <div className="text-xs text-blue-100 font-medium flex items-center gap-1 mt-1">
              <Smartphone className="h-3 w-3" /> {deviceInfo.phone}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
           <motion.span
            className={`text-xs font-semibold flex items-center gap-1 ${connected ? 'text-green-200' : 'text-gray-200/70'}`}
            animate={{ opacity: connected ? 1 : 0.6 }}
          >
            {connected ? (
              <>
                <CheckCircle className="inline h-4 w-4" /> Connected
              </>
            ) : (
              <>
                <XCircle className="inline h-4 w-4" /> Disconnected
              </>
            )}
          </motion.span>
          <Button
            size="sm"
            variant={connected ? 'outline' : 'default'}
            className="text-xs px-3 py-1 h-7 bg-white/80 hover:bg-white/90 border-0 shadow-sm text-blue-900"
            onClick={handleToggle}
          >
            {connected ? 'Disconnect' : 'Connect'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-4 px-6">
        <AnimatePresence>
          {connected ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Device Details Toggle */}
              <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setShowDetails((v) => !v)}>
                <div className="flex items-center gap-2 text-sm text-blue-900 dark:text-blue-200 font-semibold">
                  <Watch className="h-5 w-5" /> {deviceInfo.name}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8"
                  aria-label="Show device details"
                >
                  <motion.div animate={{ rotate: showDetails ? 180 : 0 }}>
                    <ChevronDown className="h-5 w-5" />
                  </motion.div>
                </Button>
              </div>
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-700 dark:text-gray-200 bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4">
                      <span className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-500" /> Model: {deviceInfo.model}</span>
                      <span className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-500" /> Software: {deviceInfo.softwareVersion}</span>
                      <span className="flex items-center gap-2"><BatteryFull className="h-4 w-4 text-green-500" /> Battery: {deviceInfo.battery}%</span>
                      <span className="flex items-center gap-2"><HardDrive className="h-4 w-4 text-gray-500" /> Storage: {deviceInfo.storage}</span>
                      <span className="flex items-center gap-2"><Wifi className="h-4 w-4 text-blue-500" /> Wi-Fi: {deviceInfo.wifi ? 'Connected' : 'Off'}</span>
                      <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Last Sync: {deviceInfo.lastSync}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Charts Section */}
              <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6">
                {/* Heart Rate Chart */}
                <div className="flex-1 min-w-[180px]">
                  <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                    <HeartPulse className="h-5 w-5 text-red-500" /> Heart Rate
                  </div>
                  <div className="flex items-end justify-between h-28 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                    {mockHeartRate.map((d, i) => (
                      <motion.div
                        key={i}
                        initial={{ scaleY: 0.1 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: i * 0.1, type: 'spring', stiffness: 150, damping: 10 }}
                        className="flex flex-col items-center w-full"
                      >
                        <div
                          className="w-6 rounded-t-md bg-gradient-to-t from-red-400 to-red-500 shadow-sm"
                          style={{ height: `${d.value * 1.1}px` }}
                        />
                        <span className="text-[10px] text-gray-500 mt-1">{d.time}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-2 text-center">Avg: 69 bpm</div>
                </div>
                {/* Sleep & Steps */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Sleep Chart */}
                    <div className="flex-1 min-w-[160px]">
                        <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                        <Moon className="h-5 w-5 text-indigo-500" /> Sleep
                        </div>
                        <div className="flex flex-col gap-2.5 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg h-28 justify-center">
                        {mockSleep.map((s, i) => (
                            <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.15 }}
                            className="flex items-center gap-2"
                            >
                            <span className="w-12 text-xs text-gray-500">{s.stage}</span>
                            <Progress value={s.hours * 12.5} className="flex-1 h-3 rounded-full bg-blue-100 dark:bg-blue-900/30" />
                            <span className="text-xs font-medium w-8 text-right">{s.hours}h</span>
                            </motion.div>
                        ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-2 text-center">Total: 8h</div>
                    </div>
                    {/* Steps Chart */}
                    <div className="flex-1 min-w-[160px]">
                        <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                        <Footprints className="h-5 w-5 text-green-500" /> Steps
                        </div>
                        <div className="flex items-end justify-between h-28 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                            {mockSteps.map((d, i) => (
                                <motion.div
                                key={i}
                                initial={{ scaleY: 0.1 }}
                                animate={{ scaleY: 1 }}
                                transition={{ delay: i * 0.1, type: 'spring', stiffness: 150, damping: 10 }}
                                className="flex flex-col items-center w-full"
                                >
                                <div
                                    className="w-6 rounded-t-md bg-gradient-to-t from-green-400 to-green-500 shadow-sm"
                                    style={{ height: `${d.steps / 80}px` }}
                                />
                                <span className="text-[10px] text-gray-500 mt-1">{d.hour.split(' ')[0]}</span>
                                </motion.div>
                            ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-2 text-center">Today: 6,000 steps</div>
                    </div>
                </div>
              </div>
              {/* Sync Status */}
              <div className="flex items-center gap-3 mt-6">
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-semibold"
                  onClick={handleSync}
                  disabled={syncing}
                >
                  <motion.span
                    animate={syncing ? { rotate: 360 } : { rotate: 0 }}
                    transition={{ repeat: syncing ? Infinity : 0, duration: 1, ease: 'linear' }}
                    className="inline-block"
                  >
                    <RefreshCw className={`h-4 w-4 ${syncing ? 'text-blue-500' : ''}`} />
                  </motion.span>
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </Button>
                <span className="text-xs text-gray-500">
                  Last synced: {lastSync.toLocaleTimeString()}
                </span>
                <motion.span
                  className="ml-auto text-xs px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 font-medium"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Real-time sync enabled
                </motion.span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <Watch className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Connect your Galaxy Watch</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6">
                Sync with Samsung Health to see your daily activity, sleep patterns, and heart rate.
              </p>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleToggle}
              >
                Connect Device
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default SamsungHealthMock;