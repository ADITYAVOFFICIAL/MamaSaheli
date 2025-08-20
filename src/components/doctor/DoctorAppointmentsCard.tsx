import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, isPast } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CalendarCheck, AlertTriangle, RefreshCw, UserCircle, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import {
    getAppointmentsForDoctor,
    getUserProfilesByIds,
    Appointment,
    UserProfile,
} from '@/lib/appwrite';

const DoctorAppointmentsCard: React.FC = () => {
    const { user: doctor } = useAuthStore();

    const {
        data: appointmentsData,
        isLoading: isLoadingAppointments,
        isError: isErrorAppointments,
        error: appointmentsError,
        refetch: refetchAppointments,
    } = useQuery<Appointment[], Error>({
        queryKey: ['doctorAppointments', doctor?.$id],
        queryFn: () => getAppointmentsForDoctor(doctor!.$id),
        enabled: !!doctor?.$id,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30, // Corrected: Renamed from cacheTime to gcTime for React Query v5
    });

    const patientUserIds = useMemo(() => {
        if (!appointmentsData) return [];
        const ids = appointmentsData.map(app => app.userId);
        return [...new Set(ids)];
    }, [appointmentsData]);

    const {
        data: patientProfilesMap,
        isLoading: isLoadingProfiles,
        refetch: refetchPatientProfiles,
    } = useQuery<Map<string, UserProfile>, Error>({
        queryKey: ['patientProfilesForDoctorAppointments', patientUserIds],
        queryFn: () => getUserProfilesByIds(patientUserIds),
        enabled: patientUserIds.length > 0,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30, // Corrected: Renamed from cacheTime to gcTime for React Query v5
    });

    const isLoading = isLoadingAppointments || (patientUserIds.length > 0 && isLoadingProfiles);

    const handleRefresh = () => {
        refetchAppointments();
        refetchPatientProfiles();
    };

    const formatAppointmentType = (type: string | undefined) => {
        if (!type) return 'General';
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                         <div key={i} className="flex items-start space-x-3 p-3">
                            <Skeleton className="h-10 w-10 rounded-full mt-1" />
                            <div className="space-y-1.5 flex-grow">
                                <Skeleton className="h-4 w-3/5" />
                                <Skeleton className="h-3 w-4/5" />
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (isErrorAppointments) {
            return (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Appointments</AlertTitle>
                    <AlertDescription>{appointmentsError?.message}</AlertDescription>
                </Alert>
            );
        }

        if (!appointmentsData || appointmentsData.length === 0) {
            return <p className="text-sm text-center text-gray-500 py-6">You have no upcoming appointments with your assigned patients.</p>;
        }

        const sortedAppointments = [...appointmentsData].sort((a, b) =>
            parseISO(a.date).getTime() - parseISO(b.date).getTime()
        );

        return (
            <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {sortedAppointments.map((appointment) => {
                    const patientProfile = patientProfilesMap?.get(appointment.userId);
                    const appointmentDate = parseISO(appointment.date);

                    return (
                        <li key={appointment.$id} className="flex items-start space-x-3 p-3 border rounded-md bg-white dark:bg-gray-800/50">
                            {patientProfile?.profilePhotoUrl ? (
                                <img src={patientProfile.profilePhotoUrl} alt={patientProfile.name} className="h-10 w-10 rounded-full object-cover flex-shrink-0 mt-1" />
                             ) : (
                                <UserCircle className="h-10 w-10 text-gray-400 flex-shrink-0 mt-1" />
                             )}
                            <div className="flex-grow overflow-hidden">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-medium truncate pr-2">
                                        {patientProfile?.name || 'Loading patient...'}
                                    </p>
                                    <Badge variant="secondary" className="text-xs whitespace-nowrap">
                                        {formatAppointmentType(appointment.appointmentType)}
                                    </Badge>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                                    <CalendarCheck className="h-3 w-3" />
                                    {format(appointmentDate, 'eee, MMM d, yyyy')}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {appointment.time}
                                    {isPast(appointmentDate) && <Badge variant="outline" className="ml-2 text-xs">Past</Badge>}
                                </p>
                                <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs mt-1">
                                     <Link to={`/doctor/patient/${appointment.userId}`}>View Patient</Link>
                                </Button>
                            </div>
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
                        <CalendarCheck className="h-5 w-5 text-mamasaheli-secondary" />
                        Your Appointments
                    </CardTitle>
                    <CardDescription>Appointments with your assigned patients.</CardDescription>
                </div>
                 <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isLoading} aria-label="Refresh appointments">
                     <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                 </Button>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    );
};

export default DoctorAppointmentsCard;