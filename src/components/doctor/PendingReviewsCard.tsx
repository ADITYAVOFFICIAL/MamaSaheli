// src/components/doctor/PendingReviewsCard.tsx
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FileText, AlertTriangle, RefreshCw, UserCircle, Download } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import {
    // MODIFIED: Import the new doctor-specific function
    getDocumentsForDoctor,
    getUserProfilesByIds,
    getFilePreview,
    medicalBucketId,
    MedicalDocument,
    UserProfile,
} from '@/lib/appwrite';
import { useToast } from '@/hooks/use-toast';

const PendingReviewsCard: React.FC = () => {
    const { toast } = useToast();
    // Get the currently logged-in doctor's user object
    const { user: doctor } = useAuthStore();

    // 1. Fetch documents specifically for the logged-in doctor
    const {
        data: documentsData,
        isLoading: isLoadingDocuments,
        isError: isErrorDocuments,
        error: documentsError,
        refetch: refetchDocuments,
    } = useQuery<MedicalDocument[], Error>({
        // MODIFIED: Query key is now specific to the doctor
        queryKey: ['doctorRecentDocuments', doctor?.$id],
        // MODIFIED: Use the new getDocumentsForDoctor function
        queryFn: () => getDocumentsForDoctor(doctor!.$id),
        // MODIFIED: Only run the query if the doctor's ID is available
        enabled: !!doctor?.$id,
    });

    // 2. Extract unique user IDs from the fetched documents
    const patientUserIds = useMemo(() => {
        if (!documentsData) return [];
        const ids = documentsData.map(doc => doc.userId);
        return [...new Set(ids)];
    }, [documentsData]);

    // 3. Fetch profiles for ONLY the relevant patients
    const {
        data: patientProfilesMap,
        isLoading: isLoadingProfiles,
    } = useQuery<Map<string, UserProfile>, Error>({
        queryKey: ['patientProfilesForDoctorDocuments', patientUserIds],
        queryFn: () => getUserProfilesByIds(patientUserIds),
        enabled: patientUserIds.length > 0,
    });

    // Combine loading states
    const isLoading = isLoadingDocuments || (patientUserIds.length > 0 && isLoadingProfiles);

    const handleRefresh = () => {
        refetchDocuments();
    };

    const handleViewDocument = (fileId: string, fileName: string) => {
        if (!medicalBucketId) {
            toast({ title: "Configuration Error", description: "Storage not configured.", variant: "destructive" });
            return;
        }
        try {
            const fileUrl = getFilePreview(fileId, medicalBucketId);
            window.open(fileUrl.href, '_blank', 'noopener,noreferrer');
        } catch (error: any) {
            toast({ title: "Error", description: `Failed to get document link: ${error.message}`, variant: "destructive" });
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-start justify-between space-x-3 p-3">
                            <div className="flex items-start space-x-3 flex-grow overflow-hidden">
                                <Skeleton className="h-10 w-10 rounded-full mt-1" />
                                <div className="space-y-1.5 flex-grow">
                                    <Skeleton className="h-4 w-4/5" />
                                    <Skeleton className="h-3 w-3/5" />
                                </div>
                            </div>
                             <Skeleton className="h-8 w-20 rounded flex-shrink-0" />
                        </div>
                    ))}
                </div>
            );
        }

        if (isErrorDocuments) {
            return (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Documents</AlertTitle>
                    <AlertDescription>{documentsError?.message}</AlertDescription>
                </Alert>
            );
        }

        if (!documentsData || documentsData.length === 0) {
            return <p className="text-sm text-center text-gray-500 py-6">No recent documents from your assigned patients.</p>;
        }

        // Documents are already sorted by API, no need to re-sort
        return (
            <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {documentsData.map((doc) => {
                    const patientProfile = patientProfilesMap?.get(doc.userId);
                    return (
                        <li key={doc.$id} className="flex items-start justify-between space-x-3 p-3 border rounded-md bg-white dark:bg-gray-800/50">
                           <div className="flex items-start space-x-3 flex-grow overflow-hidden">
                                {patientProfile?.profilePhotoUrl ? (
                                    <img src={patientProfile.profilePhotoUrl} alt={patientProfile.name} className="h-10 w-10 rounded-full object-cover flex-shrink-0 mt-1" />
                                ) : (
                                    <UserCircle className="h-10 w-10 text-gray-400 flex-shrink-0 mt-1" />
                                )}
                                <div className="flex-grow overflow-hidden">
                                    <p className="text-sm font-medium truncate" title={doc.fileName}>
                                        {doc.fileName}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                        Patient: {patientProfile?.name || 'Loading...'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Uploaded: {formatDistanceToNow(parseISO(doc.$createdAt), { addSuffix: true })}
                                    </p>
                                    <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs mt-1 mr-2">
                                        <Link to={`/doctor/patient/${doc.userId}`}>View Patient</Link>
                                    </Button>
                                </div>
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleViewDocument(doc.fileId, doc.fileName)}
                                className="flex-shrink-0"
                            >
                                <Download className="h-3.5 w-3.5 mr-1" /> View
                            </Button>
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <Card className="shadow-md border dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <div>
                    <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                        <FileText className="h-5 w-5 text-mamasaheli-accent" />
                        Recent Documents
                    </CardTitle>
                    <CardDescription>Documents from your assigned patients.</CardDescription>
                 </div>
                 <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isLoading} aria-label="Refresh documents">
                     <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                 </Button>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    );
};

export default PendingReviewsCard;