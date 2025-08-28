import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { pregnancyWeekData, PregnancyWeekInfo as WeekInfoType } from '@/lib/pregnancyWeekData';
import { Baby, Scale, Ruler, Lightbulb } from 'lucide-react';

interface PregnancyWeekInfoProps {
  weeksPregnant: number | null | undefined;
}

const PlaceholderCard: React.FC<{ title: string; message: string }> = ({ title, message }) => (
  <Card className="h-full flex flex-col">
    <CardHeader>
      <CardTitle className="flex items-center text-lg font-semibold text-mamasaheli-primary">
        <Baby className="mr-2 h-5 w-5" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="flex-grow flex flex-col items-center justify-center text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </CardContent>
  </Card>
);

const PregnancyWeekInfo: React.FC<PregnancyWeekInfoProps> = ({ weeksPregnant }) => {
  if (weeksPregnant === null || weeksPregnant === undefined || weeksPregnant < 4 || weeksPregnant > 41) {
    return (
      <PlaceholderCard
        title="Baby's Development"
        message="Update your profile with your current week of pregnancy (week 4 or later) to see your baby's weekly progress!"
      />
    );
  }

  const weekData: WeekInfoType | undefined = pregnancyWeekData.find(
    (data) => data.week === weeksPregnant
  );

  if (!weekData) {
    return (
      <PlaceholderCard
        title="Baby's Development"
        message={`Information for week ${weeksPregnant} is not available yet. Check back soon!`}
      />
    );
  }

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-mamasaheli-light/20 to-white dark:from-gray-800/30 dark:to-gray-900/20 border-mamasaheli-primary/20">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center text-lg font-semibold text-mamasaheli-primary dark:text-mamasaheli-light">
            <Baby className="mr-2 h-5 w-5" />
            Your Baby This Week
          </CardTitle>
          <div className="flex flex-col items-end gap-1.5">
            <Badge variant="secondary" className="text-sm">Week {weekData.week}</Badge>
            <Badge variant="outline" className="text-xs">Trimester {weekData.trimester}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="flex flex-col items-center text-center">
          <div className="flex-shrink-0 w-40 h-40 bg-white/50 dark:bg-gray-800/50 rounded-full flex items-center justify-center p-2 shadow-inner mb-4">
            <img
              src={weekData.imageUrl}
              alt={`Illustration of a ${weekData.comparison.name}`}
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = `https://placehold.co/150x150/a29bfe/FFFFFF/png?text=${weekData.comparison.name.replace(' ', '+')}`;
              }}
            />
          </div>
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            Your baby is about the size of a
          </p>
          <p className="text-2xl md:text-3xl font-bold text-mamasaheli-dark dark:text-white my-1">
            {weekData.comparison.name}
            {weekData.comparison.indianName && (
              <span className="text-xl md:text-2xl text-muted-foreground font-medium ml-2">({weekData.comparison.indianName})</span>
            )}
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground dark:text-gray-300 mt-3">
            <span className="flex items-center">
              <Ruler className="mr-1.5 h-4 w-4 text-mamasaheli-secondary" />
              {weekData.lengthCm} <span className="text-xs ml-1 text-gray-400">({weekData.lengthMeasurementType})</span>
            </span>
            <span className="flex items-center">
              <Scale className="mr-1.5 h-4 w-4 text-mamasaheli-accent" />
              {weekData.weightGrams}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <h4 className="font-semibold text-mamasaheli-dark dark:text-white mb-2">Baby's Development</h4>
            <p className="text-sm text-gray-700 dark:text-gray-200 bg-white/30 dark:bg-gray-900/20 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              {weekData.babyDevelopment}
            </p>
          </div>
          <div>
            <h4 className="flex items-center font-semibold text-mamasaheli-secondary dark:text-mamasaheli-light/90 mb-2">
              <Lightbulb className="mr-1.5 h-4 w-4" />
              A Tip for You
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-200 bg-mamasaheli-light/30 dark:bg-gray-900/30 p-3 rounded-lg border border-mamasaheli-secondary/20">
              {weekData.momTip}
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
            Disclaimer: Baby size comparisons are conceptual estimates. This information is for general reference and should not replace professional medical advice.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PregnancyWeekInfo;
