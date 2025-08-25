import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { functions } from '@/lib/appwrite';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Download, Trash2, AlertTriangle, Loader2, ChevronDown } from 'lucide-react';

interface UserData {
  [key: string]: any[];
}

const generatePdfFromData = (data: UserData, user: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    const addHeader = (docInstance: jsPDF) => {
        docInstance.setFontSize(22);
        docInstance.setFont('helvetica', 'bold');
        docInstance.text('MamaSaheli Data Export', pageWidth / 2, 20, { align: 'center' });
        docInstance.setFontSize(10);
        docInstance.setFont('helvetica', 'normal');
        docInstance.text(`User ID: ${user?.$id || 'N/A'}`, pageWidth / 2, 28, { align: 'center' });
        docInstance.text(`Export Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, 34, { align: 'center' });
    };

    const addFooter = (docInstance: jsPDF) => {
        const pageCount = docInstance.getNumberOfPages();
        docInstance.setFontSize(8);
        for (let i = 1; i <= pageCount; i++) {
            docInstance.setPage(i);
            docInstance.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        }
    };

    const toTitleCase = (str: string) =>
        str.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, (s) => s.toUpperCase());

    const safeFormatDate = (dateString: string) => {
        if (!dateString || isNaN(new Date(dateString).getTime())) {
            return "N/A";
        }
        return new Date(dateString).toLocaleString();
    };

    let startY = 50;
    addHeader(doc);

    Object.keys(data).forEach((key) => {
        if (!data[key] || data[key].length === 0) return;

        const isNewPageNeeded = (currentY: number) => currentY > pageHeight - 40;
        if (isNewPageNeeded(startY)) {
            doc.addPage();
            addHeader(doc);
            startY = 50;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(toTitleCase(key), margin, startY);
        startY += 10;

        if (key === 'profile') {
            const profileData = data.profile[0];
            const profileDetails = [
                { title: 'Name', value: profileData.name },
                { title: 'Email', value: profileData.email },
                { title: 'Age', value: profileData.age },
                { title: 'Gender', value: profileData.gender },
                { title: 'Weeks Pregnant', value: profileData.weeksPregnant },
                { title: 'Hospital', value: profileData.hospitalName },
                { title: 'Assigned Doctor', value: profileData.assignedDoctorName },
                { title: 'LMP Date', value: safeFormatDate(profileData.lmpDate).split(',')[0] },
                { title: 'Estimated Due Date', value: safeFormatDate(profileData.estimatedDueDate).split(',')[0] },
            ];
            autoTable(doc, {
                body: profileDetails.map(row => [row.title, row.value]),
                startY,
                theme: 'plain',
                styles: { fontSize: 10, cellPadding: 2 },
                columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 }, 1: { cellWidth: 'auto' } },
            });
            startY = (doc as any).lastAutoTable.finalY + 15;
            return;
        }

        if (key === 'bloodworkReports') {
            data[key].forEach(report => {
                if (isNewPageNeeded(startY + 20)) {
                    doc.addPage();
                    addHeader(doc);
                    startY = 50;
                }
                const summaryText = `Test: ${report.testName} | Recorded: ${safeFormatDate(report.recordedAt)}`;
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text(summaryText, margin, startY);
                startY += 6;
                doc.setFont('helvetica', 'italic');
                doc.text(`Summary: ${report.summary}`, margin, startY, { maxWidth: pageWidth - margin * 2 });
                startY += 10;

                try {
                    const results = JSON.parse(report.results);
                    if (Array.isArray(results)) {
                        autoTable(doc, {
                            head: [['Test', 'Value', 'Unit', 'Reference Range', 'Flag']],
                            body: results.map(res => [res.name, res.value, res.unit, res.referenceRange, res.flag]),
                            startY,
                            theme: 'grid',
                            headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold' },
                            styles: { fontSize: 8, cellPadding: 2 },
                        });
                        startY = (doc as any).lastAutoTable.finalY + 10;
                    }
                } catch (e) {
                    // Fallback for non-JSON results
                }
            });
            startY += 5;
            return;
        }

        const records = data[key];
        const tableHeaders = Object.keys(records[0] || {}).filter(header => !header.startsWith('$') && header !== 'userId');
        if (tableHeaders.length === 0) return;

        const tableBody = records.map(record =>
            tableHeaders.map(header => {
                let value = record[header];
                if (value === null || value === undefined) return '';
                if (header.toLowerCase().includes('date') || header.toLowerCase().includes('at')) {
                    return safeFormatDate(value);
                }
                if (header === 'times' && Array.isArray(value)) {
                    return value.join(', ');
                }
                if (typeof value === 'object') return JSON.stringify(value, null, 2);
                if (typeof value === 'boolean') return value ? 'Yes' : 'No';
                return String(value);
            })
        );

        autoTable(doc, {
            head: [tableHeaders.map(h => toTitleCase(h))],
            body: tableBody,
            startY,
            theme: 'striped',
            headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 2 },
        });
        startY = (doc as any).lastAutoTable.finalY + 15;
    });

    addFooter(doc);
    doc.save(`mamasaheli_data_${user?.$id || 'export'}.pdf`);
};

export const DataPrivacyCard: React.FC = () => {
    const { logout, user } = useAuthStore();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const manageUserDataFunctionId = import.meta.env.VITE_APPWRITE_MANAGE_USER_DATA;

    const handleDownloadData = async (format: 'json' | 'pdf') => {
        if (!manageUserDataFunctionId) {
            toast({ title: "Configuration Error", description: "The data export feature is not configured.", variant: "destructive" });
            return;
        }

        setIsDownloading(true);
        toast({ title: `Preparing Your ${format.toUpperCase()} Export...`, description: "This may take a moment." });

        try {
            const result = await functions.createExecution(
                manageUserDataFunctionId,
                JSON.stringify({ action: 'export' }),
                false
            );
            const responseData = result.responseBody || '{}';
            const parsedData = JSON.parse(responseData);

            if (Object.keys(parsedData).reduce((acc, key) => acc + parsedData[key].length, 0) === 0) {
                toast({ title: "No Data Found", description: "There is no data associated with your account to export." });
                return;
            }

            if (format === 'json') {
                const blob = new Blob([responseData], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `mamasaheli_data_${user?.$id || 'export'}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            } else if (format === 'pdf') {
                generatePdfFromData(parsedData, user);
            }
            toast({ title: "Download Started", description: `Your data export has begun.` });
        } catch (error: any) {
            console.error("Download Failed:", error);
            const errorMessage = error.message || "An unknown error occurred during the export.";
            toast({ title: "Download Failed", description: errorMessage, variant: "destructive" });
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!manageUserDataFunctionId) {
            toast({ title: "Configuration Error", description: "The account deletion feature is not configured.", variant: "destructive" });
            return;
        }

        setIsDeleting(true);
        try {
            await functions.createExecution(
                manageUserDataFunctionId,
                JSON.stringify({ action: 'delete' }),
                false
            );
            toast({ title: "Account Deletion Successful", description: "Your account has been permanently removed. You will be logged out." });
            await logout();
            navigate('/');
        } catch (error: any) {
            console.error("Deletion Failed:", error);
            const errorMessage = error.message || "Could not delete your account. Please contact support.";
            toast({ title: "Deletion Failed", description: errorMessage, variant: "destructive" });
            setIsDeleting(false);
        }
    };

    return (
        <Card className="border-destructive bg-red-50/50 dark:bg-red-900/20">
            <CardHeader>
                <CardTitle className="flex items-center text-destructive dark:text-red-400">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Data & Privacy
                </CardTitle>
                <CardDescription className="text-destructive/90 dark:text-red-400/80">
                    Manage your personal data and account settings. These actions are irreversible.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-md bg-background">
                    <div>
                        <h3 className="font-semibold">Export Your Data</h3>
                        <p className="text-sm text-muted-foreground mt-1">Download all of your data in JSON or PDF format.</p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" disabled={isDownloading} className="mt-3 sm:mt-0 w-full sm:w-auto">
                                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                {isDownloading ? 'Exporting...' : 'Export Data'}
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownloadData('json')} disabled={isDownloading}>
                                Export as JSON
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadData('pdf')} disabled={isDownloading}>
                                Export as PDF
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-md bg-background">
                    <div>
                        <h3 className="font-semibold">Delete Your Account</h3>
                        <p className="text-sm text-muted-foreground mt-1">Permanently delete your account and all associated data.</p>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="mt-3 sm:mt-0 w-full sm:w-auto" disabled={isDeleting}>
                                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                {isDeleting ? 'Deleting...' : 'Delete Account'}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action is permanent. All data will be deleted and cannot be recovered.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
};