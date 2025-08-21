import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    HeartPulse, Droplet, Scale, BarChart3, List,
} from 'lucide-react';
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
                <span className="font-medium text-gray-700">{value} {unit}</span>
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
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(d => ({ ...d, recordedAtLabel: format(new Date(d.timestamp), 'MMM d') }));

    if (!formattedData || formattedData.length === 0) {
        return <p className="text-xs text-gray-400 text-center py-8">No chart data available.</p>;
    }

    const allValues = formattedData.flatMap(item =>
        Array.isArray(dataKey) ? dataKey.map(key => item[key]) : [item[dataKey]]
    ).filter((val): val is number => typeof val === 'number' && !isNaN(val));

    const minY = allValues.length > 0 ? Math.min(...allValues) : 0;
    const maxY = allValues.length > 0 ? Math.max(...allValues) : 100;
    const padding = (maxY - minY) * 0.15 || 5;

    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={formattedData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="recordedAtLabel" fontSize={9} tick={{ fill: '#6b7280' }} interval="preserveStartEnd" padding={{ left: 10, right: 10 }} dy={5} />
                <YAxis fontSize={9} tick={{ fill: '#6b7280' }} domain={[Math.max(0, Math.floor(minY - padding)), Math.ceil(maxY + padding)]} unit={unit ? ` ${unit}` : ''} allowDecimals={false} width={35} dx={-2} />
                <Tooltip
                    contentStyle={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', background: 'rgba(255, 255, 255, 0.95)' }}
                    labelFormatter={(label, payload) => {
                        if (payload && payload.length > 0) {
                            const point = formattedData.find(d => d.recordedAtLabel === label);
                            if (point) {
                                return format(new Date(point.timestamp), 'MMM d, yyyy HH:mm');
                            }
                        }
                        return label;
                    }}
                    formatter={(value, tooltipName, props) => {
                        // For BP chart (array dataKey)
                        if (Array.isArray(dataKey)) {
                            // Show actual value for each line
                            if (tooltipName === 'Systolic' && props.payload.systolic !== undefined) {
                                return [`Systolic: ${props.payload.systolic} ${unit || ''}`, 'Systolic'];
                            }
                            if (tooltipName === 'Diastolic' && props.payload.diastolic !== undefined) {
                                return [`Diastolic: ${props.payload.diastolic} ${unit || ''}`, 'Diastolic'];
                            }
                            return [`${value}${unit ? ` ${unit}` : ''}`, tooltipName];
                        }
                        // For sugar
                        if (dataKey === 'level' && props.payload.measurementType) {
                            return [`Blood Sugar: ${value} ${unit || ''} (${props.payload.measurementType})`, 'Blood Sugar'];
                        }
                        // For weight
                        if (dataKey === 'weight' && props.payload.unit) {
                            return [`Weight: ${value} ${props.payload.unit}`, 'Weight'];
                        }
                        return [`${value}${unit ? ` ${unit}` : ''}`, tooltipName];
                    }}
                    itemStyle={{ padding: '2px 0' }}
                    wrapperClassName="text-xs"
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} height={30} />
                {Array.isArray(dataKey) ? (
                    dataKey.map((key, index) => (
                        <Line key={key} type="monotone" dataKey={key} name={Array.isArray(name) ? name[index] : name} stroke={Array.isArray(color) ? color[index] : color} strokeWidth={1.5} dot={{ r: 2, fill: Array.isArray(color) ? color[index] : color, strokeWidth: 0 }} activeDot={{ r: 4, strokeWidth: 1, stroke: '#ffffff' }} connectNulls={false} />
                    ))
                ) : (
                    <Line type="monotone" dataKey={dataKey} name={Array.isArray(name) ? name[0] : name} stroke={Array.isArray(color) ? color[0] : color} strokeWidth={1.5} dot={{ r: 2, fill: Array.isArray(color) ? color[0] : color, strokeWidth: 0 }} activeDot={{ r: 4, strokeWidth: 1, stroke: '#ffffff' }} connectNulls={false} />
                )}
            </LineChart>
        </ResponsiveContainer>
    );
};

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

    const handleDeleteReading = useCallback(async (id: string, type: 'bp' | 'sugar' | 'weight') => {
        if (deletingReadingId) return;
        setDeletingReadingId(id);
        try {
            let deletePromise;
            switch (type) {
                case 'bp': deletePromise = deleteBloodPressureReading(id); break;
                case 'sugar': deletePromise = deleteBloodSugarReading(id); break;
                case 'weight': deletePromise = deleteWeightReading(id); break;
                default: throw new Error("Invalid reading type for deletion");
            }
            await deletePromise;
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
        // Remove system attributes from the update payload
        let filteredData = Object.fromEntries(
            Object.entries(data).filter(([key]) => !key.startsWith('$'))
        );
        // Ensure numeric fields are numbers, not strings
        if (editingType === 'bp') {
            if (filteredData.systolic !== undefined) filteredData.systolic = parseFloat(filteredData.systolic);
            if (filteredData.diastolic !== undefined) filteredData.diastolic = parseFloat(filteredData.diastolic);
        } else if (editingType === 'sugar') {
            if (filteredData.level !== undefined) filteredData.level = parseFloat(filteredData.level);
        } else if (editingType === 'weight') {
            if (filteredData.weight !== undefined) filteredData.weight = parseFloat(filteredData.weight);
        }
        try {
            if (editingType === 'bp') {
                await updateBloodPressureReading(editingReading.$id, filteredData);
            } else if (editingType === 'sugar') {
                await updateBloodSugarReading(editingReading.$id, filteredData);
            } else if (editingType === 'weight') {
                await updateWeightReading(editingReading.$id, filteredData);
            }
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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-16 bg-gray-50 rounded-lg border">
                <Loader2 className="h-8 w-8 text-mamasaheli-accent animate-spin mr-3" />
                <span className="text-gray-600">Loading health data...</span>
            </div>
        );
    }

    const sortDesc = (a: any, b: any) => new Date(b.recordedAt || b.$createdAt).getTime() - new Date(a.recordedAt || a.$createdAt).getTime();
    const sortedBp = [...bpReadings].sort(sortDesc);
    const sortedSugar = [...sugarReadings].sort(sortDesc);
    const sortedWeight = [...weightReadings].sort(sortDesc);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <Card className="border border-red-200 shadow-sm bg-white overflow-hidden flex flex-col">
                <CardHeader className="p-3 bg-red-50/50 border-b border-red-200">
                    <CardTitle className="flex items-center text-red-600 text-base font-semibold">
                        <HeartPulse className="mr-2 h-5 w-5" />Blood Pressure
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex-grow flex flex-col space-y-4">
                    <div className="flex-grow">
                        <h4 className="text-xs font-medium mb-1 text-gray-500 flex items-center"><BarChart3 className="mr-1 h-3 w-3" />Trend (mmHg)</h4>
                        {bpReadings.length > 0 ? (
                            <HealthChart data={bpReadings} dataKey={["systolic", "diastolic"]} unit="mmHg" name={["Systolic", "Diastolic"]} color={["#ef4444", "#f97316"]} />
                        ) : (
                             <p className="text-xs text-gray-400 text-center py-8">No chart data available.</p>
                        )}
                    </div>
                    <div className="border-t pt-3">
                        <h4 className="text-xs font-medium mb-2 text-gray-500 flex items-center"><List className="mr-1 h-3 w-3" />Recent Readings</h4>
                        <div className="max-h-32 overflow-y-auto pr-1 space-y-0.5">
                            {sortedBp.length > 0 ? (
                                sortedBp.slice(0, 5).map(r => (
                                    <ReadingListItem key={r.$id} reading={r} type="bp" onDelete={handleDeleteReading} isDeleting={deletingReadingId === r.$id} onEdit={handleEditReading} />
                                ))
                            ) : (
                                <p className="text-xs text-gray-400 italic text-center py-2">No readings recorded.</p>
                            )}
                            {sortedBp.length > 5 && <p className="text-xs text-center text-gray-400 pt-1">...</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-blue-200 shadow-sm bg-white overflow-hidden flex flex-col">
                <CardHeader className="p-3 bg-blue-50/50 border-b border-blue-200">
                    <CardTitle className="flex items-center text-blue-600 text-base font-semibold">
                        <Droplet className="mr-2 h-5 w-5" />Blood Sugar
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex-grow flex flex-col space-y-4">
                     <div className="flex-grow">
                        <h4 className="text-xs font-medium mb-1 text-gray-500 flex items-center"><BarChart3 className="mr-1 h-3 w-3" />Trend (mg/dL)</h4>
                        {sugarReadings.length > 0 ? (
                            <HealthChart data={sugarReadings} dataKey="level" unit="mg/dL" name="Sugar Level" color="#3b82f6" />
                         ) : (
                             <p className="text-xs text-gray-400 text-center py-8">No chart data available.</p>
                        )}
                    </div>
                    <div className="border-t pt-3">
                        <h4 className="text-xs font-medium mb-2 text-gray-500 flex items-center"><List className="mr-1 h-3 w-3" />Recent Readings</h4>
                        <div className="max-h-32 overflow-y-auto pr-1 space-y-0.5">
                            {sortedSugar.length > 0 ? (
                                sortedSugar.slice(0, 5).map(r => (
                                    <ReadingListItem key={r.$id} reading={r} type="sugar" onDelete={handleDeleteReading} isDeleting={deletingReadingId === r.$id} onEdit={handleEditReading} />
                                ))
                            ) : (
                                <p className="text-xs text-gray-400 italic text-center py-2">No readings recorded.</p>
                            )}
                            {sortedSugar.length > 5 && <p className="text-xs text-center text-gray-400 pt-1">...</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-green-200 shadow-sm bg-white overflow-hidden flex flex-col">
                <CardHeader className="p-3 bg-green-50/50 border-b border-green-200">
                    <CardTitle className="flex items-center text-green-600 text-base font-semibold">
                        <Scale className="mr-2 h-5 w-5" />Weight
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex-grow flex flex-col space-y-4">
                     <div className="flex-grow">
                        <h4 className="text-xs font-medium mb-1 text-gray-500 flex items-center"><BarChart3 className="mr-1 h-3 w-3" />Trend ({weightReadings[0]?.unit || 'N/A'})</h4>
                        {weightReadings.length > 0 ? (
                            <HealthChart data={weightReadings} dataKey="weight" unit={weightReadings[0]?.unit} name="Weight" color="#16a34a" />
                         ) : (
                             <p className="text-xs text-gray-400 text-center py-8">No chart data available.</p>
                        )}
                    </div>
                    <div className="border-t pt-3">
                        <h4 className="text-xs font-medium mb-2 text-gray-500 flex items-center"><List className="mr-1 h-3 w-3" />Recent Readings</h4>
                        <div className="max-h-32 overflow-y-auto pr-1 space-y-0.5">
                            {sortedWeight.length > 0 ? (
                                sortedWeight.slice(0, 5).map(r => (
                                    <ReadingListItem key={r.$id} reading={r} type="weight" onDelete={handleDeleteReading} isDeleting={deletingReadingId === r.$id} onEdit={handleEditReading} />
                                ))
                            ) : (
                                <p className="text-xs text-gray-400 italic text-center py-2">No readings recorded.</p>
                            )}
                            {sortedWeight.length > 5 && <p className="text-xs text-center text-gray-400 pt-1">...</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>
            <EditHealthReadingModal
                isOpen={isEditModalOpen}
                onClose={() => { setIsEditModalOpen(false); setEditingReading(null); setEditingType(null); }}
                type={editingType || 'bp'}
                reading={editingReading}
                onSubmit={handleSaveEditReading}
                isLoading={isSavingEdit}
            />
        </div>
    );
};

export default MedCharts;