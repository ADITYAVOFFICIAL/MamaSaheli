// components/logging/SymptomLogger.tsx
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Save, Loader2 } from 'lucide-react';

import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { createSymptomLog, Symptom } from '@/lib/appwrite';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const symptomsList: { name: Symptom; icon: string }[] = [
    { name: 'Back pain', icon: '🤕' }, { name: 'Bloating', icon: '🎈' },
    { name: 'Contractions', icon: '⚡️' }, { name: 'Sore breasts', icon: '🥥' },
    { name: 'Constipation', icon: '🚽' }, { name: 'Cramping', icon: '😖' },
    { name: 'Diarrhea', icon: '💨' }, { name: 'Dizziness', icon: '😵' },
    { name: 'Exhaustion', icon: '😴' }, { name: 'Food aversions', icon: '🤢' },
    { name: 'Food cravings', icon: '🍩' }, { name: 'Frequent urination', icon: '💧' },
    { name: 'Headaches', icon: '🤯' }, { name: 'Heartburn', icon: '🔥' },
    { name: 'Itching', icon: '🐜' }, { name: 'Insomnia', icon: '👁️' },
    { name: 'Morning sickness', icon: '🤮' }, { name: 'Pelvic pain', icon: '💥' },
    { name: 'Spotting', icon: '🩸' }, { name: 'Stuffy nose', icon: '🤧' },
    { name: 'Swelling', icon: '🎈' }, { name: 'Discharge', icon: '💧' },
    { name: 'Other', icon: '📋' },
];

export const SymptomLogger = () => {
    const { user } = useAuthStore();
    const { toast } = useToast();
    const [selectedSymptoms, setSelectedSymptoms] = useState<Set<Symptom>>(new Set());
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const toggleSymptom = (symptom: Symptom) => {
        setSelectedSymptoms(prev => {
            const newSet = new Set(prev);
            if (newSet.has(symptom)) {
                newSet.delete(symptom);
            } else {
                newSet.add(symptom);
            }
            return newSet;
        });
    };

    const handleSave = async () => {
        if (selectedSymptoms.size === 0) {
            toast({ title: "No Symptoms Selected", description: "Please select at least one symptom to log.", variant: "destructive" });
            return;
        }
        if (!user?.$id) return;

        setIsSaving(true);
        try {
            await createSymptomLog({
                userId: user.$id,
                symptoms: Array.from(selectedSymptoms),
                notes: notes || undefined,
                loggedAt: new Date().toISOString(),
            });
            toast({ title: "Symptoms Logged", description: "Your symptoms have been saved successfully." });
            setSelectedSymptoms(new Set());
            setNotes('');
        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : "Failed to save symptoms.";
            toast({ title: "Error", description: errMsg, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>What are you feeling?</CardTitle>
                <CardDescription>Select all symptoms that apply for today, {format(new Date(), 'MMMM d, yyyy')}.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 mb-6">
                    {symptomsList.map(({ name, icon }) => (
                        <Button
                            key={name}
                            variant={selectedSymptoms.has(name) ? 'default' : 'outline'}
                            onClick={() => toggleSymptom(name)}
                            className={`h-auto min-h-[5rem] p-3 flex items-center justify-start text-left transition-all duration-200 ${
                                selectedSymptoms.has(name) ? 'bg-mamasaheli-primary text-white' : ''
                            }`}
                        >
                            <span className="text-2xl mr-3">{icon}</span>
                            <span
    className="flex-1 text-sm font-medium leading-snug break-words whitespace-normal"
>
    {name}
</span>
                        </Button>
                    ))}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="symptom-notes">Notes (Optional)</Label>
                    <Textarea
    id="symptom-notes"
    placeholder="Write down what's going on for you..."
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    rows={3}
    className="break-words whitespace-normal"
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={isSaving || selectedSymptoms.size === 0} className="w-full sm:w-auto">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Symptoms
                </Button>
            </CardFooter>
        </Card>
    );
};