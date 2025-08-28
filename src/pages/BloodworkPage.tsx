import React, { useState, useEffect, useCallback, FormEvent, useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  createBloodworkResult,
  getUserBloodworkResults,
  deleteBloodworkResult,
  getFilePreview,
  medicalBucketId,
  BloodworkResult,
  updateBloodworkResult,
  CreateBloodworkData,
} from '@/lib/appwrite';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceArea } from 'recharts';
import { Upload, Loader2, FileText, Trash2, Download, BriefcaseMedical, PlusCircle, Inbox, FileClock, TestTube2, FileJson, FileType } from 'lucide-react';

type BloodworkResultWithResults = BloodworkResult & { results?: string };

const BIOMARKER_ALIASES: Record<string, string[]> = {
    'Hemoglobin': ['hemoglobin', 'hgb', 'haemoglobin', 'hb'],
    'RBC Count': ['rbc', 'red blood cell', 'r b c count', 'erythrocyte count'],
    'Hematocrit': ['hematocrit', 'pcv', 'packed cell volume', 'p.c.v/haematocrit'],
    'MCV': ['mcv', 'mean corpuscular volume'],
    'MCH': ['mch', 'mean corpuscular hemoglobin'],
    'MCHC': ['mchc', 'mean corpuscular hemoglobin concentration'],
    'RDW-CV': ['rdw-cv', 'rdw_cv'],
    'RDW-SD': ['rdw-sd', 'rdw_sd'],
    'Platelet Count': ['platelet', 'plt', 'platelet count', 'thrombocyte count'],
    'MPV': ['mpv', 'mean platelet volume'],
    'WBC Count': ['wbc', 'white blood cell', 'leucocyte', 'tlc', 'total leucocyte count'],
    'Neutrophils': ['neutrophil'],
    'Lymphocytes': ['lymphocyte'],
    'Monocytes': ['monocyte'],
    'Eosinophils': ['eosinophil'],
    'Basophils': ['basophil'],
    'PCT': ['pct', 'plateletcrit'],
    'TSH': ['tsh', 'thyroid stimulating hormone'],
    'Free T3': ['ft3', 'free t3', 'free triiodothyronine'],
    'Free T4': ['ft4', 'free t4', 'free thyroxine'],
    'Fasting Blood Sugar': ['fbs', 'fasting blood sugar', 'glucose fasting'],
    'Postprandial Blood Sugar': ['ppbs', 'postprandial blood sugar', 'glucose postprandial', 'glucose pp'],
    'HbA1c': ['hba1c', 'glycated hemoglobin', 'hemoglobin a1c'],
    'Glucose Challenge Test': ['gct', 'glucose challenge'],
    'Beta-hCG': ['beta-hcg', 'β-hcg', 'hcg', 'human chorionic gonadotropin'],
    'Free Beta-hCG': ['free beta-hcg', 'free β-hcg'],
    'PAPP-A': ['papp-a', 'pregnancy-associated plasma protein a'],
    'AFP': ['afp', 'alpha-fetoprotein'],
    'Unconjugated Estriol': ['ue3', 'unconjugated estriol'],
    'Inhibin A': ['inhibin a', 'dimeric inhibin a'],
    'Serum Ferritin': ['ferritin', 'serum ferritin'],
    'Serum Iron': ['serum iron', 'iron'],
    'TIBC': ['tibc', 'total iron binding capacity'],
    'Transferrin Saturation': ['transferrin saturation', 'tsat'],
};

const normalizeString = (s: string): string => (s || "").toLowerCase().replace(/[\s()-.,/]/g, '');

const getCanonicalBiomarker = (rawName: string): string | null => {
    if (!rawName) return null;
    const normalizedName = normalizeString(rawName);
    for (const [canonical, aliases] of Object.entries(BIOMARKER_ALIASES)) {
        if (aliases.some(alias => normalizedName.includes(normalizeString(alias)))) {
            return canonical;
        }
    }
    return rawName.trim();
};

