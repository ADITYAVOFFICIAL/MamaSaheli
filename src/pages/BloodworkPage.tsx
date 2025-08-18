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

const BloodworkTrendChart = ({ documents, dataKey, name, unit, normalRange }) => {
    const chartData = useMemo(() => {
        return documents
            .map(doc => {
                try {
                    const resultsObj = doc.results ? JSON.parse(doc.results) : {};
                    const key = Object.keys(resultsObj).find(k => k.toLowerCase().includes(dataKey.toLowerCase()));
                    const value = key ? Number(resultsObj[key]) : null;
                    if (key && value !== null && !isNaN(value)) {
                        return {
                            date: new Date(doc.recordedAt),
                            value: value,
                            name: format(new Date(doc.recordedAt), 'MMM d'),
                        };
                    }
                } catch { return null; }
                return null;
            })
            .filter(item => item !== null)
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [documents, dataKey]);

    if (chartData.length < 2) {
        return <div className="flex items-center justify-center h-[250px] text-center text-sm text-muted-foreground bg-secondary/30 rounded-lg">Not enough data to display a trend for {name}.</div>;
    }

    const dataValues = chartData.map(d => d.value);
    const yMin = Math.min(...dataValues, normalRange[0]);
    const yMax = Math.max(...dataValues, normalRange[1]);
    const yPadding = (yMax - yMin) * 0.2 || 5;
    const yDomain = [Math.max(0, Math.floor(yMin - yPadding)), Math.ceil(yMax + yPadding)];

    return (
        <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} unit={unit} domain={yDomain} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
                <ReferenceArea y1={normalRange[0]} y2={normalRange[1]} fill="hsl(var(--primary))" fillOpacity={0.05} label={{ value: "Normal Range", position: "insideTopRight", fill: "hsl(var(--muted-foreground))", fontSize: 10, dy: 10, dx: -10 }} />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} name={name} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 8, stroke: 'hsl(var(--background))', strokeWidth: 2 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

const ReportDetails = ({ result }) => {
    const parsedData = useMemo(() => {
        const raw = result?.results || '';
        let resultsArr = [];
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

    if (parsedData.error) {
        return <div className="text-center text-red-500 italic p-4">{parsedData.error}</div>;
    }

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
                            {resultsArr.map((item, idx) => (
                                <tr key={idx} className="border-t">
                                    <td className="px-3 py-2 font-semibold">{item.name}</td>
                                    <td className="px-3 py-2">{item.value}</td>
                                    <td className="px-3 py-2">{item.unit}</td>
                                    <td className="px-3 py-2 text-muted-foreground">{item.referenceRange}</td>
                                    <td className="px-3 py-2">
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${item.flag === 'High' ? 'bg-red-100 text-red-800' : item.flag === 'Low' ? 'bg-yellow-100 text-yellow-800' : item.flag === 'Normal' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{item.flag}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center text-muted-foreground italic p-8">No structured data was extracted from this report.</div>
            )}
            
            <details>
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-primary">Show raw AI results JSON</summary>
                <pre className="mt-2 text-xs bg-secondary/30 p-2 rounded border overflow-x-auto max-h-40 whitespace-pre-wrap">{raw || 'No raw data.'}</pre>
            </details>
        </div>
    );
};

const ReportModal = ({ selectedDoc, onOpenChange, getSafeFilePreviewUrl }) => {
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
                            <ReportDetails result={selectedDoc} />
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
                         <ReportDetails result={selectedDoc} />
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

    const [file, setFile] = useState(null);
    const [testName, setTestName] = useState('');
    const [recordedAt, setRecordedAt] = useState('');
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [docToDelete, setDocToDelete] = useState(null);
    const [selectedDoc, setSelectedDoc] = useState(null);

    const fetchBloodwork = useCallback(async () => {
        if (!user?.$id) return;
        setIsLoading(true);
        try {
            const docs = await getUserBloodworkResults(user.$id);
            setDocuments(docs);
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

    const handleFileChange = (e) => {
        if (e.target.files?.[0]) setFile(e.target.files[0]);
    };

    const resetForm = () => {
        setFile(null);
        setTestName('');
        setRecordedAt('');
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = '';
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !testName || !recordedAt || !user?.$id) {
            toast({ title: "Missing Information", description: "Please provide a test name, date, and select a file.", variant: "destructive" });
            return;
        }
        setIsUploading(true);
        try {
            const data = { userId: user.$id, testName, recordedAt, file };
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

    const getSafeFilePreviewUrl = (fileId) => {
        try {
            if (!medicalBucketId) throw new Error("Bucket ID not configured.");
            return getFilePreview(fileId, medicalBucketId).toString();
        } catch { return ''; }
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
                    <Card><CardHeader><CardTitle>Hemoglobin (Hgb) Trend</CardTitle><CardDescription>Normal range for pregnancy: 11-14 g/dL</CardDescription></CardHeader><CardContent><BloodworkTrendChart documents={documents} dataKey="hemoglobin" name="Hgb" unit=" g/dL" normalRange={[11, 14]} /></CardContent></Card>
                </section>

                <main className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
                    <aside className="lg:col-span-2 lg:sticky top-24">
                        <Card>
                            <CardHeader><CardTitle className="flex items-center text-xl"><PlusCircle className="mr-2.5 h-6 w-6" /> Add New Result</CardTitle></CardHeader>
                            <form onSubmit={handleUpload}>
                                <CardContent className="space-y-5">
                                    <div className="space-y-1.5"><Label htmlFor="testName">Test Name *</Label><Input id="testName" value={testName} onChange={e => setTestName(e.target.value)} placeholder="e.g., Iron Panel, CBC" required disabled={isUploading} /></div>
                                    <div className="space-y-1.5"><Label htmlFor="recordedAt">Date of Test *</Label><Input id="recordedAt" type="date" value={recordedAt} onChange={e => setRecordedAt(e.target.value)} required disabled={isUploading} /></div>
                                    <div className="space-y-1.5"><Label htmlFor="file-upload">Lab Report File *</Label><Input id="file-upload" type="file" onChange={handleFileChange} disabled={isUploading} accept=".pdf,.png,.jpg,.jpeg" /><p className="text-xs text-muted-foreground">PDF, JPG, PNG accepted.</p></div>
                                    <Button type="submit" disabled={isUploading || !file || !testName || !recordedAt} className="w-full">{isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : <><Upload className="mr-2 h-4 w-4" /> Upload & Analyze</>}</Button>
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
                                                            {doc.summary && <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">AI Summary: {doc.summary}</p>}
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
            />
        </MainLayout>
    );
};

export default BloodworkPage;