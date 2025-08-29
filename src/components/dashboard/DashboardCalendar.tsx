import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  format,
  parseISO,
  startOfWeek,
  isSameDay,
  addWeeks,
  isValid,
} from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CalendarDays,
  Smile,
  Camera,
  Stethoscope,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import {
  getUserProfile,
  getUserAppointments,
  getSymptomLogs,
  getWeeklyPhotoLogs,
  UserProfile,
  Appointment,
  SymptomLog,
  WeeklyPhotoLog,
} from '@/lib/appwrite';
import { DayContentProps } from 'react-day-picker';
import { cn } from '@/lib/utils';

type DailyEventType = {
  symptoms?: boolean;
  photo?: boolean;
  appointment?: boolean;
  weekStart?: number;
};

type EventsMap = Record<string, DailyEventType>;

const DayContentWithEvents: React.FC<DayContentProps & { events: EventsMap }> = ({
  date,
  events,
}) => {
  const dayKey = format(date, 'yyyy-MM-dd');
  const event = events[dayKey];
  const isToday = isSameDay(date, new Date());

  const tooltipContent = useMemo(() => {
    if (!event) return null;
    return (
      <ul className="space-y-1 text-xs">
        {event.weekStart && (
          <li className="font-semibold">Start of Week {event.weekStart}</li>
        )}
        {event.appointment && (
          <li className="flex items-center">
            <Stethoscope className="inline h-3 w-3 mr-1.5 text-green-500" />
            Appointment
          </li>
        )}
        {event.symptoms && (
          <li className="flex items-center">
            <Smile className="inline h-3 w-3 mr-1.5 text-blue-500" />
            Symptoms Logged
          </li>
        )}
        {event.photo && (
          <li className="flex items-center">
            <Camera className="inline h-3 w-3 mr-1.5 text-purple-500" />
            Photo Logged
          </li>
        )}
      </ul>
    );
  }, [event]);

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'relative w-full h-full flex items-center justify-center rounded-md',
              isToday && 'bg-primary/10 text-white font-bold'
            )}
          >
            {date.getDate()}
            {event && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center justify-center gap-0.5">
                {event.symptoms && <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
                {event.appointment && <div className="h-1.5 w-1.5 rounded-full bg-green-500" />}
                {event.photo && <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />}
              </div>
            )}
            {event?.weekStart && (
              <Badge
                variant="outline"
                className="absolute -top-1.5 left-0 text-[9px] h-4 px-1 leading-none transform scale-75 border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-900/50 dark:text-blue-200"
              >
                W{event.weekStart}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        {tooltipContent && <TooltipContent>{tooltipContent}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
};

export const DashboardCalendar: React.FC = () => {
  const { user } = useAuthStore();
  const [month, setMonth] = useState<Date>(new Date());

  const {
    data: combinedData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['dashboardCalendarData', user?.$id],
    queryFn: async () => {
      if (!user?.$id) throw new Error('User not authenticated');
      const [profile, appointments, symptoms, photos] = await Promise.all([
        getUserProfile(user.$id),
        getUserAppointments(user.$id),
        getSymptomLogs(user.$id),
        getWeeklyPhotoLogs(user.$id),
      ]);
      return { profile, appointments, symptoms, photos };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const eventsMap = useMemo<EventsMap>(() => {
    const map: EventsMap = {};
    if (!combinedData) return map;

    const { profile, appointments, symptoms, photos } = combinedData;

    appointments.forEach((app) => {
      if (isValid(parseISO(app.date))) {
        const key = format(parseISO(app.date), 'yyyy-MM-dd');
        map[key] = { ...map[key], appointment: true };
      }
    });

    symptoms.forEach((log) => {
      if (isValid(parseISO(log.loggedAt))) {
        const key = format(parseISO(log.loggedAt), 'yyyy-MM-dd');
        map[key] = { ...map[key], symptoms: true };
      }
    });

    photos.forEach((log) => {
      if (isValid(parseISO(log.loggedAt))) {
        const key = format(parseISO(log.loggedAt), 'yyyy-MM-dd');
        map[key] = { ...map[key], photo: true };
      }
    });

    if (profile?.lmpDate) {
      const lmp = parseISO(profile.lmpDate);
      if (isValid(lmp)) {
        const firstDayOfWeek = startOfWeek(lmp);
        for (let i = 1; i <= 42; i++) {
          const weekStartDate = addWeeks(firstDayOfWeek, i - 1);
          const key = format(weekStartDate, 'yyyy-MM-dd');
          map[key] = { ...map[key], weekStart: i };
        }
      }
    }

    return map;
  }, [combinedData]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center p-4">
          <Skeleton className="h-8 w-40 mb-4 rounded-md" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="p-4 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-destructive mb-2" />
          <p className="text-sm text-destructive">Failed to load calendar data.</p>
        </div>
      );
    }

    return (
      <Calendar
        month={month}
        onMonthChange={setMonth}
        components={{ DayContent: (props) => <DayContentWithEvents {...props} events={eventsMap} /> }}
        className="w-full"
        classNames={{
          cell: 'h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20 sm:h-11 sm:w-11 rounded-md',
          day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 sm:h-11 sm:w-11 rounded-md',
          day_today: 'bg-accent text-accent-foreground rounded-md',
          day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md',
        }}
      />
    );
  };

  return (
    <Card className="shadow-sm border dark:border-gray-700 h-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold">
          <CalendarDays className="mr-2 h-5 w-5 text-mamasaheli-primary" />
          Your Journey Calendar
        </CardTitle>
        <CardDescription>
          A monthly overview of your appointments, logs, and milestones.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2 sm:p-4">
        {renderContent()}
        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Smile className="h-3.5 w-3.5 text-blue-500" /> Symptoms
          </div>
          <div className="flex items-center gap-1.5">
            <Stethoscope className="h-3.5 w-3.5 text-green-500" /> Appointment
          </div>
          <div className="flex items-center gap-1.5">
            <Camera className="h-3.5 w-3.5 text-purple-500" /> Photo
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="h-4 px-1.5 text-[9px]">
              W#
            </Badge>
            Week Start
          </div>
        </div>
      </CardContent>
    </Card>
  );
};