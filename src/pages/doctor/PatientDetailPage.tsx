import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import MainLayout from '@/components/layout/MainLayout';
import {
    getUserProfile,
    getUserAppointments,
    getUserMedicalDocuments,
    getFilePreview,
    medicalBucketId,
    getBloodPressureReadings,
    getBloodSugarReadings,
    getWeightReadings,
    getUserBloodworkResults,
    updateBloodworkResult,
    UserProfile,
    Appointment,
    MedicalDocument,
    BloodworkResult,
} from '@/lib/appwrite';
import { Loader2, AlertTriangle, ArrowLeft, User, Mail, CalendarDays, HeartPulse, FileText, Download, Activity, Weight, Droplets, BriefcaseMedical, TestTube2, FileJson, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceArea } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const REQUIRED_LABEL = 'doctor';

const DetailItem: React.FC<{ label: string; value?: string | number | null | string[]; icon?: React.ElementType }> = ({ label, value, icon: Icon }) => (
    <div className="grid grid-cols-3 gap-2 py-1.5">
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 col-span-1">
            {Icon && <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />}
            {label}
        </dt>
        <dd className="text-sm text-gray-900 dark:text-gray-100 col-span-2 break-words">
            {Array.isArray(value) ? value.join(', ') || <span className="text-gray-400 italic">N/A</span> : value ?? <span className="text-gray-400 italic">N/A</span>}
        </dd>
    </div>
);

const SectionLoadingSkeleton: React.FC<{ itemCount?: number }> = ({ itemCount = 3 }) => (
    <div className="space-y-4 p-4">
        {[...Array(itemCount)].map((_, i) => (
             <div key={i} className="space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
        ))}
    </div>
);

