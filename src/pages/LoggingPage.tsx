import React from 'react';
import { HeartPulse, Footprints, Timer, Smile,Camera } from 'lucide-react';

import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {SymptomLogger} from "@/components/logging/SymptomLogger";
import {VitalsLogger} from "@/components/logging/VitalsLogger";
import {KickCounter} from "@/components/logging/KickCounter";
import {ContractionTimer} from "@/components/logging/ContractionTimer";
import {WeeklyPhotoLogger} from "@/components/logging/WeeklyPhotoLogger";
const LoggingPage: React.FC = () => {
    return (
        <MainLayout requireAuth>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
                <header className="mb-8 md:mb-10 text-center sm:text-left">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Daily Logging
                    </h1>
                    <p className="mt-2 text-base text-gray-600">
                        Track your symptoms, vitals, and baby's movements.
                    </p>
                </header>
                <Tabs defaultValue="symptoms" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 h-auto gap-1 sm:gap-2">
                        <TabsTrigger value="symptoms" className="flex-col sm:flex-row h-auto py-2 gap-1 sm:gap-2 text-xs sm:text-sm whitespace-normal">
                            <Smile className="h-5 w-5" />
                            <span className="text-center">Symptoms</span>
                        </TabsTrigger>
                        <TabsTrigger value="vitals" className="flex-col sm:flex-row h-auto py-2 gap-1 sm:gap-2 text-xs sm:text-sm whitespace-normal">
                            <HeartPulse className="h-5 w-5" />
                            <span className="text-center">Health Vitals</span>
                        </TabsTrigger>
                        <TabsTrigger value="kicks" className="flex-col sm:flex-row h-auto py-2 gap-1 sm:gap-2 text-xs sm:text-sm whitespace-normal">
                            <Footprints className="h-5 w-5" />
                            <span className="text-center">Kick Counter</span>
                        </TabsTrigger>
                        <TabsTrigger value="contractions" className="flex-col sm:flex-row h-auto py-2 gap-1 sm:gap-2 text-xs sm:text-sm whitespace-normal">
                            <Timer className="h-5 w-5" />
                            <span className="text-center">Contraction Timer</span>
                        </TabsTrigger>
                        <TabsTrigger value="photos" className="flex-col sm:flex-row h-auto py-2 gap-1 sm:gap-2 text-xs sm:text-sm whitespace-normal">
                            <Camera className="h-5 w-5" />
                            <span className="text-center">Weekly Photo</span>
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="symptoms" className="mt-6"><SymptomLogger /></TabsContent>
                    <TabsContent value="vitals" className="mt-6"><VitalsLogger /></TabsContent>
                    <TabsContent value="kicks" className="mt-6"><KickCounter /></TabsContent>
                    <TabsContent value="contractions" className="mt-6"><ContractionTimer /></TabsContent>
                    <TabsContent value="photos" className="mt-6"><WeeklyPhotoLogger /></TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
};

export default LoggingPage;