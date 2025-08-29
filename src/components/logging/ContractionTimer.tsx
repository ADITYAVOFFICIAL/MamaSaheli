// components/logging/ContractionTimer.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Save, Loader2, Trash2, History as HistoryIcon } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import {
    createContractionSession,
    getRecentContractionSessions,
    deleteContractionSession,
    Contraction,
    ContractionSession,
} from '@/lib/appwrite';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
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

export const ContractionTimer = () => {
    const { user } = useAuthStore();
    const { toast } = useToast();

    const [isTiming, setIsTiming] = useState(false);
    const [contractions, setContractions] = useState<Contraction[]>([]);
    const [currentStartTime, setCurrentStartTime] = useState<Date | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [elapsed, setElapsed] = useState(0);

    const [history, setHistory] = useState<ContractionSession[]>([]);
    const [historyPage, setHistoryPage] = useState(0);
    const [hasMoreHistory, setHasMoreHistory] = useState(true);
    const [isLoading, setIsLoading] = useState({ save: false, history: false, loadMore: false });
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const fetchHistory = useCallback(async (page: number, loadMore = false) => {
        if (!user?.$id) return;
        
        setIsLoading(prev => ({ ...prev, ...(loadMore ? { loadMore: true } : { history: true }) }));

        try {
            const newSessions = await getRecentContractionSessions(user.$id, SESSIONS_PER_PAGE, page * SESSIONS_PER_PAGE);
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
        setIsLoading(prev => ({ ...prev, save: true }));
        try {
            await createContractionSession({
                userId: user.$id,
                sessionDate: new Date().toISOString(),
                contractions,
            });
            toast({ title: "Session Saved", description: "Your contraction log has been saved." });
            setContractions([]);
            setHistoryPage(0);
            await fetchHistory(0);
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Save Error";
            toast({ title: "Save Error", description: errMsg, variant: "destructive" });
        } finally {
            setIsLoading(prev => ({ ...prev, save: false }));
        }
    };

    const handleDeleteSession = async (sessionId: string) => {
        setIsDeleting(sessionId);
        try {
            await deleteContractionSession(sessionId);
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
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Contraction Timer</CardTitle>
                <CardDescription>Press the button at the start and end of each contraction to log its duration and frequency.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <Button size="lg" onClick={handleToggle} className={`w-full h-24 text-2xl font-bold transition-colors ${isTiming ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                        {isTiming ? `Stop (${elapsed}s)` : 'Start Contraction'}
                    </Button>
                    <div className="space-y-2">
                        <h3 className="font-semibold">Current Session</h3>
                        {contractions.length === 0 ? <p className="text-sm text-gray-500">No contractions logged yet.</p> : (
                            <div className="space-y-1 text-sm border rounded-md p-2">
                                {contractions.map((c, i) => (
                                    <div key={i} className="flex flex-wrap justify-between p-2 bg-gray-50/50 dark:bg-gray-800/20 rounded">
                                        <span className="font-medium">Contraction #{i + 1}</span>
                                        <span>Duration: {formatDuration(c.durationSeconds)}</span>
                                        {i > 0 && <span>Frequency: {formatDuration(c.frequencySeconds)}</span>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <Button onClick={handleSaveSession} disabled={isLoading.save || contractions.length === 0}>
                            {isLoading.save ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Session
                        </Button>
                        <Button variant="outline" onClick={() => setContractions([])} disabled={contractions.length === 0}>Clear Log</Button>
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
                        <div className="space-y-2">
                            <Accordion type="single" collapsible className="w-full">
                                {history.map(session => (
                                    <AccordionItem key={session.$id} value={session.$id}>
                                        <AccordionTrigger className="hover:bg-gray-50 dark:hover:bg-gray-800/50 px-4 rounded-md">
                                            <div className="flex-1 text-left">
                                                <p className="font-medium">{format(new Date(session.sessionDate), "MMMM d, yyyy 'at' h:mm a")}</p>
                                                <p className="text-sm text-muted-foreground">{session.contractions.length} contractions • {formatDistanceToNow(new Date(session.sessionDate), { addSuffix: true })}</p>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pt-2 pb-4 space-y-3">
                                            <div className="space-y-1 text-sm border rounded-md p-2 bg-white dark:bg-gray-900">
                                                {session.contractions.map((c, i) => (
                                                    <div key={i} className="flex flex-wrap justify-between p-2 bg-gray-50/50 dark:bg-gray-800/20 rounded">
                                                        <span className="font-medium">Contraction #{i + 1}</span>
                                                        <span>Duration: {formatDuration(c.durationSeconds)}</span>
                                                        {i > 0 && <span>Frequency: {formatDuration(c.frequencySeconds)}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm" disabled={isDeleting === session.$id}>
                                                        {isDeleting === session.$id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                                        Delete Session
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>This action cannot be undone. This will permanently delete this contraction session from your history.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteSession(session.$id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
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