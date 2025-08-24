import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { functions } from '@/lib/appwrite';
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
    const { logout } = useAuthStore();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [isDownloading, setIsDownloading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    /**
     * Handles the "Right to Access" request.
     * Triggers the 'export' action in the Appwrite Function and downloads the resulting data.
     */
    const handleDownloadData = async () => {
        setIsDownloading(true);
        toast({ title: "Preparing Your Data...", description: "This may take a moment. Your download will begin automatically." });
        try {
            // Call the combined function with the 'export' action
            const result = await functions.createExecution(
                'manageUserData', // The Function Name or ID
                JSON.stringify({ action: 'export' }), // The body payload specifying the action
                false // `async` parameter, false for a synchronous response
            );

            // The function's response body contains the JSON data.
            // We create a downloadable file from it on the client-side.
            const blob = new Blob([result.response], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `mamasaheli_my_data.json`;
            document.body.appendChild(a);
            a.click();
            
            // Clean up the temporary URL
            window.URL.revokeObjectURL(url);
            a.remove();

        } catch (error: any) {
            toast({ title: "Download Failed", description: error.message || "Could not export your data.", variant: "destructive" });
        } finally {
            setIsDownloading(false);
        }
    };

    /**
     * Handles the "Right to Erasure" request.
     * Triggers the 'delete' action in the Appwrite Function after user confirmation.
     */
    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            // Call the combined function with the 'delete' action
            await functions.createExecution(
                'manageUserData', // The Function Name or ID
                JSON.stringify({ action: 'delete' }), // The body payload
                false
            );

            toast({ title: "Account Deleted", description: "Your account and all associated data have been permanently removed. You will be logged out." });
            
            // After successful deletion, log the user out and redirect to the homepage
            await logout();
            navigate('/');

        } catch (error: any) {
            toast({ title: "Deletion Failed", description: error.message || "Could not delete your account. Please contact support.", variant: "destructive" });
            setIsDeleting(false); // Only reset loading state on failure
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
                {/* Download Data Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-md bg-white dark:bg-gray-800">
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Export Your Data (Right to Access)</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Download a JSON file containing all of your account and health data.</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleDownloadData}
                        disabled={isDownloading}
                        className="mt-3 sm:mt-0 w-full sm:w-auto"
                    >
                        {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        {isDownloading ? 'Exporting...' : 'Export Data'}
                    </Button>
                </div>

                {/* Delete Account Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-md bg-white dark:bg-gray-800">
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Delete Your Account (Right to Erasure)</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Permanently delete your account and all associated data.</p>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="mt-3 sm:mt-0 w-full sm:w-auto" disabled={isDeleting}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Account
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