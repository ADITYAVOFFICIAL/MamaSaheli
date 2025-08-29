// components/logging/KickCounter.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, StopCircle, Loader2, Trash2, History as HistoryIcon } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import {
    createKickCounterSession,
    getRecentKickSessions,
    deleteKickSession,
    KickCounterSession,
} from '@/lib/appwrite';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SESSIONS_PER_PAGE = 5;

export const KickCounter = () => {
    const { user } = useAuthStore();
    const { toast } = useToast();

    const [isActive, setIsActive] = useState(false);
    const [kicks, setKicks] = useState(0);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const [history, setHistory] = useState<KickCounterSession[]>([]);
    const [historyPage, setHistoryPage] = useState(0);
    const [hasMoreHistory, setHasMoreHistory] = useState(true);
    const [isLoading, setIsLoading] = useState({ save: false, history: false, loadMore: false });
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const fetchHistory = useCallback(async (page: number, loadMore = false) => {
        if (!user?.$id) return;
        
        setIsLoading(prev => ({ ...prev, ...(loadMore ? { loadMore: true } : { history: true }) }));

        try {
            const newSessions = await getRecentKickSessions(user.$id, SESSIONS_PER_PAGE);
            setHistory(prev => page === 0 ? newSessions : [...prev, ...newSessions]);
            setHasMoreHistory(newSessions.length === SESSIONS_PER_PAGE);
        } catch (error) {
            toast({ title: "Error Fetching History", description: "Could not load your past sessions.", variant: "destructive" });
        } finally {
            setIsLoading(prev => ({ ...prev, history: false, loadMore: false }));
        }
    }, [user?.$id, toast]);

    useEffect(() => {
        fetchHistory(0);
    }, [fetchHistory]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const stopTimer = async (completed: boolean) => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsActive(false);

        if (completed && user?.$id && startTime) {
            setIsLoading(prev => ({ ...prev, save: true }));
            try {
                await createKickCounterSession({
                    userId: user.$id,
                    startTime: startTime.toISOString(),
                    endTime: new Date().toISOString(),
                    durationSeconds: elapsedTime,
                    kickCount: kicks,
                });
                toast({ title: "Session Saved", description: `You felt ${kicks} kicks in ${formatDuration(elapsedTime)}.` });
                setHistoryPage(0);
                await fetchHistory(0);
            } catch (error) {
                const errMsg = error instanceof Error ? error.message : "Save Error";
                toast({ title: "Save Error", description: errMsg, variant: "destructive" });
            } finally {
                setIsLoading(prev => ({ ...prev, save: false }));
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

    const handleDeleteSession = async (sessionId: string) => {
        setIsDeleting(sessionId);
        try {
            await deleteKickSession(sessionId);
            setHistory(prev => prev.filter(session => session.$id !== sessionId));
            toast({ title: "Session Deleted", description: "The session has been removed from your history." });
        } catch (error) {
            toast({ title: "Deletion Failed", description: "Could not delete the session.", variant: "destructive" });
        } finally {
            setIsDeleting(null);
        }
    };

    const handleLoadMore = () => {
        const nextPage = historyPage + 1;
        setHistoryPage(nextPage);
        fetchHistory(nextPage, true);
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
            <CardContent>
                <div className="text-center space-y-6">
                    <div className="text-6xl font-bold text-mamasaheli-primary">{kicks} / 10</div>
                    <div className="text-2xl font-mono text-gray-600">{formatDuration(elapsedTime)}</div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {!isActive ? (
                            <Button size="lg" onClick={startTimer} disabled={isLoading.save}>
                                <Play className="mr-2" /> Start Session
                            </Button>
                        ) : (
                            <>
                                <Button size="lg" onClick={handleKick} className="flex-1" disabled={isLoading.save}>
                                    {isLoading.save ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Count Kick
                                </Button>
                                <Button size="lg" variant="destructive" onClick={() => stopTimer(false)} className="flex-1" disabled={isLoading.save}>
                                    <StopCircle className="mr-2" /> Stop Session
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <HistoryIcon className="mr-2 h-5 w-5 text-gray-500" />
                        Session History
                    </h3>
                    {isLoading.history && history.length === 0 ? (
                        <div className="flex justify-center items-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                    ) : history.length === 0 ? (
                        <p className="text-sm text-center text-gray-500 py-4">No past sessions found.</p>
                    ) : (
                        <div className="space-y-3">
                            {history.map(session => (
                                <div key={session.$id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium">{format(new Date(session.startTime), "MMMM d, yyyy 'at' h:mm a")}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {session.kickCount} kicks in {formatDuration(session.durationSeconds)} • {formatDistanceToNow(new Date(session.startTime), { addSuffix: true })}
                                        </p>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-600" disabled={isDeleting === session.$id}>
                                                {isDeleting === session.$id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>This action cannot be undone. This will permanently delete this kick counting session from your history.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteSession(session.$id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            ))}
                            {hasMoreHistory && (
                                <Button onClick={handleLoadMore} variant="outline" className="w-full mt-4" disabled={isLoading.loadMore}>
                                    {isLoading.loadMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Load More
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};