import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Loader2, Trash2, Edit, HeartPulse, Droplet, Scale, BarChart3, List, X as CloseIcon } from 'lucide-react';
import { format } from 'date-fns';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import type { BloodPressureReading, BloodSugarReading, WeightReading } from '@/lib/appwrite';
import {
    deleteBloodPressureReading,
    deleteBloodSugarReading,
    deleteWeightReading,
    updateBloodPressureReading,
    updateBloodSugarReading,
    updateWeightReading,
} from '@/lib/appwrite';
import EditHealthReadingModal from './EditHealthReadingModal';

// --- ReadingListItem Component (for displaying individual readings) ---
interface ReadingListItemProps {
    reading: any;
    type: 'bp' | 'sugar' | 'weight';
    onDelete: (id: string, type: 'bp' | 'sugar' | 'weight') => void;
    isDeleting: boolean;
    onEdit?: (reading: any, type: 'bp' | 'sugar' | 'weight') => void;
}

const ReadingListItem: React.FC<ReadingListItemProps> = ({ reading, type, onDelete, isDeleting, onEdit }) => {
    const dateToFormat = reading.recordedAt ? new Date(reading.recordedAt) : new Date(reading.$createdAt);
    let formattedDate = "Invalid Date";
    if (!isNaN(dateToFormat.getTime())) {
        formattedDate = format(dateToFormat, 'MMM d, HH:mm');
    }

    let value = '';
    let unit = '';

    if (type === 'bp' && reading.systolic !== undefined && reading.diastolic !== undefined) {
        value = `${reading.systolic}/${reading.diastolic}`;
        unit = 'mmHg';
    } else if (type === 'sugar' && reading.level !== undefined) {
        value = `${reading.level}`;
        unit = `mg/dL ${reading.measurementType ? `(${reading.measurementType})` : ''}`.trim();
    } else if (type === 'weight' && reading.weight !== undefined) {
        value = `${reading.weight}`;
        unit = reading.unit || '';
    } else {
        value = 'N/A';
    }

    const handleDeleteClick = () => {
        if (reading?.$id && !isDeleting) {
            onDelete(reading.$id, type);
        }
    };

    return (
        <div className="flex justify-between items-center py-1.5 border-b last:border-b-0 text-xs group">
            <div className="flex-grow mr-2">
                <span className="text-gray-500 block">{formattedDate}</span>
                <span className="font-medium text-gray-700 dark:text-gray-200">{value} {unit}</span>
            </div>
            <div className="flex gap-1">
                <button
                    onClick={() => onEdit && onEdit(reading, type)}
                    className="p-1 text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                    aria-label={`Edit ${type} reading from ${formattedDate}`}
                    title="Edit this reading"
                >
                    <Edit className="h-3.5 w-3.5" />
                </button>
                <button
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                    className={`p-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed ${isDeleting ? 'opacity-100' : ''}`}
                    aria-label={`Delete ${type} reading from ${formattedDate}`}
                    title="Delete this reading"
                >
                    {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </button>
            </div>
        </div>
    );
};


// --- HealthChart Component (for rendering line charts) ---
interface HealthChartProps {
    data: any[];
    dataKey: string | string[];
    unit?: string;
    name: string | string[];
    color: string | string[];
    height?: number;
}

const HealthChart: React.FC<HealthChartProps> = ({ data, dataKey, unit, name, color, height = 200 }) => {
    const formattedData = data
        .map(d => ({ ...d, timestamp: new Date(d.recordedAt || d.$createdAt).getTime() }))
        .filter(d => !isNaN(d.timestamp))
        .sort((a, b) => a.timestamp - b.timestamp);

    if (!formattedData || formattedData.length < 2) {
        return <div className="flex items-center justify-center h-full text-xs text-gray-400 text-center py-8">Not enough data to display a trend.</div>;
    }

    const allValues = formattedData.flatMap(item =>
        Array.isArray(dataKey) ? dataKey.map(key => item[key]) : [item[dataKey]]
    ).filter((val): val is number => typeof val === 'number' && !isNaN(val));

    const minY = allValues.length > 0 ? Math.min(...allValues) : 0;
    const maxY = allValues.length > 0 ? Math.max(...allValues) : 100;
    const padding = (maxY - minY) * 0.15 || 5;

    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={formattedData} margin={{ top: 5, right: 15, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                    dataKey="timestamp"
                    fontSize={10}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    interval="preserveStartEnd"
                    padding={{ left: 20, right: 20 }}
                    dy={5}
                    tickFormatter={(timestamp) => format(new Date(timestamp), 'MMM d')}
                />
                <YAxis fontSize={10} tick={{ fill: 'hsl(var(--muted-foreground))' }} domain={[Math.max(0, Math.floor(minY - padding)), Math.ceil(maxY + padding)]} unit={unit ? ` ${unit}` : ''} allowDecimals={false} width={40} dx={-2} />
                <Tooltip
                    contentStyle={{ fontSize: '12px', padding: '4px 8px', borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))' }}
                    labelFormatter={(timestamp) => format(new Date(timestamp), 'MMM d, yyyy HH:mm')}
                    formatter={(value, tooltipName, props) => {
                        const { payload } = props;
                        if (tooltipName === 'Systolic' || tooltipName === 'Diastolic') {
                            return [`${value} ${unit || 'mmHg'}`, tooltipName];
                        }
                        if (dataKey === 'level' && payload.measurementType) {
                            return [`${value} ${unit || ''} (${payload.measurementType})`, 'Blood Sugar'];
                        }
                        if (dataKey === 'weight' && payload.unit) {
                            return [`${value} ${payload.unit}`, 'Weight'];
                        }
                        return [`${value}${unit ? ` ${unit}` : ''}`, Array.isArray(name) ? name[0] : name];
                    }}
                    itemSorter={(item) => item.name === 'Systolic' ? -1 : item.name === 'Diastolic' ? 1 : 0}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} height={30} />
                {Array.isArray(dataKey) ? (
                    dataKey.map((key, index) => (
                        <Line key={key} type="monotone" dataKey={key} name={Array.isArray(name) ? name[index] : name} stroke={Array.isArray(color) ? color[index] : color} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                    ))
                ) : (
                    <Line type="monotone" dataKey={dataKey} name={Array.isArray(name) ? name[0] : name} stroke={Array.isArray(color) ? color[0] : color} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                )}
            </LineChart>
        </ResponsiveContainer>
    );
};


// --- Main MedCharts Component ---
interface MedChartsProps {
    bpReadings: BloodPressureReading[];
    sugarReadings: BloodSugarReading[];
    weightReadings: WeightReading[];
    isLoading: boolean;
    onDataRefreshNeeded: () => void;
}

const MedCharts: React.FC<MedChartsProps> = ({
    bpReadings,
    sugarReadings,
    weightReadings,
    isLoading,
    onDataRefreshNeeded
}) => {
    const { toast } = useToast();
    const [deletingReadingId, setDeletingReadingId] = useState<string | null>(null);
    const [editingReading, setEditingReading] = useState<any | null>(null);
    const [editingType, setEditingType] = useState<'bp' | 'sugar' | 'weight' | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [isChartModalOpen, setIsChartModalOpen] = useState(false);

    const handleDeleteReading = useCallback(async (id: string, type: 'bp' | 'sugar' | 'weight') => {
        if (deletingReadingId) return;
        setDeletingReadingId(id);
        try {
            const deleteFunctions = {
                bp: deleteBloodPressureReading,
                sugar: deleteBloodSugarReading,
                weight: deleteWeightReading,
            };
            await deleteFunctions[type](id);
            toast({ title: "Reading Deleted", description: `Successfully removed the ${type.toUpperCase()} reading.` });
            onDataRefreshNeeded();
        } catch (error: any) {
            toast({ title: "Deletion Failed", description: error.message || `Could not delete the ${type} reading.`, variant: "destructive" });
        } finally {
            setDeletingReadingId(null);
        }
    }, [deletingReadingId, toast, onDataRefreshNeeded]);

    const handleEditReading = (reading: any, type: 'bp' | 'sugar' | 'weight') => {
        setEditingReading(reading);
        setEditingType(type);
        setIsEditModalOpen(true);
    };

    const handleSaveEditReading = async (data: any) => {
        if (!editingReading || !editingType) return;
        setIsSavingEdit(true);
        const filteredData = Object.fromEntries(Object.entries(data).filter(([key]) => !key.startsWith('$')));
        
        const parsers = {
            bp: { systolic: parseFloat, diastolic: parseFloat },
            sugar: { level: parseFloat },
            weight: { weight: parseFloat },
        };

        for (const key in parsers[editingType]) {
            if (filteredData[key] !== undefined) {
                filteredData[key] = parsers[editingType][key](filteredData[key]);
            }
        }
        
        try {
            const updateFunctions = {
                bp: updateBloodPressureReading,
                sugar: updateBloodSugarReading,
                weight: updateWeightReading,
            };
            await updateFunctions[editingType](editingReading.$id, filteredData);
            toast({ title: "Reading Updated" });
            setIsEditModalOpen(false);
            onDataRefreshNeeded();
        } catch (error: any) {
            toast({ title: "Update Failed", description: error.message || "Could not update reading.", variant: "destructive" });
        } finally {
            setIsSavingEdit(false);
            setEditingReading(null);
            setEditingType(null);
        }
    };

    const hasAnyReadings = bpReadings.length > 0 || sugarReadings.length > 0 || weightReadings.length > 0;

    return (
        <>
            <Card className="shadow-sm border dark:border-gray-700">
                <CardHeader>
                    <CardTitle className="flex items-center text-lg font-semibold">
                        <BarChart3 className="mr-2 h-5 w-5 text-mamasaheli-primary" />
                        Health Readings Overview
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center p-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                        </div>
                    ) : hasAnyReadings ? (
                        <p className="text-sm text-muted-foreground">
                            You have logged health data. Click below to view detailed charts and history.
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No health readings have been logged yet. Go to the Logging page to add your first entry.
                        </p>
                    )}
                </CardContent>
                <CardFooter>
                    <Button 
                        onClick={() => setIsChartModalOpen(true)} 
                        disabled={isLoading || !hasAnyReadings}
                        className="w-full"
                    >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        View Charts & History
                    </Button>
                </CardFooter>
            </Card>

            <Dialog open={isChartModalOpen} onOpenChange={setIsChartModalOpen}>
                <DialogContent className="max-w-6xl w-[95vw] h-[90vh] flex flex-col p-0 dark:bg-gray-900 dark:border-gray-700">
                    <DialogHeader className="p-4 border-b dark:border-gray-700 flex-shrink-0">
                        <DialogTitle>Health Charts & History</DialogTitle>
                        <DialogDescription>Visualize your health trends over time.</DialogDescription>
                        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground p-1">
                            <CloseIcon className="h-5 w-5" />
                            <span className="sr-only">Close</span>
                        </DialogClose>
                    </DialogHeader>
                    <div className="flex-grow overflow-y-auto p-4 md:p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                            {/* Blood Pressure Card */}
                            <Card className="border border-red-200 dark:border-red-900 shadow-sm bg-white dark:bg-gray-800/50 overflow-hidden flex flex-col">
                                <CardHeader className="p-3 bg-red-50/50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-900">
                                    <CardTitle className="flex items-center text-red-600 dark:text-red-400 text-base font-semibold">
                                        <HeartPulse className="mr-2 h-5 w-5" />Blood Pressure
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 flex-grow flex flex-col space-y-4">
                                    <div className="flex-grow"><HealthChart data={bpReadings} dataKey={["systolic", "diastolic"]} unit="mmHg" name={["Systolic", "Diastolic"]} color={["#ef4444", "#f97316"]} /></div>
                                    <div className="border-t pt-3 dark:border-gray-700">
                                        <h4 className="text-xs font-medium mb-2 text-gray-500 dark:text-gray-400 flex items-center"><List className="mr-1 h-3 w-3" />Recent Readings</h4>
                                        <div className="max-h-32 overflow-y-auto pr-1 space-y-0.5">
                                            {bpReadings.length > 0 ? bpReadings.sort((a,b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()).map(r => <ReadingListItem key={r.$id} reading={r} type="bp" onDelete={handleDeleteReading} isDeleting={deletingReadingId === r.$id} onEdit={handleEditReading} />) : <p className="text-xs text-gray-400 italic text-center py-2">No readings.</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Blood Sugar Card */}
                            <Card className="border border-blue-200 dark:border-blue-900 shadow-sm bg-white dark:bg-gray-800/50 overflow-hidden flex flex-col">
                                <CardHeader className="p-3 bg-blue-50/50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-900">
                                    <CardTitle className="flex items-center text-blue-600 dark:text-blue-400 text-base font-semibold">
                                        <Droplet className="mr-2 h-5 w-5" />Blood Sugar
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 flex-grow flex flex-col space-y-4">
                                    <div className="flex-grow"><HealthChart data={sugarReadings} dataKey="level" unit="mg/dL" name="Blood Sugar" color="#3b82f6" /></div>
                                    <div className="border-t pt-3 dark:border-gray-700">
                                        <h4 className="text-xs font-medium mb-2 text-gray-500 dark:text-gray-400 flex items-center"><List className="mr-1 h-3 w-3" />Recent Readings</h4>
                                        <div className="max-h-32 overflow-y-auto pr-1 space-y-0.5">
                                            {sugarReadings.length > 0 ? sugarReadings.sort((a,b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()).map(r => <ReadingListItem key={r.$id} reading={r} type="sugar" onDelete={handleDeleteReading} isDeleting={deletingReadingId === r.$id} onEdit={handleEditReading} />) : <p className="text-xs text-gray-400 italic text-center py-2">No readings.</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Weight Card */}
                            <Card className="border border-green-200 dark:border-green-900 shadow-sm bg-white dark:bg-gray-800/50 overflow-hidden flex flex-col">
                                <CardHeader className="p-3 bg-green-50/50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-900">
                                    <CardTitle className="flex items-center text-green-600 dark:text-green-400 text-base font-semibold">
                                        <Scale className="mr-2 h-5 w-5" />Weight
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 flex-grow flex flex-col space-y-4">
                                    <div className="flex-grow"><HealthChart data={weightReadings} dataKey="weight" unit={weightReadings[0]?.unit} name="Weight" color="#16a34a" /></div>
                                    <div className="border-t pt-3 dark:border-gray-700">
                                        <h4 className="text-xs font-medium mb-2 text-gray-500 dark:text-gray-400 flex items-center"><List className="mr-1 h-3 w-3" />Recent Readings</h4>
                                        <div className="max-h-32 overflow-y-auto pr-1 space-y-0.5">
                                            {weightReadings.length > 0 ? weightReadings.sort((a,b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()).map(r => <ReadingListItem key={r.$id} reading={r} type="weight" onDelete={handleDeleteReading} isDeleting={deletingReadingId === r.$id} onEdit={handleEditReading} />) : <p className="text-xs text-gray-400 italic text-center py-2">No readings.</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {isEditModalOpen && (
                 <EditHealthReadingModal
                    isOpen={isEditModalOpen}
                    onClose={() => { setIsEditModalOpen(false); setEditingReading(null); setEditingType(null); }}
                    type={editingType || 'bp'}
                    reading={editingReading}
                    onSubmit={handleSaveEditReading}
                    isLoading={isSavingEdit}
                />
            )}
        </>
    );
};

export default MedCharts;