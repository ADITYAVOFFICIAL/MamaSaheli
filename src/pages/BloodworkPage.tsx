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
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceArea } from 'recharts';
import { Upload, Loader2, FileText, Trash2, Download, BriefcaseMedical, PlusCircle, Inbox, FileClock, TestTube2, X } from 'lucide-react';

const ResultsSkeleton = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <Card key={i} className="flex flex-col sm:flex-row items-start justify-between p-4 animate-pulse">
                <div className="flex items-center gap-4 w-full">
                    <Skeleton className="h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-700" />
                    <div className="space-y-2 flex-grow">
                        <Skeleton className="h-4 w-3/5 bg-gray-200 dark:bg-gray-700" />
                        <Skeleton className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700" />
                    </div>
                </div>
                <div className="flex gap-2 mt-4 sm:mt-0 self-end sm:self-center">
                    <Skeleton className="h-9 w-24 bg-gray-300 dark:bg-gray-600 rounded-md" />
                    <Skeleton className="h-9 w-9 bg-gray-300 dark:bg-gray-600 rounded-md" />
                </div>
            </Card>
        ))}
    </div>
);

type BloodworkResultParsedItem = { name: string; value: string };
type BloodworkResultWithResults = BloodworkResult & { results?: string };
const BloodworkTrendChart: React.FC<{ documents: BloodworkResultWithResults[]; dataKey: string; name: string; unit: string; normalRange: [number, number] }> = ({ documents, dataKey, name, unit, normalRange }) => {
    const chartData = useMemo(() => {
    return documents
      .map(doc => {
        try {
          // The results property is a JSON string of key-value pairs, not an array
          const resultsObj: Record<string, string | number> = doc.results ? JSON.parse(doc.results) : {};
          // Try to find a matching key
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
      .filter((item): item is { date: Date; value: number; name: string } => item !== null)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [documents, dataKey]);

    if (chartData.length < 2) {
        return <div className="flex items-center justify-center h-[200px] text-center text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-md">Not enough data to display a trend for {name}.</div>;
    }

    const dataValues = chartData.map(d => d.value);
    const yMin = Math.min(...dataValues, normalRange[0]);
    const yMax = Math.max(...dataValues, normalRange[1]);
    const yPadding = (yMax - yMin) * 0.2 || 5;
    const yDomain: [number, number] = [Math.max(0, Math.floor(yMin - yPadding)), Math.ceil(yMax + yPadding)];

    return (
        <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} unit={unit} domain={yDomain} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <ReferenceArea y1={normalRange[0]} y2={normalRange[1]} fill="hsl(var(--primary))" fillOpacity={0.05} label={{ value: "Normal Range", position: "insideTopRight", fill: "hsl(var(--muted-foreground))", fontSize: 10, dy: 10, dx: -10 }} />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} name={name} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6, stroke: 'hsl(var(--background))', strokeWidth: 2 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

const BloodworkPage: React.FC = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [testName, setTestName] = useState('');
  const [summary, setSummary] = useState('');
  const [recordedAt, setRecordedAt] = useState('');
  const [documents, setDocuments] = useState<BloodworkResultWithResults[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [docToDelete, setDocToDelete] = useState<BloodworkResultWithResults | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<BloodworkResultWithResults | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !testName || !recordedAt || !user?.$id) {
      toast({ title: "Missing Information", description: "Please provide a test name, date, and select a file.", variant: "destructive" });
      return;
    }
    setIsUploading(true);
    try {
      const data: CreateBloodworkData = { userId: user.$id, testName, recordedAt, file, summary };
      await createBloodworkResult(data);
      toast({ title: "Success", description: "Bloodwork result uploaded successfully. AI is analyzing the report." });
      setFile(null);
      setTestName('');
      setSummary('');
      setRecordedAt('');
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
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

  const getSafeFilePreviewUrl = (fileId: string): string => {
    try {
        if (!medicalBucketId) throw new Error("Bucket ID not configured.");
        return getFilePreview(fileId, medicalBucketId).toString();
    } catch { return ''; }
  };

  return (
    <MainLayout requireAuth>
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-10 md:mb-12">
          <h1 className="text-3xl font-extrabold text-mamasaheli-dark sm:text-4xl tracking-tight text-center md:text-left">Bloodwork Dashboard</h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto md:mx-0 text-center md:text-left">
            Visualize, track, and manage your lab reports and blood test results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Reports</CardTitle><BriefcaseMedical className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent>{isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{dashboardStats.total}</div>}<p className="text-xs text-muted-foreground">reports uploaded</p></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Most Recent</CardTitle><FileClock className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent>{isLoading ? <Skeleton className="h-8 w-32" /> : <div className="text-2xl font-bold">{dashboardStats.recentDate || 'N/A'}</div>}<p className="text-xs text-muted-foreground">date of last report</p></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">CBC Reports</CardTitle><TestTube2 className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent>{isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{dashboardStats.commonTestCount}</div>}<p className="text-xs text-muted-foreground">complete blood count tests</p></CardContent></Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-8">
            <Card className="lg:col-span-3"><CardHeader><CardTitle>Hemoglobin (Hgb) Trend</CardTitle><CardDescription>Normal range for pregnancy: 11-14 g/dL</CardDescription></CardHeader><CardContent><BloodworkTrendChart documents={documents} dataKey="hemoglobin" name="Hgb" unit=" g/dL" normalRange={[11, 14]} /></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-2">
            <Card className="shadow-lg border border-gray-200 rounded-lg overflow-hidden bg-white sticky top-24">
              <CardHeader className="bg-gradient-to-r from-mamasaheli-light to-white p-5 border-b border-gray-200"><CardTitle className="flex items-center text-xl font-semibold text-mamasaheli-primary"><PlusCircle className="mr-2.5 h-5 w-5" /> Add New Result</CardTitle></CardHeader>
              <form onSubmit={handleUpload}>
                <CardContent className="p-6 space-y-5">
                  <div className="space-y-1.5"><Label htmlFor="testName">Test Name *</Label><Input id="testName" value={testName} onChange={e => setTestName(e.target.value)} placeholder="e.g., Iron Panel, CBC" required disabled={isUploading} /></div>
                  <div className="space-y-1.5"><Label htmlFor="recordedAt">Date of Test *</Label><Input id="recordedAt" type="date" value={recordedAt} onChange={e => setRecordedAt(e.target.value)} required disabled={isUploading} /></div>
                  <div className="space-y-1.5"><Label htmlFor="file-upload">Lab Report File *</Label><Input id="file-upload" type="file" onChange={handleFileChange} disabled={isUploading} /><p className="text-xs text-gray-500">AI will analyze this file. PDF, JPG, PNG accepted.</p></div>
                  <Button type="submit" disabled={isUploading || !file || !testName || !recordedAt} className="w-full bg-mamasaheli-primary hover:bg-mamasaheli-dark">{isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading & Analyzing...</> : <><Upload className="mr-2 h-4 w-4" /> Upload & Analyze</>}</Button>
                </CardContent>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="shadow-lg border border-gray-200 rounded-lg overflow-hidden bg-white">
              <CardHeader className="bg-gradient-to-r from-mamasaheli-light to-white p-5 border-b border-gray-200"><CardTitle className="flex items-center text-xl font-semibold text-mamasaheli-primary"><BriefcaseMedical className="mr-2.5 h-5 w-5" /> Your History</CardTitle><CardDescription className="text-sm text-gray-500 mt-1">A list of your uploaded bloodwork results, sorted by most recent.</CardDescription></CardHeader>
              <CardContent className="p-4 md:p-6 min-h-[300px]">
                {isLoading ? <ResultsSkeleton /> : documents.length > 0 ? (
                  <div className="space-y-4">
                    {documents.map(doc => (
                      <Card key={doc.$id} className="flex flex-col sm:flex-row items-start justify-between p-4 border hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 flex-grow overflow-hidden">
                            <FileText className="h-8 w-8 text-mamasaheli-primary flex-shrink-0" />
                            <div className="overflow-hidden">
                                <p className="font-semibold text-gray-800 truncate" title={doc.testName}>{doc.testName}</p>
                                <p className="text-sm text-gray-500">{format(new Date(doc.recordedAt), 'MMMM d, yyyy')}<span className="mx-1.5">•</span><span className="italic" title={doc.fileName}>{doc.fileName}</span></p>
                                {doc.summary && <p className="text-xs text-gray-600 mt-1 line-clamp-1 italic">AI Summary: {doc.summary}</p>}
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                            <Button variant="outline" size="sm" onClick={() => setSelectedDoc(doc)}>View Report</Button>
                            <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" size="icon" onClick={() => setDocToDelete(doc)}><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the result for "{docToDelete?.testName}".</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => setDocToDelete(null)}>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed"><Inbox className="mx-auto h-12 w-12 text-gray-400" /><p className="mt-4 font-medium text-gray-700">No bloodwork results found.</p><p className="mt-1 text-sm text-gray-500">Use the form on the left to upload your first result.</p></div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0">
            {selectedDoc && (
                <>
                    <DialogHeader className="p-4 border-b flex-shrink-0"><DialogTitle className="truncate">{selectedDoc.testName}</DialogTitle><DialogDescription>Report: {selectedDoc.fileName} • Date: {format(new Date(selectedDoc.recordedAt), 'MMMM d, yyyy')}</DialogDescription><DialogClose className="absolute right-4 top-4" /></DialogHeader>
                    <div className="grid md:grid-cols-2 gap-4 p-4 flex-grow min-h-0">
                        <div className="border rounded-md overflow-hidden flex flex-col bg-gray-50"><iframe src={getSafeFilePreviewUrl(selectedDoc.fileId)} className="w-full h-full flex-grow" title={selectedDoc.fileName} /></div>
                        <div className="flex flex-col gap-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">AI Extracted Results</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ScrollArea className="h-64">
                                  {(() => {
                                    let parsed;
                                    const raw = selectedDoc.results || '';
                                    try {
                                      parsed = raw ? JSON.parse(raw) : {};
                                    } catch {
                                      return <span className="italic text-red-500">Error parsing results.</span>;
                                    }
                                    // Support both array and object formats
                                    let resultsArr = [];
                                    let summaryText = '';
                                    if (Array.isArray(parsed)) {
                                      resultsArr = parsed;
                                    } else if (parsed.results && Array.isArray(parsed.results)) {
                                      resultsArr = parsed.results;
                                      summaryText = parsed.summary || '';
                                    }
                                    const hasResults = resultsArr.length > 0;
                                    const hasSummary = summaryText || (parsed.summary && typeof parsed.summary === 'string');
                                    return (
                                      <>
                                        {/* Debug output for raw results */}
                                        <details className="mb-2">
                                          <summary className="text-xs text-gray-400 cursor-pointer">Show raw AI results JSON</summary>
                                          <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded border overflow-x-auto max-h-32 whitespace-pre-wrap">{raw}</pre>
                                        </details>
                                        {hasSummary && (
                                          <div className="mb-2 p-2 rounded bg-blue-50 text-blue-900 text-sm font-medium border border-blue-200">{summaryText || parsed.summary}</div>
                                        )}
                                        {hasResults ? (
                                          <table className="min-w-full text-xs border rounded overflow-hidden">
                                            <thead className="bg-gray-100 dark:bg-gray-800">
                                              <tr>
                                                <th className="px-2 py-1 text-left">Name</th>
                                                <th className="px-2 py-1 text-left">Value</th>
                                                <th className="px-2 py-1 text-left">Unit</th>
                                                <th className="px-2 py-1 text-left">Reference Range</th>
                                                <th className="px-2 py-1 text-left">Flag</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {resultsArr.map((item, idx) => (
                                                <tr key={idx} className="border-b last:border-b-0">
                                                  <td className="px-2 py-1 font-semibold text-gray-800 dark:text-gray-200">{item.name}</td>
                                                  <td className="px-2 py-1">{item.value}</td>
                                                  <td className="px-2 py-1">{item.unit}</td>
                                                  <td className="px-2 py-1 text-gray-500">{item.referenceRange}</td>
                                                  <td className={`px-2 py-1 font-bold rounded ${item.flag === 'High' ? 'bg-red-100 text-red-700' : item.flag === 'Low' ? 'bg-yellow-100 text-yellow-700' : item.flag === 'Normal' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{item.flag}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        ) : (
                                          <span className="italic text-gray-500">No structured data extracted.</span>
                                        )}
                                      </>
                                    );
                                  })()}
                                </ScrollArea>
                              </CardContent>
                            </Card>
                            <Button asChild variant="outline" className="mt-auto"><a href={getSafeFilePreviewUrl(selectedDoc.fileId)} download={selectedDoc.fileName} target="_blank" rel="noopener noreferrer"><Download className="mr-2 h-4 w-4" /> Download File</a></Button>
                        </div>
                    </div>
                </>
            )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default BloodworkPage;