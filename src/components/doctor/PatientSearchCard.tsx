import React, { useState, useCallback, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserSearch, Search, Loader2, AlertTriangle, UserCircle, Mail, Activity, Inbox } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { searchAssignedPatients, getRecentAssignedPatients, UserProfile } from '@/lib/appwrite';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const PatientSearchCard: React.FC = () => {
    const { user: doctor } = useAuthStore();
    const { toast } = useToast();

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
    const [isLoadingSearch, setIsLoadingSearch] = useState<boolean>(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState<boolean>(false);

    const {
        data: recentPatients = [],
        isLoading: isLoadingInitial,
        isError: isErrorInitial,
        error: initialError,
    } = useQuery<UserProfile[], Error>({
        queryKey: ['recentAssignedPatients', doctor?.$id],
        queryFn: () => getRecentAssignedPatients(doctor!.$id, 10),
        enabled: !!doctor?.$id,
        staleTime: 1000 * 60 * 5, // Data is considered fresh for 5 minutes
        cacheTime: 1000 * 60 * 30, // Data is kept in the cache for 30 minutes
    });

    const handleSearch = useCallback(async () => {
        if (!doctor?.$id) {
            toast({ title: "Error", description: "Cannot perform search. Doctor ID is missing.", variant: "destructive" });
            return;
        }
        if (!searchTerm.trim()) {
            setHasSearched(false);
            setSearchResults([]);
            setSearchError(null);
            return;
        }
        setIsLoadingSearch(true);
        setSearchError(null);
        setHasSearched(true);
        setSearchResults([]);

        try {
            const foundProfiles = await searchAssignedPatients(doctor.$id, searchTerm.trim());
            setSearchResults(foundProfiles);
        } catch (err: any) {
            const errorMessage = err.message?.includes("index")
                ? "Search is not fully configured. Please contact support."
                : err.message || "An error occurred while searching.";
            setSearchError(errorMessage);
            toast({ title: "Search Failed", description: errorMessage, variant: "destructive" });
        } finally {
            setIsLoadingSearch(false);
        }
    }, [searchTerm, toast, doctor?.$id]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = e.target.value;
        setSearchTerm(newSearchTerm);
        if (!newSearchTerm.trim() && hasSearched) {
            setHasSearched(false);
            setSearchResults([]);
            setSearchError(null);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const formatRelativeDate = (dateString: string | undefined): string => {
        if (!dateString) return 'unknown';
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch {
            return 'invalid date';
        }
    };

    const renderPatientList = (patients: UserProfile[], listType: 'initial' | 'search') => {
        if (patients.length === 0) {
            if (listType === 'search') {
                return <p className="text-sm text-center text-gray-500 mt-6">No assigned patients found matching "{searchTerm}".</p>;
            }
            return (
                <div className="flex flex-col items-center text-center py-6 text-gray-400">
                    <Inbox className="h-8 w-8 mb-2" />
                    <p className="text-sm">You have no assigned patients with recent activity.</p>
                </div>
            );
        }

        return (
            <ul className="space-y-3 mt-4 max-h-96 overflow-y-auto pr-2">
                {patients.map((profile) => (
                    <li key={profile.$id} className="flex items-center justify-between space-x-3 p-3 border rounded-md bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-center space-x-3 overflow-hidden">
                             {profile.profilePhotoUrl ? (
                                <img src={profile.profilePhotoUrl} alt={profile.name} className="h-10 w-10 rounded-full object-cover" />
                             ) : (
                                <UserCircle className="h-10 w-10 text-gray-400" />
                             )}
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium truncate">{profile.name}</p>
                                <p className="text-xs text-gray-500 truncate"><Mail className="h-3 w-3 inline mr-1" />{profile.email}</p>
                                <p className="text-xs text-gray-500 mt-1"><Activity className="h-3 w-3 inline mr-1"/>Active: {formatRelativeDate(profile.$updatedAt)}</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" asChild className="flex-shrink-0">
                            <Link to={`/doctor/patient/${profile.userId}`}>View</Link>
                        </Button>
                    </li>
                ))}
            </ul>
        );
    };

    const renderSkeletons = (count = 3) => (
        <div className="space-y-3 mt-4">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 border rounded-md">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5 flex-grow">
                        <Skeleton className="h-4 w-3/5" />
                        <Skeleton className="h-3 w-4/5" />
                    </div>
                    <Skeleton className="h-8 w-16 rounded" />
                </div>
            ))}
        </div>
    );

    const renderContent = () => {
        if (isLoadingInitial) {
            return renderSkeletons(5);
        }
        if (isErrorInitial) {
            return (
                <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Patients</AlertTitle>
                    <AlertDescription>{initialError.message}</AlertDescription>
                </Alert>
            );
        }
        if (hasSearched) {
            if (isLoadingSearch) return renderSkeletons(3);
            if (searchError) {
                 return (
                    <Alert variant="destructive" className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Search Error</AlertTitle>
                        <AlertDescription>{searchError}</AlertDescription>
                    </Alert>
                );
            }
            return renderPatientList(searchResults, 'search');
        }
        return renderPatientList(recentPatients, 'initial');
    };

    return (
        <Card className="shadow-md border dark:border-gray-700">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                    <UserSearch className="h-5 w-5 text-mamasaheli-primary" />
                    Find Your Patient
                </CardTitle>
                <CardDescription>Search within your assigned patients or view recent activity.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex space-x-2">
                    <Input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        disabled={!doctor || isLoadingInitial}
                        className="flex-grow dark:bg-gray-700"
                    />
                    <Button onClick={handleSearch} disabled={!doctor || isLoadingInitial || isLoadingSearch || !searchTerm.trim()}>
                        {isLoadingSearch ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                </div>
                {renderContent()}
            </CardContent>
        </Card>
    );
};

export default PatientSearchCard;