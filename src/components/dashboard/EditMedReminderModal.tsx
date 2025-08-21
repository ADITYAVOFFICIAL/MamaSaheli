import React, { useState } from 'react';
import { MedicationReminder } from '../../lib/appwrite';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { X, Loader2 } from 'lucide-react';

interface EditMedReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminder: MedicationReminder | null;
  onSubmit: (data: Partial<MedicationReminder>) => Promise<void>;
  isLoading?: boolean;
}

const EditMedReminderModal: React.FC<EditMedReminderModalProps> = ({ isOpen, onClose, reminder, onSubmit, isLoading }) => {
  const [form, setForm] = useState<Partial<MedicationReminder>>({});

  React.useEffect(() => {
    if (reminder) {
      setForm({
        medicationName: reminder.medicationName,
        dosage: reminder.dosage,
        frequency: reminder.frequency,
        times: reminder.times,
        notes: reminder.notes,
        isActive: reminder.isActive,
      });
    }
  }, [reminder]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminder) return;
    await onSubmit(form);
  };

  if (!isOpen || !reminder) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Medication Reminder</DialogTitle>
          <DialogDescription>
            Update the details for your medication reminder.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Medication Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="medName" className="text-right">Name*</Label>
              <Input id="medName" name="medicationName" value={form.medicationName || ''} onChange={handleChange} className="col-span-3" placeholder="e.g., Prenatal Vitamin" required />
            </div>
            {/* Dosage */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dosage" className="text-right">Dosage*</Label>
              <Input id="dosage" name="dosage" value={form.dosage || ''} onChange={handleChange} className="col-span-3" placeholder="e.g., 1 tablet, 10mg" required />
            </div>
            {/* Frequency */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="frequency" className="text-right">Frequency*</Label>
              <Select value={form.frequency || ''} onValueChange={val => setForm(prev => ({ ...prev, frequency: val }))} required>
                <SelectTrigger id="frequency" className="col-span-3">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Twice Daily">Twice Daily</SelectItem>
                  <SelectItem value="Three Times Daily">Three Times Daily</SelectItem>
                  <SelectItem value="Every Other Day">Every Other Day</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="As Needed">As Needed</SelectItem>
                  <SelectItem value="Other">Other (Specify in Notes)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Times */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Times</Label>
              <div className="col-span-3 space-y-2">
                {(form.times || ['']).map((time, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="time"
                      name="times"
                      value={time}
                      onChange={e => {
                        const newTimes = [...(form.times || [])];
                        newTimes[index] = e.target.value;
                        setForm(prev => ({ ...prev, times: newTimes }));
                      }}
                      className="flex-grow"
                      placeholder="HH:MM"
                      pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
                    />
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-100" onClick={() => {
                      const newTimes = [...(form.times || [])];
                      if (newTimes.length > 1) {
                        newTimes.splice(index, 1);
                        setForm(prev => ({ ...prev, times: newTimes }));
                      } else {
                        setForm(prev => ({ ...prev, times: [''] }));
                      }
                    }} aria-label="Remove time">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setForm(prev => ({ ...prev, times: [...(prev.times || ['']), ''] }))} className="text-xs">
                  + Add Time
                </Button>
              </div>
            </div>
            {/* Notes */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right pt-2">Notes</Label>
              <Textarea id="notes" name="notes" value={form.notes || ''} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} className="col-span-3 min-h-[60px]" placeholder="Optional notes (e.g., take with food)" />
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

export default EditMedReminderModal;
