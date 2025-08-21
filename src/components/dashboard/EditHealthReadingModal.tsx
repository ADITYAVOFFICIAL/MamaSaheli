import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface EditHealthReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'bp' | 'sugar' | 'weight';
  reading: any | null;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

const EditHealthReadingModal: React.FC<EditHealthReadingModalProps> = ({ isOpen, onClose, type, reading, onSubmit, isLoading }) => {
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (reading) {
      setForm(reading);
    }
  }, [reading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  if (!isOpen || !reading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit {type === 'bp' ? 'Blood Pressure' : type === 'sugar' ? 'Blood Sugar' : 'Weight'} Reading</DialogTitle>
          <DialogDescription>Update the details for this health reading.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {type === 'bp' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="systolic" className="text-right">Systolic*</Label>
                  <Input id="systolic" name="systolic" type="number" value={form.systolic || ''} onChange={handleChange} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="diastolic" className="text-right">Diastolic*</Label>
                  <Input id="diastolic" name="diastolic" type="number" value={form.diastolic || ''} onChange={handleChange} className="col-span-3" required />
                </div>
              </>
            )}
            {type === 'sugar' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="level" className="text-right">Sugar Level*</Label>
                  <Input id="level" name="level" type="number" value={form.level || ''} onChange={handleChange} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="measurementType" className="text-right">Type</Label>
                  <Input id="measurementType" name="measurementType" value={form.measurementType || ''} onChange={handleChange} className="col-span-3" placeholder="e.g., fasting" />
                </div>
              </>
            )}
            {type === 'weight' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="weight" className="text-right">Weight*</Label>
                  <Input id="weight" name="weight" type="number" value={form.weight || ''} onChange={handleChange} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unit" className="text-right">Unit</Label>
                  <Input id="unit" name="unit" value={form.unit || ''} onChange={handleChange} className="col-span-3" placeholder="e.g., kg" />
                </div>
              </>
            )}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right pt-2">Notes</Label>
              <Textarea id="notes" name="notes" value={form.notes || ''} onChange={handleChange} className="col-span-3 min-h-[40px]" placeholder="Optional notes" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading} className="bg-mamasaheli-primary hover:bg-mamasaheli-dark">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditHealthReadingModal;