const ResultsSkeleton = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4 flex-grow">
                        <Skeleton className="h-10 w-10 rounded-md flex-shrink-0" />
                        <div className="space-y-2 w-full">
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-3 w-3/5" />
                        </div>
                    </div>
                    <div className="flex gap-2 self-end sm:self-center flex-shrink-0">
                        <Skeleton className="h-9 w-28 rounded-md" />
                        <Skeleton className="h-9 w-9 rounded-md" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const BloodworkTrendChart = ({ documents, dataKey, name, unit, normalRange }: { documents: BloodworkResultWithResults[], dataKey: string, name: string, unit: string, normalRange: number[] }) => {
    const chartData = useMemo(() => {
        return documents
            .map(doc => {
                try {
                    const rawResults = doc.results ? JSON.parse(doc.results) : [];
                    if (!Array.isArray(rawResults)) return null;

                    const item = rawResults.find(i => getCanonicalBiomarker(i.name) === dataKey);

                    if (item && item.value !== null && item.value !== undefined) {
                        const valStr = String(item.value).replace(/,/g, '');
                        const value = parseFloat(valStr);

                        if (!isNaN(value)) {
                            return {
                                date: new Date(doc.recordedAt),
                                value,
                                name: format(new Date(doc.recordedAt), 'MMM d'),
                                unit: item.unit || unit,
                                referenceRange: item.referenceRange || normalRange,
                                flag: item.flag || null,
                            };
                        }
                    }
                } catch { return null; }
                return null;
            })
            .filter((item): item is NonNullable<typeof item> => item !== null)
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [documents, dataKey, unit, normalRange]);

    if (chartData.length < 2) {
        return (
            <div className="flex flex-col items-center justify-center h-[250px] text-center text-sm text-muted-foreground bg-secondary/30 rounded-lg gap-2 p-4">
                <span>Not enough data to display a trend for {name}.</span>
                <span className="text-xs">Upload at least two reports with {name} results to see your trend over time.</span>
            </div>
        );
    }

    const dataValues = chartData.map(d => d.value);
    const refRange = Array.isArray(normalRange) && normalRange.length === 2 ? normalRange : [0, 0];
    const yMin = Math.min(...dataValues, refRange[0]);
    const yMax = Math.max(...dataValues, refRange[1]);
    const yPadding = (yMax - yMin) * 0.2 || 5;
    const yDomain: [number, number] = [Math.max(0, Math.floor(yMin - yPadding)), Math.ceil(yMax + yPadding)];

    return (
        <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} unit={unit} domain={yDomain} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
                {refRange[0] > 0 && refRange[1] > 0 && (
                    <ReferenceArea y1={refRange[0]} y2={refRange[1]} fill="hsl(var(--primary))" fillOpacity={0.05} label={{ value: "Normal Range", position: "insideTopRight", fill: "hsl(var(--muted-foreground))", fontSize: 10, dy: 10, dx: -10 }} />
                )}
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} name={name} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 8, stroke: 'hsl(var(--background))', strokeWidth: 2 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

const ReportDetails = ({ result, onUpdate }: { result: BloodworkResultWithResults, onUpdate: (newResults: any[]) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editRows, setEditRows] = useState<any[]>([]);

    const parsedData = useMemo(() => {
        const raw = result?.results || '';
        let resultsArr: any[] = [];
        let summaryText = '';
        try {
            const parsed = raw ? JSON.parse(raw) : {};
            if (Array.isArray(parsed)) {
                resultsArr = parsed;
            } else if (parsed.results && Array.isArray(parsed.results)) {
                resultsArr = parsed.results;
                summaryText = parsed.summary || '';
            }
        } catch (error) {
            return { error: 'Error parsing results.', raw };
        }
        const processFlag = (value: string | number, referenceRange: string) => {
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
        resultsArr = resultsArr.map(item => ({
            ...item,
            flag: item.flag || processFlag(item.value, item.referenceRange)
        }));
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

    const handleEditChange = (idx: number, field: string, value: string) => {
        setEditRows(rows => rows.map((row, i) => i === idx ? { ...row, [field]: value } : row));
    };

    const handleSave = () => {
        onUpdate(editRows);
        setIsEditing(false);
    };

    if (parsedData.error) {
        return <div className="text-center text-red-500 italic p-4">{parsedData.error}</div>;
    }
    const { resultsArr } = parsedData;
    return (
        <div className="space-y-4 p-1">
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
                                    <td className="px-3 py-2">
                                        {isEditing ? (
                                            <input type="text" value={item.value} onChange={e => handleEditChange(idx, 'value', e.target.value)} className="border rounded px-1 w-20" />
                                        ) : item.value}
                                    </td>
                                    <td className="px-3 py-2">
                                        {isEditing ? (
                                            <input type="text" value={item.unit || ''} onChange={e => handleEditChange(idx, 'unit', e.target.value)} className="border rounded px-1 w-16" />
                                        ) : item.unit}
                                    </td>
                                    <td className="px-3 py-2 text-muted-foreground">
                                        {isEditing ? (
                                            <input type="text" value={item.referenceRange || ''} onChange={e => handleEditChange(idx, 'referenceRange', e.target.value)} className="border rounded px-1 w-24" />
                                        ) : item.referenceRange}
                                    </td>
                                    <td className="px-3 py-2">
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${item.flag === 'High' ? 'bg-red-100 text-red-800' : item.flag === 'Low' ? 'bg-yellow-100 text-yellow-800' : item.flag === 'Normal' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{item.flag}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex gap-2 p-2">
                        {isEditing ? (
                            <>
                                <Button size="sm" variant="default" onClick={handleSave}>Save</Button>
                                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                            </>
                        ) : (
                            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center text-muted-foreground italic p-8">No structured data was extracted from this report.</div>
            )}
        </div>
    );
};

const ReportModal = ({ selectedDoc, onOpenChange, getSafeFilePreviewUrl, handleUpdateResults }: { selectedDoc: BloodworkResultWithResults | null, onOpenChange: (open: boolean) => void, getSafeFilePreviewUrl: (fileId: string) => string, handleUpdateResults: (newResults: any[]) => void }) => {
    if (!selectedDoc) return null;

    return (
        <Dialog open={!!selectedDoc} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl w-[95vw] h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-4 border-b flex-shrink-0">
                    <DialogTitle className="truncate">{selectedDoc.testName}</DialogTitle>
                    <DialogDescription>{format(new Date(selectedDoc.recordedAt), 'MMMM d, yyyy')}</DialogDescription>
                    <DialogClose className="absolute right-4 top-4" />
                </DialogHeader>

                <div className="lg:hidden flex-grow min-h-0">
                    <Tabs defaultValue="results" className="flex flex-col h-full">
                        <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                            <TabsTrigger value="results"><FileJson className="w-4 h-4 mr-2"/>AI Results</TabsTrigger>
                            <TabsTrigger value="document"><FileType className="w-4 h-4 mr-2"/>Document</TabsTrigger>
                        </TabsList>
                        <TabsContent value="results" className="flex-grow overflow-y-auto p-4">
                            <ReportDetails result={selectedDoc} onUpdate={handleUpdateResults} />
                        </TabsContent>
                        <TabsContent value="document" className="flex-grow">
                             <iframe src={getSafeFilePreviewUrl(selectedDoc.fileId)} className="w-full h-full border-0" title={selectedDoc.fileName} />
                        </TabsContent>
                    </Tabs>
                </div>
                
                <div className="hidden lg:grid lg:grid-cols-2 gap-6 p-4 flex-grow min-h-0">
                    <div className="border rounded-lg overflow-hidden h-full flex flex-col">
                        <iframe src={getSafeFilePreviewUrl(selectedDoc.fileId)} className="w-full h-full" title={selectedDoc.fileName} />
                    </div>
                    <ScrollArea className="h-full">
                         <ReportDetails result={selectedDoc} onUpdate={handleUpdateResults} />
                    </ScrollArea>
                </div>

                <div className="p-4 border-t flex justify-end flex-shrink-0">
                    <Button asChild variant="outline">
                        <a href={getSafeFilePreviewUrl(selectedDoc.fileId)} download={selectedDoc.fileName} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" /> Download File
                        </a>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};


const BloodworkPage = () => {
    const { user } = useAuthStore();
    const { toast } = useToast();

    const [file, setFile] = useState<File | null>(null);
    const [testName, setTestName] = useState('');
    const [recordedAt, setRecordedAt] = useState('');
    const [documents, setDocuments] = useState<BloodworkResultWithResults[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [docToDelete, setDocToDelete] = useState<BloodworkResultWithResults | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<BloodworkResultWithResults | null>(null);
    const [selectedBiomarker, setSelectedBiomarker] = useState("");
    const [biomarkerOptions, setBiomarkerOptions] = useState<string[]>([]);
    const [biomarkerUnits, setBiomarkerUnits] = useState<Record<string, string>>({});
    const [biomarkerRanges, setBiomarkerRanges] = useState<Record<string, number[]>>({});

    const [manualEntry, setManualEntry] = useState({
        testName: '',
        recordedAt: '',
        biomarkers: [{ name: '', value: '', unit: '', referenceRange: '' }],
    });
    const [isManualLoading, setIsManualLoading] = useState(false);

    const fetchBloodwork = useCallback(async () => {
        if (!user?.$id) return;
        setIsLoading(true);
        try {
            const docs = await getUserBloodworkResults(user.$id);
            setDocuments(docs as BloodworkResultWithResults[]);
        } catch (error) {
            toast({ title: "Failed to fetch results", description: "Could not load your bloodwork history.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        fetchBloodwork();
    }, [fetchBloodwork]);

    const dashboardStats = useMemo(() => {
        if (isLoading || documents.length === 0) {
            return { total: 0, recentDate: null, commonTestCount: 0 };
        }
        const recentDate = new Date(documents[0].recordedAt);
        const commonTestCount = documents.filter(doc => doc.testName.toLowerCase().includes('cbc') || doc.testName.toLowerCase().includes('complete blood count')).length;
        return { total: documents.length, recentDate: format(recentDate, 'MMM d, yyyy'), commonTestCount };
    }, [documents, isLoading]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setFile(e.target.files[0]);
    };

    const resetForm = () => {
        setFile(null);
        setTestName('');
        setRecordedAt('');
        const fileInput = document.getElementById('file-upload') as HTMLInputElement | null;
        if (fileInput) fileInput.value = '';
    };

    const handleUpload = async (e: FormEvent) => {
        e.preventDefault();
        if (!file || !testName || !recordedAt || !user?.$id) {
            toast({ title: "Missing Information", description: "Please provide a test name, date, and select a file.", variant: "destructive" });
            return;
        }
        setIsUploading(true);
        try {
            const data: CreateBloodworkData = { userId: user.$id, testName, recordedAt, file };
            await createBloodworkResult(data);
            toast({ title: "Success", description: "Bloodwork result uploaded successfully. AI is analyzing the report." });
            resetForm();
            fetchBloodwork();
        } catch (error) {
            toast({ title: "Upload Failed", description: error instanceof Error ? error.message : "An unknown error occurred.", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const confirmDelete = async () => {
        if (!docToDelete) return;
        try {
            await deleteBloodworkResult(docToDelete);
            toast({ title: "Deleted", description: `"${docToDelete.testName}" result has been deleted.` });
            setDocuments(docs => docs.filter(d => d.$id !== docToDelete.$id));
        } catch (error) {
            toast({ title: "Delete Failed", description: "Could not delete the document.", variant: "destructive" });
        } finally {
            setDocToDelete(null);
        }
    };

    const getSafeFilePreviewUrl = (fileId: string) => {
        try {
            if (!medicalBucketId) throw new Error("Bucket ID not configured.");
            return getFilePreview(fileId, medicalBucketId).toString();
        } catch { return ''; }
    };

    useEffect(() => {
        if (!documents || documents.length === 0) {
            setBiomarkerOptions([]);
            setSelectedBiomarker("");
            return;
        }

        const canonicalBiomarkerMap: Record<string, number> = {};
        const unitsMap: Record<string, string> = {};
        const rangesMap: Record<string, number[]> = {};

        documents.forEach(doc => {
            let results;
            try {
                results = doc.results ? JSON.parse(doc.results) : [];
            } catch { results = []; }
            
            if (!Array.isArray(results)) return;

            results.forEach(item => {
                const canonicalName = getCanonicalBiomarker(item.name);
                if (!canonicalName) return;

                canonicalBiomarkerMap[canonicalName] = (canonicalBiomarkerMap[canonicalName] || 0) + 1;

                if (!unitsMap[canonicalName] && item.unit) {
                    unitsMap[canonicalName] = item.unit;
                }
                if (!rangesMap[canonicalName] && item.referenceRange) {
                    const match = String(item.referenceRange).match(/([\d.]+)\s*-\s*([\d.]+)/);
                    if (match) {
                        rangesMap[canonicalName] = [parseFloat(match[1]), parseFloat(match[2])];
                    }
                }
            });
        });

        const options = Object.keys(canonicalBiomarkerMap)
            .filter(key => canonicalBiomarkerMap[key] > 1)
            .sort();

        setBiomarkerOptions(options);
        setBiomarkerUnits(unitsMap);
        setBiomarkerRanges(rangesMap);

        if (options.length > 0) {
            setSelectedBiomarker(prev => options.includes(prev) ? prev : options[0]);
        } else {
            setSelectedBiomarker("");
        }
    }, [documents]);

    const handleUpdateResults = async (newResultsArr: any[]) => {
        if (!selectedDoc) return;
        const recalcFlag = (value: string | number, referenceRange: string) => {
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
        const updatedResultsArr = newResultsArr.map(item => ({
            ...item,
            flag: recalcFlag(item.value, item.referenceRange)
        }));
        try {
            await updateBloodworkResult(selectedDoc.$id, updatedResultsArr);
            const updatedDoc = { ...selectedDoc, results: JSON.stringify(updatedResultsArr) };
            setDocuments(docs => docs.map(d => d.$id === selectedDoc.$id ? updatedDoc : d));
            setSelectedDoc(updatedDoc);
            toast({ title: "Update Successful", description: "Bloodwork values updated and flags recalculated.", variant: "default" });
        } catch (error) {
            toast({ title: "Update Failed", description: "Could not update the results.", variant: "destructive" });
        }
    };

    const handleManualChange = (idx: number, field: string, value: string) => {
        setManualEntry(entry => ({
            ...entry,
            biomarkers: entry.biomarkers.map((b, i) => i === idx ? { ...b, [field]: value } : b)
        }));
    };
    const addManualBiomarker = () => {
        setManualEntry(entry => ({ ...entry, biomarkers: [...entry.biomarkers, { name: '', value: '', unit: '', referenceRange: '' }] }));
    };
    const removeManualBiomarker = (idx: number) => {
        setManualEntry(entry => ({ ...entry, biomarkers: entry.biomarkers.filter((_, i) => i !== idx) }));
    };
    const handleManualSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!user?.$id || !manualEntry.testName || !manualEntry.recordedAt || manualEntry.biomarkers.some(b => !b.name || !b.value)) {
            toast({ title: "Missing Information", description: "Please fill all required fields.", variant: "destructive" });
            return;
        }
        setIsManualLoading(true);
        try {
            const data: CreateBloodworkData = {
                userId: user.$id,
                testName: manualEntry.testName,
                recordedAt: manualEntry.recordedAt,
                file: null,
                summary: JSON.stringify(manualEntry.biomarkers),
            };
            await createBloodworkResult(data);
            toast({ title: "Success", description: "Manual entry added successfully." });
            setManualEntry({ testName: '', recordedAt: '', biomarkers: [{ name: '', value: '', unit: '', referenceRange: '' }] });
            fetchBloodwork();
        } catch (error) {
            toast({ title: "Manual Entry Failed", description: error instanceof Error ? error.message : "An unknown error occurred.", variant: "destructive" });
        } finally {
            setIsManualLoading(false);
        }
    };

    return (
        <MainLayout requireAuth>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <header className="mb-10 md:mb-12 text-center md:text-left">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 sm:text-4xl tracking-tight">Bloodwork Dashboard</h1>
                    <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto md:mx-0">Visualize, track, and manage your lab reports and blood test results.</p>
                </header>

                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Reports</CardTitle><BriefcaseMedical className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent>{isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{dashboardStats.total}</div>}<p className="text-xs text-muted-foreground">reports uploaded</p></CardContent></Card>
                    <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Most Recent</CardTitle><FileClock className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent>{isLoading ? <Skeleton className="h-8 w-32" /> : <div className="text-2xl font-bold">{dashboardStats.recentDate || 'N/A'}</div>}<p className="text-xs text-muted-foreground">date of last report</p></CardContent></Card>
                    <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">CBC Reports</CardTitle><TestTube2 className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent>{isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{dashboardStats.commonTestCount}</div>}<p className="text-xs text-muted-foreground">complete blood count tests</p></CardContent></Card>
                </section>
                
                <section className="mb-10">
                    <Card>
                        <CardHeader>
                            <CardTitle>Biomarker Trend Chart</CardTitle>
                            <CardDescription>
                                Select any biomarker with multiple data points to view its trend over time.
                            </CardDescription>
                            <div className="mt-4">
                                <label htmlFor="biomarker-select" className="mr-2 font-medium text-sm">Biomarker:</label>
                                <select
                                    id="biomarker-select"
                                    value={selectedBiomarker}
                                    onChange={e => setSelectedBiomarker(e.target.value)}
                                    className="border rounded px-2 py-1 bg-background"
                                    disabled={biomarkerOptions.length === 0}
                                >
                                    {biomarkerOptions.length > 0 ? biomarkerOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    )) : <option>No trendable data</option>}
                                </select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {selectedBiomarker ? (
                                <BloodworkTrendChart
                                    documents={documents}
                                    dataKey={selectedBiomarker}
                                    name={selectedBiomarker}
                                    unit={biomarkerUnits[selectedBiomarker] || ""}
                                    normalRange={biomarkerRanges[selectedBiomarker] || [0, 0]}
                                />
                            ) : (
                                <div className="text-center text-muted-foreground p-8">Select a biomarker to view its trend, or upload more reports.</div>
                            )}
                        </CardContent>
                    </Card>
                </section>

                <main className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
                    <aside className="lg:col-span-2 lg:sticky top-24 space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="flex items-center text-xl"><PlusCircle className="mr-2.5 h-6 w-6" /> Upload New Report</CardTitle></CardHeader>
                            <form onSubmit={handleUpload}>
                                <CardContent className="space-y-5">
                                    <div className="space-y-1.5"><Label htmlFor="testName">Test Name *</Label><Input id="testName" value={testName} onChange={e => setTestName(e.target.value)} placeholder="e.g., Iron Panel, CBC" required disabled={isUploading} /></div>
                                    <div className="space-y-1.5"><Label htmlFor="recordedAt">Date of Test *</Label><Input id="recordedAt" type="date" value={recordedAt} onChange={e => setRecordedAt(e.target.value)} required disabled={isUploading} /></div>
                                    <div className="space-y-1.5"><Label htmlFor="file-upload">Lab Report File *</Label><Input id="file-upload" type="file" onChange={handleFileChange} disabled={isUploading} accept=".pdf,.png,.jpg,.jpeg" /><p className="text-xs text-muted-foreground">PDF, JPG, PNG accepted.</p></div>
                                    <Button type="submit" disabled={isUploading || !file || !testName || !recordedAt} className="w-full">{isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : <><Upload className="mr-2 h-4 w-4" /> Upload & Analyze</>}</Button>
                                </CardContent>
                            </form>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="flex items-center text-xl"><PlusCircle className="mr-2.5 h-6 w-6" /> Manual Entry</CardTitle></CardHeader>
                            <form onSubmit={handleManualSubmit}>
                                <CardContent className="space-y-5">
                                    <div className="space-y-1.5"><Label htmlFor="manual-testName">Test Name *</Label><Input id="manual-testName" value={manualEntry.testName} onChange={e => setManualEntry(entry => ({ ...entry, testName: e.target.value }))} placeholder="e.g., Iron Panel, CBC" required disabled={isManualLoading} /></div>
                                    <div className="space-y-1.5"><Label htmlFor="manual-recordedAt">Date of Test *</Label><Input id="manual-recordedAt" type="date" value={manualEntry.recordedAt} onChange={e => setManualEntry(entry => ({ ...entry, recordedAt: e.target.value }))} required disabled={isManualLoading} /></div>
                                    <div className="space-y-2">
                                        <Label>Biomarkers *</Label>
                                        {manualEntry.biomarkers.map((b, idx) => (
                                            <div key={idx} className="grid grid-cols-[1fr,auto,auto,auto,auto] gap-2 items-center">
                                                <Input placeholder="Name" value={b.name} onChange={e => handleManualChange(idx, 'name', e.target.value)} required disabled={isManualLoading} />
                                                <Input placeholder="Value" value={b.value} onChange={e => handleManualChange(idx, 'value', e.target.value)} required disabled={isManualLoading} className="w-20" />
                                                <Input placeholder="Unit" value={b.unit} onChange={e => handleManualChange(idx, 'unit', e.target.value)} disabled={isManualLoading} className="w-16" />
                                                <Input placeholder="Range" value={b.referenceRange} onChange={e => handleManualChange(idx, 'referenceRange', e.target.value)} disabled={isManualLoading} className="w-24" />
                                                <Button type="button" size="icon" variant="destructive" onClick={() => removeManualBiomarker(idx)} disabled={isManualLoading || manualEntry.biomarkers.length === 1}><Trash2 className="w-4 h-4"/></Button>
                                            </div>
                                        ))}
                                        <Button type="button" size="sm" variant="outline" onClick={addManualBiomarker} disabled={isManualLoading}>Add Biomarker</Button>
                                    </div>
                                    <Button type="submit" disabled={isManualLoading || !manualEntry.testName || !manualEntry.recordedAt || manualEntry.biomarkers.some(b => !b.name || !b.value)} className="w-full">{isManualLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <>Save Manual Entry</>}</Button>
                                </CardContent>
                            </form>
                        </Card>
                    </aside>

                    <section className="lg:col-span-3">
                        <Card>
                            <CardHeader><CardTitle className="flex items-center text-xl"><BriefcaseMedical className="mr-2.5 h-6 w-6" /> Your History</CardTitle><CardDescription className="mt-1">A list of your uploaded bloodwork results, sorted by most recent.</CardDescription></CardHeader>
                            <CardContent className="min-h-[300px]">
                                {isLoading ? <ResultsSkeleton /> : documents.length > 0 ? (
                                    <div className="space-y-4">
                                        {documents.map(doc => (
                                            <Card key={doc.$id} className="p-4 border hover:shadow-md transition-shadow">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                    <div className="flex items-center gap-4 flex-grow overflow-hidden">
                                                        <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                                                        <div className="overflow-hidden">
                                                            <p className="font-semibold truncate" title={doc.testName}>{doc.testName}</p>
                                                            <p className="text-sm text-muted-foreground">{format(new Date(doc.recordedAt), 'MMMM d, yyyy')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 flex-shrink-0 self-end sm:self-center">
                                                        <Button variant="outline" size="sm" onClick={() => setSelectedDoc(doc)}>View Details</Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild><Button variant="destructive" size="icon" onClick={() => setDocToDelete(doc)}><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the result for "{doc.testName}".</AlertDialogDescription></AlertDialogHeader>
                                                                <AlertDialogFooter><AlertDialogCancel onClick={() => setDocToDelete(null)}>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction></AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16"><Inbox className="mx-auto h-12 w-12 text-gray-400" /><p className="mt-4 font-medium">No bloodwork results found.</p><p className="mt-1 text-sm text-muted-foreground">Use the form to upload your first result.</p></div>
                                )}
                            </CardContent>
                        </Card>
                    </section>
                </main>
            </div>

            <ReportModal 
                selectedDoc={selectedDoc}
                onOpenChange={(open) => !open && setSelectedDoc(null)}
                getSafeFilePreviewUrl={getSafeFilePreviewUrl}
                handleUpdateResults={handleUpdateResults}
            />
        </MainLayout>
    );
};

export default BloodworkPage;