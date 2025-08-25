// src/components/DataPrivacyCard.tsx


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { functions } from '@/lib/appwrite'; // Assuming this is your configured Appwrite client
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Download, Trash2, AlertTriangle, Loader2 } from 'lucide-react';


export const DataPrivacyCard: React.FC = () => {
    const { logout, user } = useAuthStore();
    const navigate = useNavigate();
    const { toast } = useToast();


    const [isDownloading, setIsDownloading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);


    // Ensure this environment variable is correctly set in your Vite project (e.g., in .env.local)
    const manageUserDataFunctionId = import.meta.env.VITE_APPWRITE_MANAGE_USER_DATA;


    const handleDownloadData = async () => {
        if (!manageUserDataFunctionId) {
            toast({ title: "Configuration Error", description: "The data export feature is not configured.", variant: "destructive" });
            return;
        }


        setIsDownloading(true);
        toast({ title: "Preparing Your Data...", description: "This may take a moment. Your download will begin automatically." });


        try {
            const result = await functions.createExecution(
                manageUserDataFunctionId,
                JSON.stringify({ action: 'export' }),
                false // `false` for asynchronous execution is fine, but you could await it if needed
            );


            // **FIX**: Use `result.responseBody` instead of `result.response`
            const responseData = result.responseBody || '{}';


            // Check if the exported data is empty
            if (responseData === '{}') {
                toast({
                    title: "No Data to Export",
                    description: "We couldn't find any data associated with your account to export.",
                });
                return;
            }


            const blob = new Blob([responseData], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `mamasaheli_my_data_${user?.$id || 'export'}.json`;
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(url);
            a.remove();


            toast({ title: "Download Started", description: "Your data export has started successfully." });


        } catch (error: any) {
            console.error("Download Failed:", error);
            const errorMessage = error.message || "Could not export your data at this time. Please try again later.";
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


            toast({ title: "Account Deletion Successful", description: "Your account and all associated data have been permanently removed. You will now be logged out." });
            
            // Wait for logout to complete before navigating
            await logout();
            navigate('/');


        } catch (error: any) {
            console.error("Deletion Failed:", error);
            const errorMessage = error.message || "Could not delete your account. Please contact support if the issue persists.";
            toast({ title: "Deletion Failed", description: errorMessage, variant: "destructive" });
        } finally {
            // Ensure the deleting state is reset even if logout/navigation has issues
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
                        <h3 className="font-semibold">Export Your Data (Right to Access)</h3>
                        <p className="text-sm text-muted-foreground mt-1">Download a JSON file containing all of your account and health data.</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleDownloadData}
                        disabled={isDownloading}
                        className="mt-3 sm:mt-0 w-full sm:w-auto"
                        aria-live="polite"
                    >
                        {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        {isDownloading ? 'Exporting...' : 'Export Data'}
                    </Button>
                </div>


                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-md bg-background">
                    <div>
                        <h3 className="font-semibold">Delete Your Account (Right to Erasure)</h3>
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
                                    This action is permanent and cannot be undone. All of your data, including your profile, appointments, health records, and chat history, will be permanently deleted.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                    onClick={handleDeleteAccount} 
                                    disabled={isDeleting} 
                                    className="bg-destructive hover:bg-destructive/90"
                                    aria-live="polite"
                                >
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