const HealthReadingsCard: React.FC<{ userId: string }> = ({ userId }) => {
    const { data: bpData, isLoading: isLoadingBP, isError: isErrorBP } = useQuery({
        queryKey: ['patientBP', userId],
        queryFn: () => getBloodPressureReadings(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
    });

    const { data: sugarData, isLoading: isLoadingSugar, isError: isErrorSugar } = useQuery({
        queryKey: ['patientSugar', userId],
        queryFn: () => getBloodSugarReadings(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
    });

    const { data: weightData, isLoading: isLoadingWeight, isError: isErrorWeight } = useQuery({
        queryKey: ['patientWeight', userId],
        queryFn: () => getWeightReadings(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
    });

    const renderChart = (data: any[], keys: string[], names: string[], colors: string[], unit: string) => {
        if (!data || data.length < 2) {
            return <div className="flex items-center justify-center h-48 text-xs text-gray-500">Not enough data for a trend chart.</div>;
        }

        const chartData = data
            .map(d => ({ ...d, timestamp: parseISO(d.recordedAt).getTime() }))
            .sort((a, b) => a.timestamp - b.timestamp);

        return (
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="timestamp"
                        fontSize={10}
                        tickFormatter={(ts) => format(ts, 'MMM d')}
                        type="number"
                        domain={['dataMin', 'dataMax']}
                    />
                    <YAxis fontSize={10} unit={unit} allowDecimals={false} />
                    <Tooltip
                        contentStyle={{ fontSize: '12px', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                        labelFormatter={(ts) => format(ts, 'MMM d, yyyy HH:mm')}
                        formatter={(value, name, props) => {
                            const { payload } = props;
                            if (name === 'Systolic' || name === 'Diastolic') {
                                return [`${value}${unit}`, name];
                            }
                            if (name === 'Level' && payload.measurementType) {
                                return [`${value}${unit} (${payload.measurementType})`, 'Blood Sugar'];
                            }
                            if (name === 'Weight' && payload.unit) {
                                return [`${value} ${payload.unit}`, 'Weight'];
                            }
                            return [`${value}${unit}`, name];
                        }}
                        itemSorter={(item) => {
                            if (item.name === 'Systolic') return -1;
                            if (item.name === 'Diastolic') return 1;
                            return 0;
                        }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    {keys.map((key, i) => (
                        <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            name={names[i]}
                            stroke={colors[i]}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 6 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        );
    };

    const renderReadingList = (data: any[], formatValue: (item: any) => string) => {
        if (!data || data.length === 0) return <p className="text-xs text-center text-gray-500 py-4">No readings recorded.</p>;
        return (
            <ul className="space-y-2">
                {data.slice(0, 5).map(item => (
                    <li key={item.$id} className="flex justify-between items-center text-xs border-b pb-1 last:border-b-0">
                        <span>{format(parseISO(item.recordedAt), 'MMM d, yyyy')}</span>
                        <span className="font-medium">{formatValue(item)}</span>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <Card className="shadow border dark:border-gray-700">
            <CardHeader><CardTitle className="text-lg font-semibold flex items-center gap-2"><Activity className="h-5 w-5 text-green-600"/>Health Readings</CardTitle></CardHeader>
            <CardContent>
                <Tabs defaultValue="bp">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="bp"><HeartPulse className="h-4 w-4 mr-1 sm:mr-2"/>BP</TabsTrigger>
                        <TabsTrigger value="sugar"><Droplets className="h-4 w-4 mr-1 sm:mr-2"/>Sugar</TabsTrigger>
                        <TabsTrigger value="weight"><Weight className="h-4 w-4 mr-1 sm:mr-2"/>Weight</TabsTrigger>
                    </TabsList>
                    <TabsContent value="bp" className="mt-4">
                        {isLoadingBP ? <SectionLoadingSkeleton /> : isErrorBP ? <p className="text-destructive text-sm">Error loading BP data.</p> :
                            <>
                                {renderChart(bpData, ['systolic', 'diastolic'], ['Systolic', 'Diastolic'], ['#ef4444', '#f97316'], ' mmHg')}
                                <h4 className="text-sm font-medium mt-4 mb-2">Recent Readings</h4>
                                {renderReadingList(bpData, item => `${item.systolic}/${item.diastolic} mmHg`)}
                            </>
                        }
                    </TabsContent>
                    <TabsContent value="sugar" className="mt-4">
                        {isLoadingSugar ? <SectionLoadingSkeleton /> : isErrorSugar ? <p className="text-destructive text-sm">Error loading sugar data.</p> :
                            <>
                                {renderChart(sugarData, ['level'], ['Level'], ['#3b82f6'], ' mg/dL')}
                                <h4 className="text-sm font-medium mt-4 mb-2">Recent Readings</h4>
                                {renderReadingList(sugarData, item => `${item.level} mg/dL (${item.measurementType})`)}
                            </>
                        }
                    </TabsContent>
                    <TabsContent value="weight" className="mt-4">
                        {isLoadingWeight ? <SectionLoadingSkeleton /> : isErrorWeight ? <p className="text-destructive text-sm">Error loading weight data.</p> :
                            <>
                                {renderChart(weightData, ['weight'], ['Weight'], ['#16a34a'], weightData?.[0]?.unit ? ` ${weightData[0].unit}` : '')}
                                <h4 className="text-sm font-medium mt-4 mb-2">Recent Readings</h4>
                                {renderReadingList(weightData, item => `${item.weight} ${item.unit}`)}
                            </>
                        }
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

const ReportDetails = ({ result, onUpdate, isDoctorView = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editRows, setEditRows] = useState([]);
    const parsedData = useMemo(() => {
        const raw = result?.results || '';
        let resultsArr = [];
        let summaryText = '';
        try {
            const parsed = raw ? JSON.parse(raw) : {};
            resultsArr = Array.isArray(parsed) ? parsed : (parsed.results && Array.isArray(parsed.results) ? parsed.results : []);
            summaryText = parsed.summary || '';
        } catch (error) {
            return { error: 'Error parsing results.', raw };
        }
        const processFlag = (value, referenceRange) => {
            if (!value || !referenceRange) return 'N/A';
            const numValue = parseFloat(String(value).replace(/,/g, ''));
            const match = String(referenceRange).match(/([\d.]+)\s*-\s*([\d.]+)/);
            if (!isNaN(numValue) && match) {
                const low = parseFloat(match[1]);
                const high = parseFloat(match[2]);
                if (numValue < low) return 'Low';
                if (numValue > high) return 'High';
                return 'Normal';
            }
            return 'N/A';
        };
        resultsArr = resultsArr.map(item => ({...item, flag: item.flag || processFlag(item.value, item.referenceRange)}));
        if (!summaryText && resultsArr.length > 0) {
            const abnormal = resultsArr.filter(r => r.flag === 'Low' || r.flag === 'High');
            if (abnormal.length > 0) {
                summaryText = abnormal.map(r => `${r.name} is ${r.flag.toLowerCase()}`).join(', ') + '.';
            }
        }
        return { resultsArr, summaryText, raw };
    }, [result]);

    useEffect(() => {
        if (isEditing) {
            setEditRows(parsedData.resultsArr.map(r => ({ ...r })));
        }
    }, [isEditing, parsedData.resultsArr]);

    const handleEditChange = (idx, field, value) => {
        setEditRows(rows => rows.map((row, i) => i === idx ? { ...row, [field]: value } : row));
    };

    const handleSave = () => {
        if (onUpdate) onUpdate(editRows);
        setIsEditing(false);
    };

    if (parsedData.error) return <div className="text-center text-red-500 italic p-4">{parsedData.error}</div>;
    const { resultsArr, summaryText, raw } = parsedData;

    return (
        <div className="space-y-4 p-1">
            {summaryText && (
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50">
                    <CardHeader><CardTitle className="text-base text-blue-900 dark:text-blue-200">AI Summary</CardTitle></CardHeader>
                    <CardContent><p className="text-sm text-blue-800 dark:text-blue-300">{summaryText}</p></CardContent>
                </Card>
            )}
            {resultsArr.length > 0 ? (
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full text-sm">
                        <thead className="bg-secondary/50">
                            <tr>
                                <th className="px-3 py-2 text-left font-medium">Name</th>
                                <th className="px-3 py-2 text-left font-medium">Value</th>
                                <th className="px-3 py-2 text-left font-medium">Unit</th>
                                <th className="px-3 py-2 text-left font-medium">Reference Range</th>
                                <th className="px-3 py-2 text-left font-medium">Flag</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(isEditing ? editRows : resultsArr).map((item, idx) => (
                                <tr key={idx} className="border-t">
                                    <td className="px-3 py-2 font-semibold">{item.name}</td>
                                    <td className="px-3 py-2">{isEditing ? <input type="text" value={item.value} onChange={e => handleEditChange(idx, 'value', e.target.value)} className="border rounded px-1 w-20" /> : item.value}</td>
                                    <td className="px-3 py-2">{isEditing ? <input type="text" value={item.unit || ''} onChange={e => handleEditChange(idx, 'unit', e.target.value)} className="border rounded px-1 w-16" /> : item.unit}</td>
                                    <td className="px-3 py-2 text-muted-foreground">{isEditing ? <input type="text" value={item.referenceRange || ''} onChange={e => handleEditChange(idx, 'referenceRange', e.target.value)} className="border rounded px-1 w-24" /> : item.referenceRange}</td>
                                    <td className="px-3 py-2"><span className={`px-2 py-0.5 text-xs font-bold rounded-full ${item.flag === 'High' ? 'bg-red-100 text-red-800' : item.flag === 'Low' ? 'bg-yellow-100 text-yellow-800' : item.flag === 'Normal' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{item.flag}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {isDoctorView && (
                        <div className="flex gap-2 p-2">
                            {isEditing ? (
                                <><Button size="sm" variant="default" onClick={handleSave}>Save</Button><Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button></>
                            ) : (
                                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>Edit Results</Button>
                            )}
                        </div>
                    )}
                </div>
            ) : <div className="text-center text-muted-foreground italic p-8">No structured data was extracted.</div>}
            <details><summary className="text-xs text-muted-foreground cursor-pointer hover:text-primary">Show raw JSON</summary><pre className="mt-2 text-xs bg-secondary/30 p-2 rounded border overflow-x-auto max-h-40 whitespace-pre-wrap">{raw || 'No raw data.'}</pre></details>
        </div>
    );
};

const ReportModal = ({ selectedDoc, onOpenChange, getSafeFilePreviewUrl, handleUpdateResults, isDoctorView }) => {
    if (!selectedDoc) return null;
    return (
        <Dialog open={!!selectedDoc} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl w-[95vw] h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-4 border-b flex-shrink-0"><DialogTitle className="truncate">{selectedDoc.testName}</DialogTitle><DialogDescription>{format(new Date(selectedDoc.recordedAt), 'MMMM d, yyyy')}</DialogDescription><DialogClose className="absolute right-4 top-4" /></DialogHeader>
                <div className="lg:hidden flex-grow min-h-0">
                    <Tabs defaultValue="results" className="flex flex-col h-full">
                        <TabsList className="grid w-full grid-cols-2 flex-shrink-0"><TabsTrigger value="results"><FileJson className="w-4 h-4 mr-2"/>AI Results</TabsTrigger><TabsTrigger value="document"><FileType className="w-4 h-4 mr-2"/>Document</TabsTrigger></TabsList>
                        <TabsContent value="results" className="flex-grow overflow-y-auto p-4"><ReportDetails result={selectedDoc} onUpdate={handleUpdateResults} isDoctorView={isDoctorView} /></TabsContent>
                        <TabsContent value="document" className="flex-grow"><iframe src={getSafeFilePreviewUrl(selectedDoc.fileId)} className="w-full h-full border-0" title={selectedDoc.fileName} /></TabsContent>
                    </Tabs>
                </div>
                <div className="hidden lg:grid lg:grid-cols-2 gap-6 p-4 flex-grow min-h-0">
                    <div className="border rounded-lg overflow-hidden h-full flex flex-col"><iframe src={getSafeFilePreviewUrl(selectedDoc.fileId)} className="w-full h-full" title={selectedDoc.fileName} /></div>
                    <ScrollArea className="h-full"><ReportDetails result={selectedDoc} onUpdate={handleUpdateResults} isDoctorView={isDoctorView} /></ScrollArea>
                </div>
                <div className="p-4 border-t flex justify-end flex-shrink-0">
                    <Button asChild variant="outline"><a href={getSafeFilePreviewUrl(selectedDoc.fileId)} download={selectedDoc.fileName} target="_blank" rel="noopener noreferrer"><Download className="mr-2 h-4 w-4" /> Download File</a></Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const BloodworkCard: React.FC<{ userId: string }> = ({ userId }) => {
    const { toast } = useToast();
    const [selectedDoc, setSelectedDoc] = useState<BloodworkResult | null>(null);
    const { data: bloodworkDocs, isLoading, isError, error, refetch } = useQuery<BloodworkResult[], Error>({
        queryKey: ['patientBloodwork', userId],
        queryFn: () => getUserBloodworkResults(userId),
        enabled: !!userId,
    });

    const handleUpdateResults = async (newResultsArr) => {
        if (!selectedDoc) return;
        try {
            await updateBloodworkResult(selectedDoc.$id, newResultsArr);
            toast({ title: "Update Successful", description: "Bloodwork values updated." });
            refetch();
            setSelectedDoc(prev => prev ? { ...prev, results: JSON.stringify(newResultsArr) } : null);
        } catch (err) {
            toast({ title: "Update Failed", description: "Could not update the results.", variant: "destructive" });
        }
    };

    const getSafeFilePreviewUrl = (fileId) => {
        try {
            return getFilePreview(fileId, medicalBucketId).toString();
        } catch { return ''; }
    };

    return (
        <>
            <Card className="shadow border dark:border-gray-700">
                <CardHeader><CardTitle className="text-lg font-semibold flex items-center gap-2"><TestTube2 className="h-5 w-5 text-purple-600"/>Bloodwork Reports</CardTitle></CardHeader>
                <CardContent>
                    {isLoading ? <SectionLoadingSkeleton /> :
                     isError ? <p className="text-sm text-red-600">{error?.message}</p> :
                     !bloodworkDocs || bloodworkDocs.length === 0 ? <p className="text-sm text-gray-500">No bloodwork reports found.</p> :
                     <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
                         {bloodworkDocs.map(doc => (
                             <li key={doc.$id} className="flex items-center justify-between space-x-3 p-3 border rounded-md bg-gray-50 dark:bg-gray-800/50">
                                 <div className="overflow-hidden">
                                     <p className="text-sm font-medium truncate" title={doc.testName}>{doc.testName}</p>
                                     <p className="text-xs text-gray-500">Recorded: {format(parseISO(doc.recordedAt), 'MMM d, yyyy')}</p>
                                 </div>
                                 <Button variant="outline" size="sm" onClick={() => setSelectedDoc(doc)} className="flex-shrink-0">View Details</Button>
                             </li>
                         ))}
                     </ul>
                    }
                </CardContent>
            </Card>
            <ReportModal selectedDoc={selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)} getSafeFilePreviewUrl={getSafeFilePreviewUrl} handleUpdateResults={handleUpdateResults} isDoctorView={true} />
        </>
    );
};

const PatientDetailPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const { toast } = useToast();
    const navigate = useNavigate();
    const { user: doctorUser, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated && doctorUser && !doctorUser.labels?.includes(REQUIRED_LABEL)) {
            toast({ title: "Unauthorized", description: "You don't have permission to view patient details.", variant: "destructive" });
            navigate('/doctor', { replace: true });
        }
    }, [doctorUser, isAuthenticated, navigate, toast]);

    const { data: patientProfile, isLoading: isLoadingProfile, isError: isErrorProfile, error: profileError } = useQuery<UserProfile | null, Error>({
        queryKey: ['patientProfile', userId],
        queryFn: () => userId ? getUserProfile(userId) : Promise.resolve(null),
        enabled: !!userId && isAuthenticated,
    });

    const { data: appointments, isLoading: isLoadingAppointments, isError: isErrorAppointments, error: appointmentsError } = useQuery<Appointment[], Error>({
        queryKey: ['patientAppointments', userId],
        queryFn: () => userId ? getUserAppointments(userId) : Promise.resolve([]),
        enabled: !!userId && isAuthenticated,
    });

    const { data: documents, isLoading: isLoadingDocuments, isError: isErrorDocuments, error: documentsError } = useQuery<MedicalDocument[], Error>({
        queryKey: ['patientMedicalDocuments', userId],
        queryFn: () => userId ? getUserMedicalDocuments(userId) : Promise.resolve([]),
        enabled: !!userId && isAuthenticated,
    });

    const showInitialLoading = isLoadingProfile && !patientProfile;

    const handleViewDocument = (fileId: string) => {
        if (!medicalBucketId) {
            toast({ title: "Config Error", description: "Medical document storage not configured.", variant: "destructive" });
            return;
        }
        try {
            const fileUrl = getFilePreview(fileId, medicalBucketId);
            window.open(fileUrl.href, '_blank', 'noopener,noreferrer');
        } catch (error: any) {
            toast({ title: "Error", description: `Failed to get document link: ${error.message}`, variant: "destructive" });
        }
    };

    if (!userId) {
        return (
            <MainLayout>
                <div className="text-center py-10">Invalid Patient ID provided.</div>
                <Button variant="outline" asChild><Link to="/doctor"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Doctor Dashboard</Link></Button>
            </MainLayout>
        );
    }

    if (showInitialLoading) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
                    <Loader2 className="h-16 w-16 animate-spin text-mamasaheli-primary" />
                </div>
            </MainLayout>
        );
    }

    if (isErrorProfile && !isLoadingProfile) {
        return (
            <MainLayout>
                <div className="max-w-2xl mx-auto mt-10 p-6 border border-destructive rounded bg-red-50 dark:bg-red-900/20 text-center">
                    <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                    <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Patient Profile</h2>
                    <p className="text-sm text-red-700 mb-4">{profileError?.message || 'Could not fetch patient profile.'}</p>
                    <Button variant="outline" asChild><Link to="/doctor"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Doctor Dashboard</Link></Button>
                </div>
            </MainLayout>
        );
    }

    if (!isLoadingProfile && !patientProfile) {
        return (
            <MainLayout>
                <div className="max-w-2xl mx-auto mt-10 p-6 border border-yellow-500 rounded bg-yellow-50 dark:bg-yellow-900/20 text-center">
                    <User className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <h2 className="text-xl font-semibold text-yellow-700 mb-2">Patient Not Found</h2>
                    <p className="text-sm text-yellow-800 mb-4">No profile found for the specified patient ID.</p>
                    <Button variant="outline" asChild><Link to="/doctor"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Doctor Dashboard</Link></Button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <Button variant="outline" size="sm" asChild className="mb-6 print:hidden">
                    <Link to="/doctor"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
                </Button>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 pb-6 border-b dark:border-gray-700">
                    {patientProfile.profilePhotoUrl ? (
                        <img src={patientProfile.profilePhotoUrl} alt={patientProfile.name} className="h-20 w-20 rounded-full object-cover border-2 border-mamasaheli-primary" />
                    ) : (
                        <User className="h-20 w-20 text-gray-400 p-3 bg-gray-100 rounded-full" />
                    )}
                    <div className="flex-grow">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{patientProfile.name}</h1>
                        <p className="text-md text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1.5"><Mail className="h-4 w-4 text-gray-400"/> {patientProfile.email}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {patientProfile.age && <Badge variant="secondary">Age: {patientProfile.age}</Badge>}
                            {patientProfile.weeksPregnant !== null && <Badge variant="secondary">Weeks: {patientProfile.weeksPregnant}</Badge>}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="shadow border dark:border-gray-700">
                            <CardHeader><CardTitle className="text-lg font-semibold flex items-center gap-2"><User className="h-5 w-5 text-mamasaheli-primary"/>Profile Information</CardTitle></CardHeader>
                            <CardContent className="divide-y dark:divide-gray-700 px-6 pb-4">
                                <DetailItem label="Name" value={patientProfile.name} />
                                <DetailItem label="Email" value={patientProfile.email} icon={Mail} />
                                <DetailItem label="Phone" value={patientProfile.phoneNumber} />
                                <DetailItem label="Age" value={patientProfile.age} />
                                <DetailItem label="Gender" value={patientProfile.gender} />
                            </CardContent>
                        </Card>
                        <Card className="shadow border dark:border-gray-700">
                            <CardHeader><CardTitle className="text-lg font-semibold flex items-center gap-2"><HeartPulse className="h-5 w-5 text-mamasaheli-primary"/>Pregnancy Details</CardTitle></CardHeader>
                             <CardContent className="divide-y dark:divide-gray-700 px-6 pb-4">
                                <DetailItem label="Weeks Pregnant" value={patientProfile.weeksPregnant} icon={CalendarDays} />
                                <DetailItem label="Pre-existing Conditions" value={patientProfile.preExistingConditions} />
                                <DetailItem label="Activity Level" value={patientProfile.activityLevel} icon={Activity}/>
                                <DetailItem label="Dietary Preferences" value={patientProfile.dietaryPreferences} />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <HealthReadingsCard userId={userId} />
                        <BloodworkCard userId={userId} />
                        <Card className="shadow border dark:border-gray-700">
                            <CardHeader><CardTitle className="text-lg font-semibold flex items-center gap-2"><CalendarDays className="h-5 w-5 text-mamasaheli-secondary"/>Appointments</CardTitle></CardHeader>
                            <CardContent>
                                {isLoadingAppointments ? <SectionLoadingSkeleton /> :
                                 isErrorAppointments ? <p className="text-sm text-red-600">{appointmentsError?.message}</p> :
                                 !appointments || appointments.length === 0 ? <p className="text-sm text-gray-500">No appointments found.</p> :
                                 <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                     {[...appointments].sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()).map(app => (
                                         <li key={app.$id} className="p-3 border rounded-md bg-gray-50 dark:bg-gray-800/50">
                                             <div className="flex justify-between items-center mb-1">
                                                 <span className="text-sm font-medium">{format(parseISO(app.date), 'eee, MMM d, yyyy - h:mm a')}</span>
                                                 <Badge variant={app.isCompleted ? "secondary" : "outline"}>{app.isCompleted ? "Completed" : "Upcoming"}</Badge>
                                             </div>
                                             <p className="text-xs text-gray-600 dark:text-gray-400">Type: {app.appointmentType || 'General'}</p>
                                             {app.notes && <p className="text-xs text-gray-500 mt-1 italic">Notes: {app.notes}</p>}
                                         </li>
                                     ))}
                                 </ul>
                                }
                            </CardContent>
                        </Card>
                        <Card className="shadow border dark:border-gray-700">
                            <CardHeader><CardTitle className="text-lg font-semibold flex items-center gap-2"><BriefcaseMedical className="h-5 w-5 text-mamasaheli-accent"/>Medical Documents</CardTitle></CardHeader>
                            <CardContent>
                                {isLoadingDocuments ? <SectionLoadingSkeleton /> :
                                 isErrorDocuments ? <p className="text-sm text-red-600">{documentsError?.message}</p> :
                                 !documents || documents.length === 0 ? <p className="text-sm text-gray-500">No documents found.</p> :
                                 <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                     {[...documents].sort((a,b) => parseISO(b.$createdAt).getTime() - parseISO(a.$createdAt).getTime()).map(doc => (
                                         <li key={doc.$id} className="flex items-center justify-between space-x-3 p-3 border rounded-md bg-gray-50 dark:bg-gray-800/50">
                                             <div className="overflow-hidden">
                                                 <p className="text-sm font-medium truncate" title={doc.fileName}>{doc.fileName}</p>
                                                 <p className="text-xs text-gray-500">Uploaded: {formatDistanceToNow(parseISO(doc.$createdAt), { addSuffix: true })}</p>
                                             </div>
                                             <Button variant="outline" size="sm" onClick={() => handleViewDocument(doc.fileId)} className="flex-shrink-0"><Download className="h-4 w-4 mr-1"/> View</Button>
                                         </li>
                                     ))}
                                 </ul>
                                }
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default PatientDetailPage;