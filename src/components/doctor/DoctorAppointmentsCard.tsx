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
        gcTime: 1000 * 60 * 30,
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
        gcTime: 1000 * 60 * 30,
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

    const upcomingAppointments = useMemo(() => {
    if (!appointmentsData) return [];

    return appointmentsData
        .filter(appointment => {
            // Combine date and time into a single Date object
            const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
            return appointmentDateTime > new Date();
        })
        .sort((a, b) => {
            const aDateTime = new Date(`${a.date}T${a.time}`);
            const bDateTime = new Date(`${b.date}T${b.time}`);
            return aDateTime.getTime() - bDateTime.getTime();
        });
}, [appointmentsData]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-4 p-1">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2 flex-grow">
                                <Skeleton className="h-4 w-4/5" />
                                <Skeleton className="h-4 w-3/5" />
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

        if (!upcomingAppointments || upcomingAppointments.length === 0) {
            return (
                <div className="text-center py-8">
                    <CalendarCheck className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-sm text-gray-500">
                        You have no upcoming appointments.
                    </p>
                </div>
            );
        }

        return (
            <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {upcomingAppointments.map((appointment) => {
                    const patientProfile = patientProfilesMap?.get(appointment.userId);
                    const appointmentDate = parseISO(appointment.date);

                    return (
                        <li key={appointment.$id} className="flex items-start space-x-3 p-3 border rounded-lg bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                            {patientProfile?.profilePhotoUrl ? (
                                <img src={patientProfile.profilePhotoUrl} alt={patientProfile.name} className="h-11 w-11 rounded-full object-cover flex-shrink-0 mt-1" />
                            ) : (
                                <UserCircle className="h-11 w-11 text-gray-400 flex-shrink-0 mt-1" />
                            )}
                            <div className="flex-grow overflow-hidden">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                    <p className="text-base font-semibold truncate pr-2">
                                        {patientProfile?.name || 'Loading patient...'}
                                    </p>
                                    <Badge variant="secondary" className="text-xs whitespace-nowrap mt-1 sm:mt-0">
                                        {formatAppointmentType(appointment.appointmentType)}
                                    </Badge>
                                </div>
                                <div className="mt-2 space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-1.5">
                                        <CalendarCheck className="h-3.5 w-3.5" />
                                        <span>{format(appointmentDate, 'eee, MMM d, yyyy')}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>{appointment.time}</span>
                                    </div>
                                </div>
                                <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs mt-2 font-semibold">
                                    <Link to={`/doctor/patient/${appointment.userId}`}>View Patient Details</Link>
                                </Button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <Card className="shadow-lg border dark:border-gray-700 w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="grid gap-1.5">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold">
                        <CalendarCheck className="h-6 w-6 text-mamasaheli-secondary" />
                        Upcoming Appointments
                    </CardTitle>
                    <CardDescription>Appointments with your assigned patients.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isLoading} aria-label="Refresh appointments">
                    <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    );
};

export default DoctorAppointmentsCard;