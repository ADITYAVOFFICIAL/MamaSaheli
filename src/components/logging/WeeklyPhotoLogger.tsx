import React, { useState, useEffect, useCallback, ChangeEvent, useMemo, memo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import {
    createWeeklyPhotoLog, getWeeklyPhotoLogs, deleteWeeklyPhotoLog, getUserProfile,
    getFilePreview, weeklyPhotosBucketId, WeeklyPhotoLog,
} from '@/lib/appwrite';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Loader2, UploadCloud, Trash2, Camera, Inbox, Plus, ImageOff, Download, Replace } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const UploadModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    weekNumber: number | null;
    onSaveSuccess: () => void;
    existingLog?: WeeklyPhotoLog | null;
}> = ({ isOpen, onClose, weekNumber, onSaveSuccess, existingLog }) => {
    const { user } = useAuthStore();
    const { toast } = useToast();
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const isReplacing = !!existingLog;

    useEffect(() => {
        if (!isOpen) {
            setPhotoFile(null);
            setPreviewUrl(null);
            setNotes('');
        } else if (existingLog) {
            setNotes(existingLog.notes || '');
        }
    }, [isOpen, existingLog]);

    useEffect(() => {
        if (!photoFile) {
            setPreviewUrl(null);
            return;
        }
        const objectUrl = URL.createObjectURL(photoFile);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [photoFile]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast({ title: "Invalid File", description: "Please select an image file.", variant: "destructive" });
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast({ title: "File Too Large", description: "Image must be smaller than 10MB.", variant: "destructive" });
            return;
        }
        setPhotoFile(file);
    };

    const handleSave = async () => {
        if (!user?.$id || !photoFile || weekNumber === null) {
            toast({ title: "Missing Information", description: "A photo is required to save.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            if (isReplacing && existingLog) {
                await deleteWeeklyPhotoLog(existingLog.$id, existingLog.photoFileId);
            }
            await createWeeklyPhotoLog({ userId: user.$id, weekNumber, photoFile, notes });
            toast({ title: `Photo ${isReplacing ? 'Replaced' : 'Saved'}`, description: `Your photo for week ${weekNumber} has been updated.` });
            onSaveSuccess();
            onClose();
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : `Failed to ${isReplacing ? 'replace' : 'save'} photo.`;
            toast({ title: "Error", description: errMsg, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    if (weekNumber === null) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isReplacing ? 'Replace' : 'Upload'} Photo for Week {weekNumber}</DialogTitle>
                    <DialogDescription>{isReplacing ? 'Upload a new photo to replace the existing one.' : 'Capture your progress for this week.'}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {previewUrl && (
                        <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden flex items-center justify-center">
                            <img src={previewUrl} alt="Selected preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="modal-photo-upload">Select Photo *</Label>
                        <Input id="modal-photo-upload" type="file" accept="image/*" onChange={handleFileChange} disabled={isSaving} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="modal-photo-notes">Notes (Optional)</Label>
                        <Textarea id="modal-photo-notes" placeholder="How are you feeling this week?" value={notes} onChange={(e) => setNotes(e.target.value)} disabled={isSaving} />
                    </div>
                </div>
                <DialogFooter className="sm:justify-between">
                    <DialogClose asChild><Button type="button" variant="outline" disabled={isSaving}>Cancel</Button></DialogClose>
                    <Button onClick={handleSave} disabled={isSaving || !photoFile}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                        {isReplacing ? 'Replace & Save' : 'Save Photo'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const ViewAndManageModal: React.FC<{
    log: WeeklyPhotoLog | null;
    isOpen: boolean;
    onClose: () => void;
    onDelete: (log: WeeklyPhotoLog) => void;
    onReplace: (log: WeeklyPhotoLog) => void;
}> = ({ log, isOpen, onClose, onDelete, onReplace }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoadingUrl, setIsLoadingUrl] = useState(true);
    const [errorUrl, setErrorUrl] = useState(false);

    useEffect(() => {
        if (isOpen && log?.photoFileId) {
            setIsLoadingUrl(true);
            setErrorUrl(false);
            try {
                const url = getFilePreview(log.photoFileId, weeklyPhotosBucketId)?.href; // <-- FIXED ARG ORDER
                setImageUrl(url);
            } catch {
                setErrorUrl(true);
            } finally {
                setIsLoadingUrl(false);
            }
        }
    }, [isOpen, log]);

    if (!log) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Week {log.weekNumber} Photo</DialogTitle>
                    <DialogDescription>{formatDistanceToNow(new Date(log.loggedAt), { addSuffix: true })}</DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                    <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                        {isLoadingUrl && <Loader2 className="h-8 w-8 animate-spin text-gray-400" />}
                        {errorUrl && <div className="text-red-500 flex flex-col items-center gap-2"><ImageOff className="h-10 w-10" /><span className="text-xs">Image Error</span></div>}
                        {!isLoadingUrl && !errorUrl && imageUrl && <img src={imageUrl} alt={`Week ${log.weekNumber}`} className="w-full h-full object-contain" />}
                    </div>
                    {log.notes && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-gray-600">
                            <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{log.notes}"</p>
                        </div>
                    )}
                </div>
                <DialogFooter className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-2">
                    <Button variant="outline" asChild disabled={!imageUrl}>
                        <a href={imageUrl || '#'} download={`week-${log.weekNumber}-photo.jpg`}><Download className="mr-2 h-4 w-4" /> Download</a>
                    </Button>
                    <Button variant="secondary" onClick={() => onReplace(log)}><Replace className="mr-2 h-4 w-4" /> Replace</Button>
                    <Button variant="destructive" onClick={() => onDelete(log)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const WeeklyPhotoTile: React.FC<{
    weekNumber: number;
    log: WeeklyPhotoLog | undefined;
    onAdd: (week: number) => void;
    onView: (log: WeeklyPhotoLog) => void;
}> = memo(({ weekNumber, log, onAdd, onView }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoadingUrl, setIsLoadingUrl] = useState(true);
    const [errorUrl, setErrorUrl] = useState(false);

    useEffect(() => {
        if (log?.photoFileId) {
            setIsLoadingUrl(true);
            setErrorUrl(false);
            try {
                const url = getFilePreview(log.photoFileId, weeklyPhotosBucketId)?.href; // <-- FIXED ARG ORDER
                setImageUrl(url);
            } catch (error) {
                setErrorUrl(true);
            } finally {
                setIsLoadingUrl(false);
            }
        } else {
            setIsLoadingUrl(false);
        }
    }, [log]);

    if (log) {
        return (
            <button
                onClick={() => onView(log)}
                className="relative group aspect-square rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-mamasaheli-primary focus-visible:ring-offset-2"
            >
                {isLoadingUrl && <div className="w-full h-full flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>}
                {errorUrl && <div className="w-full h-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500"><ImageOff className="h-8 w-8" /></div>}
                {!isLoadingUrl && !errorUrl && imageUrl && <img src={imageUrl} alt={`Week ${log.weekNumber}`} className="w-full h-full object-cover" onError={() => setErrorUrl(true)} />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                    <span className="font-bold text-sm text-white drop-shadow-md">Week {log.weekNumber}</span>
                </div>
            </button>
        );
    }

    return (
        <button
            onClick={() => onAdd(weekNumber)}
            className="w-full h-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-mamasaheli-primary dark:hover:border-mamasaheli-accent hover:text-mamasaheli-primary dark:hover:text-mamasaheli-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-mamasaheli-primary focus-visible:ring-offset-2"
        >
            <Plus className="h-8 w-8" />
            <span className="text-sm font-medium mt-1">Week {weekNumber}</span>
        </button>
    );
});

export const WeeklyPhotoLogger = () => {
    const { user } = useAuthStore();
    const { toast } = useToast();
    const [currentWeek, setCurrentWeek] = useState<number | null>(null);
    const [history, setHistory] = useState<WeeklyPhotoLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingLogId, setDeletingLogId] = useState<string | null>(null);
    const [logToDelete, setLogToDelete] = useState<WeeklyPhotoLog | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedWeekForModal, setSelectedWeekForModal] = useState<number | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedLogForView, setSelectedLogForView] = useState<WeeklyPhotoLog | null>(null);
    const [logToReplace, setLogToReplace] = useState<WeeklyPhotoLog | null>(null);

    const fetchData = useCallback(async () => {
        if (!user?.$id) { setIsLoading(false); return; }
        setIsLoading(true);
        try {
            const [profile, logs] = await Promise.all([getUserProfile(user.$id), getWeeklyPhotoLogs(user.$id)]);
            setCurrentWeek(profile?.weeksPregnant ?? null);
            setHistory(logs);
        } catch (error) {
            toast({ title: "Error", description: "Could not load your weekly photo data.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [user?.$id, toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const historyMap = useMemo(() => {
        const map = new Map<number, WeeklyPhotoLog>();
        history.forEach(log => map.set(log.weekNumber, log));
        return map;
    }, [history]);

    const handleOpenUploadModal = (week: number) => {
        setSelectedWeekForModal(week);
        setIsUploadModalOpen(true);
    };

    const handleOpenViewModal = (log: WeeklyPhotoLog) => {
        setSelectedLogForView(log);
        setIsViewModalOpen(true);
    };

    const handleDeleteRequest = (log: WeeklyPhotoLog) => {
        setLogToDelete(log);
    };

    const handleReplaceRequest = (log: WeeklyPhotoLog) => {
        setIsViewModalOpen(false);
        setLogToReplace(log);
        setSelectedWeekForModal(log.weekNumber);
        setIsUploadModalOpen(true);
    };

    const confirmDelete = async () => {
        const log = logToDelete;
        if (!log) return;
        setDeletingLogId(log.$id);
        setIsViewModalOpen(false);
        try {
            await deleteWeeklyPhotoLog(log.$id, log.photoFileId);
            toast({ title: "Photo Deleted", description: `Photo for week ${log.weekNumber} has been deleted.` });
            fetchData();
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Failed to delete photo.";
            toast({ title: "Delete Failed", description: errMsg, variant: "destructive" });
        } finally {
            setDeletingLogId(null);
            setLogToDelete(null);
        }
    };

    const renderGallery = () => {
        if (currentWeek === null || currentWeek < 1) {
            return (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    <Inbox className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2">Update your profile with your current pregnancy week to start your photo gallery.</p>
                </div>
            );
        }

        const weeksArray = Array.from({ length: currentWeek }, (_, i) => i + 1);

        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {weeksArray.map(week => (
                    <WeeklyPhotoTile
                        key={week}
                        weekNumber={week}
                        log={historyMap.get(week)}
                        onAdd={handleOpenUploadModal}
                        onView={handleOpenViewModal}
                    />
                ))}
            </div>
        );
    };

    return (
        <>
            <Card className="col-span-full">
                <CardHeader>
                    <CardTitle className="flex items-center"><Camera className="mr-2 h-5 w-5 text-mamasaheli-primary" /> Weekly Photo Gallery</CardTitle>
                    <CardDescription>Track your pregnancy progress. Click a tile to add or view a photo.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
                    ) : (
                        renderGallery()
                    )}
                </CardContent>
            </Card>

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => { setIsUploadModalOpen(false); setLogToReplace(null); }}
                weekNumber={selectedWeekForModal}
                onSaveSuccess={fetchData}
                existingLog={logToReplace}
            />

            <ViewAndManageModal
                isOpen={isViewModalOpen}
                log={selectedLogForView}
                onClose={() => setIsViewModalOpen(false)}
                onDelete={handleDeleteRequest}
                onReplace={handleReplaceRequest}
            />

            <AlertDialog open={!!logToDelete} onOpenChange={(open) => !open && setLogToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Photo?</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure you want to delete the photo for Week {logToDelete?.weekNumber}? This cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                            {deletingLogId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};