import React, { useState, useEffect, useRef } from 'react';
import { Play, StopCircle } from 'lucide-react';

import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { createKickCounterSession } from '@/lib/appwrite';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const KickCounter = () => {
    const { user } = useAuthStore();
    const { toast } = useToast();
    const [isActive, setIsActive] = useState(false);
    const [kicks, setKicks] = useState(0);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const stopTimer = async (completed: boolean) => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsActive(false);
        if (completed && user?.$id && startTime) {
            try {
                await createKickCounterSession({
                    userId: user.$id,
                    startTime: startTime.toISOString(),
                    endTime: new Date().toISOString(),
                    durationSeconds: elapsedTime,
                    kickCount: kicks,
                });
                toast({ title: "Session Saved", description: `You felt 10 kicks in ${formatDuration(elapsedTime)}.` });
            } catch (error: unknown) {
                const errMsg = error instanceof Error ? error.message : "Save Error";
                toast({ title: "Save Error", description: errMsg, variant: "destructive" });
            }
        }
    };

    const startTimer = () => {
        setIsActive(true);
        setKicks(0);
        setStartTime(new Date());
        setElapsedTime(0);
        timerRef.current = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
    };

    const handleKick = () => {
        if (!isActive) return;
        const newKicks = kicks + 1;
        setKicks(newKicks);
        if (newKicks >= 10) {
            stopTimer(true);
        }
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Kick Counter</CardTitle>
                <CardDescription>Track your baby's movements. Start the timer and tap "Count Kick" each time you feel a movement. The session stops after 10 kicks.</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
                <div className="text-6xl font-bold text-mamasaheli-primary">{kicks} / 10</div>
                <div className="text-2xl font-mono text-gray-600">{formatDuration(elapsedTime)}</div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {!isActive ? (
                        <Button size="lg" onClick={startTimer}><Play className="mr-2" /> Start Session</Button>
                    ) : (
                        <>
                            <Button size="lg" onClick={handleKick} className="flex-1">Count Kick</Button>
                            <Button size="lg" variant="destructive" onClick={() => stopTimer(false)} className="flex-1"><StopCircle className="mr-2" /> Stop Session</Button>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};