import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface PreChatFormProps {
  isContextLoading: boolean;
  isStartingChat: boolean;
  feeling: string;
  setFeeling: (v: string) => void;
  age: string;
  setAge: (v: string) => void;
  weeksPregnant: string;
  setWeeksPregnant: (v: string) => void;
  preExistingConditions: string;
  setPreExistingConditions: (v: string) => void;
  specificConcerns: string;
  setSpecificConcerns: (v: string) => void;
  feelingOptions: string[];
  userProfile: any;
  handleStartChat: () => void;
  error: string | null;
}

const PreChatForm: React.FC<PreChatFormProps> = ({
  isContextLoading,
  isStartingChat,
  feeling,
  setFeeling,
  age,
  setAge,
  weeksPregnant,
  setWeeksPregnant,
  preExistingConditions,
  setPreExistingConditions,
  specificConcerns,
  setSpecificConcerns,
  feelingOptions,
  userProfile,
  handleStartChat,
  error
}) => (
  <Card className="w-full max-w-3xl mx-auto mt-8 animate-fade-in border border-mamasaheli-primary/20 dark:border-gray-700/50 shadow-lg">
    <CardHeader>
      <CardTitle className="text-2xl sm:text-3xl font-bold text-mamasaheli-primary dark:text-mamasaheli-light text-center">
        MamaSaheli Assistant
      </CardTitle>
      <CardDescription className="text-center text-gray-600 dark:text-gray-400 mt-1">
        Let's personalize your chat experience.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-5 px-6 pb-6 pt-4">
      {isContextLoading ? (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-mamasaheli-primary dark:text-mamasaheli-light" aria-label="Loading profile" />
          <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">Loading your profile...</span>
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="feeling-select" className="dark:text-gray-300 font-medium">
              How are you feeling today? *
            </Label>
            <Select value={feeling} onValueChange={setFeeling} required>
              <SelectTrigger id="feeling-select" className="w-full dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 focus:ring-mamasaheli-primary/50">
                <SelectValue placeholder="Select how you feel" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:text-gray-200">
                {feelingOptions.map((option) => (
                  <SelectItem key={option} value={option} className="dark:focus:bg-gray-700">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {feeling === "Other (Specify in concerns)" && (
              <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                Please add details in the "Specific Concerns" box below.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="age" className="dark:text-gray-300 font-medium">
              Your Age *
            </Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter your current age"
              required
              min="11"
              max="99"
              className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 focus:ring-mamasaheli-primary/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="weeksPregnant" className="dark:text-gray-300 font-medium">
              Weeks Pregnant (Optional)
            </Label>
            <Input
              id="weeksPregnant"
              type="number"
              value={weeksPregnant}
              onChange={(e) => setWeeksPregnant(e.target.value)}
              placeholder={userProfile?.weeksPregnant !== undefined && !weeksPregnant ? `Current in profile: ${userProfile.weeksPregnant}` : "e.g., 12"}
              min="0"
              max="45"
              className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 focus:ring-mamasaheli-primary/50"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Leave blank to use profile value (if set).
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="preExistingConditions" className="dark:text-gray-300 font-medium">
              Pre-existing Conditions (Optional)
            </Label>
            <Textarea
              id="preExistingConditions"
              value={preExistingConditions}
              onChange={(e) => setPreExistingConditions(e.target.value)}
              placeholder="e.g., gestational diabetes, hypertension, none"
              rows={2}
              maxLength={300}
              className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 resize-none focus:ring-mamasaheli-primary/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="specificConcerns" className="dark:text-gray-300 font-medium">
              Specific Concerns Today (Optional)
            </Label>
            <Textarea
              id="specificConcerns"
              value={specificConcerns}
              onChange={(e) => setSpecificConcerns(e.target.value)}
              placeholder="Anything specific on your mind? e.g., back pain, questions about nutrition, details if feeling 'Other'"
              rows={2}
              maxLength={300}
              className="dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 resize-none focus:ring-mamasaheli-primary/50"
            />
          </div>
        </>
      )}
    </CardContent>
    <CardFooter className="flex justify-end px-6 pb-5 pt-4">
      <Button
        onClick={handleStartChat}
        disabled={isStartingChat || isContextLoading || !feeling || !age.trim()}
        className="bg-mamasaheli-primary hover:bg-mamasaheli-dark dark:bg-mamasaheli-primary dark:hover:bg-mamasaheli-dark min-w-[120px] transition-colors"
      >
        {isStartingChat ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Starting...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
            Start Chat
          </>
        )}
      </Button>
    </CardFooter>
    {error && (
      <p className="text-red-600 dark:text-red-400 text-sm px-6 py-4 text-center border-t dark:border-gray-700/50">
        {error}
      </p>
    )}
  </Card>
);

export default PreChatForm;
