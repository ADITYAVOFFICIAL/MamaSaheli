import React, { useState } from 'react';
import { HeartPulse, Activity, Loader2 } from 'lucide-react';

import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import {
    createBloodPressureReading,
    createBloodSugarReading,
    createWeightReading,
} from '@/lib/appwrite';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const VitalsLogger = () => {
    const { user } = useAuthStore();
    const { toast } = useToast();
    const [bp, setBp] = useState({ systolic: '', diastolic: '' });
    const [sugar, setSugar] = useState<{ level: string; type: 'fasting' | 'post_meal' | 'random' }>({ level: '', type: 'fasting' });
    const [weight, setWeight] = useState<{ value: string; unit: 'kg' | 'lbs' }>({ value: '', unit: 'kg' });
    const [isSaving, setIsSaving] = useState<'bp' | 'sugar' | 'weight' | null>(null);

    const handleSave = async (type: 'bp' | 'sugar' | 'weight') => {
        if (!user?.$id) return;
        setIsSaving(type);
        try {
            if (type === 'bp') {
                if (!bp.systolic || !bp.diastolic) throw new Error("Systolic and Diastolic values are required.");
                await createBloodPressureReading(user.$id, { systolic: parseInt(bp.systolic), diastolic: parseInt(bp.diastolic) });
                setBp({ systolic: '', diastolic: '' });
            } else if (type === 'sugar') {
                if (!sugar.level) throw new Error("Sugar level is required.");
                await createBloodSugarReading(user.$id, { level: parseFloat(sugar.level), measurementType: sugar.type });
                setSugar({ level: '', type: 'fasting' });
            } else if (type === 'weight') {
                if (!weight.value) throw new Error("Weight value is required.");
                await createWeightReading(user.$id, { weight: parseFloat(weight.value), unit: weight.unit });
                setWeight({ value: '', unit: 'kg' });
            }
            toast({ title: "Reading Saved", description: `Your ${type.replace('bp', 'blood pressure')} reading has been logged.` });
        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : "Save Failed";
            toast({ title: "Save Failed", description: errMsg, variant: "destructive" });
        } finally {
            setIsSaving(null);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
                <CardHeader><CardTitle className="flex items-center"><HeartPulse className="mr-2 text-red-500" /> Blood Pressure</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><Label htmlFor="systolic">Systolic (mmHg)</Label><Input id="systolic" type="number" placeholder="120" value={bp.systolic} onChange={e => setBp(p => ({ ...p, systolic: e.target.value }))} /></div>
                        <div className="space-y-1"><Label htmlFor="diastolic">Diastolic (mmHg)</Label><Input id="diastolic" type="number" placeholder="80" value={bp.diastolic} onChange={e => setBp(p => ({ ...p, diastolic: e.target.value }))} /></div>
                    </div>
                    <Button onClick={() => handleSave('bp')} disabled={isSaving === 'bp'} className="w-full">{isSaving === 'bp' ? <Loader2 className="animate-spin" /> : 'Save BP'}</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="flex items-center"><Activity className="mr-2 text-blue-500" /> Blood Sugar</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1"><Label htmlFor="sugar-level">Level (mg/dL)</Label><Input id="sugar-level" type="number" placeholder="90" value={sugar.level} onChange={e => setSugar(p => ({ ...p, level: e.target.value }))} /></div>
                    <div className="space-y-1"><Label>Measurement Type</Label><div className="flex gap-2"><Button variant={sugar.type === 'fasting' ? 'default' : 'outline'} onClick={() => setSugar(p => ({ ...p, type: 'fasting' }))}>Fasting</Button><Button variant={sugar.type === 'post_meal' ? 'default' : 'outline'} onClick={() => setSugar(p => ({ ...p, type: 'post_meal' }))}>Post-Meal</Button></div></div>
                    <Button onClick={() => handleSave('sugar')} disabled={isSaving === 'sugar'} className="w-full">{isSaving === 'sugar' ? <Loader2 className="animate-spin" /> : 'Save Sugar'}</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="flex items-center"><Activity className="mr-2 text-green-500" /> Weight</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1"><Label htmlFor="weight-value">Weight</Label><Input id="weight-value" type="number" placeholder="65.5" value={weight.value} onChange={e => setWeight(p => ({ ...p, value: e.target.value }))} /></div>
                    <div className="space-y-1"><Label>Unit</Label><div className="flex gap-2"><Button variant={weight.unit === 'kg' ? 'default' : 'outline'} onClick={() => setWeight(p => ({ ...p, unit: 'kg' }))}>kg</Button><Button variant={weight.unit === 'lbs' ? 'default' : 'outline'} onClick={() => setWeight(p => ({ ...p, unit: 'lbs' }))}>lbs</Button></div></div>
                    <Button onClick={() => handleSave('weight')} disabled={isSaving === 'weight'} className="w-full">{isSaving === 'weight' ? <Loader2 className="animate-spin" /> : 'Save Weight'}</Button>
                </CardContent>
            </Card>
        </div>
    );
};