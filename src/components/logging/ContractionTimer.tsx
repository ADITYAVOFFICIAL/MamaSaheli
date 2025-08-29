import React, { useState, useEffect, useRef } from 'react';
import { Save } from 'lucide-react';

import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { createContractionSession, Contraction } from '@/lib/appwrite';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const ContractionTimer = () => {
    const { user } = useAuthStore();
    const { toast } = useToast();
    const [isTiming, setIsTiming] = useState(false);
    const [contractions, setContractions] = useState<Contraction[]>([]);
    const [currentStartTime, setCurrentStartTime] = useState<Date | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [elapsed, setElapsed] = useState(0);

    const formatDuration = (seconds: number) => `${Math.floor(seconds / 60)}m ${seconds % 60}s`;

    const handleToggle = () => {
        if (isTiming) {
            if (timerRef.current) clearInterval(timerRef.current);
            if (!currentStartTime) return;
            const endTime = new Date();
            const newContraction: Contraction = {
                startTime: currentStartTime.toISOString(),
                endTime: endTime.toISOString(),
                durationSeconds: Math.round((endTime.getTime() - currentStartTime.getTime()) / 1000),
                frequencySeconds: contractions.length > 0
                    ? Math.round((currentStartTime.getTime() - new Date(contractions[contractions.length - 1].startTime).getTime()) / 1000)
                    : 0,
            };
            setContractions(prev => [...prev, newContraction]);
        } else {
            setCurrentStartTime(new Date());
            setElapsed(0);
            timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
        }
        setIsTiming(!isTiming);
    };

    const handleSaveSession = async () => {
        if (contractions.length === 0 || !user?.$id) return;
        try {
            await createContractionSession({
                userId: user.$id,
                sessionDate: new Date().toISOString(),
                contractions,
            });
            toast({ title: "Session Saved", description: "Your contraction log has been saved." });
            setContractions([]);
        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : "Save Error";
            toast({ title: "Save Error", description: errMsg, variant: "destructive" });
        }
    };

    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Contraction Timer</CardTitle>
                <CardDescription>Press the button at the start and end of each contraction to log its duration and frequency.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Button size="lg" onClick={handleToggle} className={`w-full h-24 text-2xl font-bold transition-colors ${isTiming ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                    {isTiming ? `Stop (${elapsed}s)` : 'Start Contraction'}
                </Button>
                <div className="space-y-2">
                    <h3 className="font-semibold">Logged Contractions</h3>
                    {contractions.length === 0 ? <p className="text-sm text-gray-500">No contractions logged in this session.</p> : (
                        <div className="space-y-1 text-sm">
                            {contractions.map((c, i) => (
                                <div key={i} className="flex justify-between p-2 bg-gray-50 rounded">
                                    <span>Contraction #{i + 1}</span>
                                    <span>Duration: {formatDuration(c.durationSeconds)}</span>
                                    {i > 0 && <span>Frequency: {formatDuration(c.frequencySeconds)}</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex gap-4">
                    <Button onClick={handleSaveSession} disabled={contractions.length === 0}><Save className="mr-2" /> Save Session</Button>
                    <Button variant="outline" onClick={() => setContractions([])} disabled={contractions.length === 0}>Clear Log</Button>
                </div>
            </CardContent>
        </Card>
    );
};