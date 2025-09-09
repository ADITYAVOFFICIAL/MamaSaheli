// src/components/dashboard/DailyMealRecommendation.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Salad, Sparkles, AlertTriangle, Clock, BookOpen, ListChecks, UtensilsCrossed, X as CloseIcon } from 'lucide-react';
import { geminiMealService, MealIdea } from '@/lib/geminiMeal';
import { getUserProfile } from '@/lib/appwrite';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface CachedMeal {
  timestamp: number;
  data: MealIdea;
}

const DailyMealRecommendation: React.FC = () => {
  const [recommendation, setRecommendation] = useState<MealIdea | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true for initial check
  const [error, setError] = useState<string | null>(null);
  const [isStepsModalOpen, setIsStepsModalOpen] = useState(false);
  const { user } = useAuthStore();
  const { toast } = useToast();

  const getCacheKey = useCallback(() => {
    if (!user?.$id) return null;
    return `mealRecommendation_${user.$id}`;
  }, [user?.$id]);

  const handleGenerateRecommendation = useCallback(async (isManualRequest: boolean = true) => {
    const cacheKey = getCacheKey();
    if (!cacheKey) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    if (isManualRequest) {
      setRecommendation(null); // Clear old recommendation for better UX on manual refresh
    }
    setIsLoading(true);
    setError(null);

    try {
      const profile = await getUserProfile(user!.$id);
      if (!profile) {
        throw new Error("Could not load your user profile for personalization. Please complete it first.");
      }

      const response = await geminiMealService.generatePersonalizedMeals(profile, { count: 1 });
      
      if (response.meals && response.meals.length > 0) {
        const newRecommendation = response.meals[0];
        setRecommendation(newRecommendation);
        // Cache the new recommendation
        const cacheData: CachedMeal = {
          timestamp: Date.now(),
          data: newRecommendation,
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } else {
        throw new Error("The AI could not generate a recommendation at this time. Please try again.");
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        title: "Failed to get recommendation",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, getCacheKey]);
  
  useEffect(() => {
    const cacheKey = getCacheKey();
    if (!cacheKey) {
        setIsLoading(false);
        return;
    }

    const cachedItem = localStorage.getItem(cacheKey);
    if (cachedItem) {
        try {
            const parsedCache: CachedMeal = JSON.parse(cachedItem);
            const isCacheValid = (Date.now() - parsedCache.timestamp) < 24 * 60 * 60 * 1000; // 24 hours

            if (isCacheValid && parsedCache.data) {
                setRecommendation(parsedCache.data);
                setIsLoading(false);
                return; // Exit if valid cache is found
            }
        } catch {
            localStorage.removeItem(cacheKey); // Clear corrupted cache
        }
    }

    // If no valid cache, fetch automatically on first load
    handleGenerateRecommendation(false);
  }, [getCacheKey, handleGenerateRecommendation]);


  return (
    <>
      <Card className="h-full flex flex-col bg-white dark:bg-gray-800/50 border dark:border-gray-700 shadow-sm rounded-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-mamasaheli-dark dark:text-white">
            <Salad className="mr-2 h-5 w-5 text-mamasaheli-accent" />
            Daily Meal Recommendation
          </CardTitle>
          <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
            An AI-generated meal idea based on your profile. Refreshes daily.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow flex flex-col items-center justify-center text-center p-4 md:p-6">
          {isLoading ? (
            <div className="space-y-3" aria-live="polite">
              <Loader2 className="h-10 w-10 text-mamasaheli-primary animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">Generating your meal idea...</p>
            </div>
          ) : error ? (
            <div className="space-y-3 text-destructive" role="alert">
              <AlertTriangle className="h-10 w-10 mx-auto" />
              <p className="text-sm font-medium">Error</p>
              <p className="text-xs">{error}</p>
            </div>
          ) : recommendation ? (
            <div className="text-left space-y-4 w-full animate-fade-in">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{recommendation.mealType}</Badge>
                {recommendation.recipeComplexity && <Badge variant="outline">{recommendation.recipeComplexity}</Badge>}
                {recommendation.prepTime && <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" />{recommendation.prepTime}</Badge>}
              </div>
              <h3 className="text-xl font-bold text-mamasaheli-dark dark:text-white">{recommendation.name}</h3>
              <p className="text-sm text-muted-foreground dark:text-gray-300 line-clamp-3">{recommendation.description}</p>
              
              <Separator />

              {recommendation.keyIngredients && (
                  <div>
                      <h4 className="text-sm font-semibold mb-1 flex items-center gap-1.5 text-gray-600 dark:text-gray-400"><ListChecks className="h-4 w-4" />Key Ingredients:</h4>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{recommendation.keyIngredients.join(', ')}</p>
                  </div>
              )}
              {recommendation.macros && (
                <div>
                    <h4 className="text-sm font-semibold mb-1 flex items-center gap-1.5 text-gray-600 dark:text-gray-400"><UtensilsCrossed className="h-4 w-4" />Macros (Est.):</h4>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{recommendation.macros}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
               <Sparkles className="h-12 w-12 text-yellow-500 mx-auto" />
               <p className="text-sm text-muted-foreground max-w-xs">Click the button below to get a personalized, AI-generated meal idea for today.</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t dark:border-gray-700">
          {recommendation && !isLoading && (
            <Button onClick={() => setIsStepsModalOpen(true)} variant="secondary" className="w-full sm:w-auto">
              <BookOpen className="mr-2 h-4 w-4" />
              Show Recipe
            </Button>
          )}
          <Button onClick={() => handleGenerateRecommendation(true)} disabled={isLoading} className="w-full flex-grow">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {recommendation ? 'Get New Idea' : "Get Today's Meal Idea"}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isStepsModalOpen} onOpenChange={setIsStepsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col dark:bg-gray-900 dark:border-gray-700">
            {recommendation && (
                <>
                    <DialogHeader className="pr-10 relative border-b dark:border-gray-700 pb-4">
                        <DialogTitle className="text-xl md:text-2xl font-bold text-mamasaheli-primary dark:text-mamasaheli-light">{recommendation.name}</DialogTitle>
                        <DialogClose className="absolute right-3 top-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground p-1">
                            <CloseIcon className="h-5 w-5" />
                            <span className="sr-only">Close</span>
                        </DialogClose>
                    </DialogHeader>
                    <ScrollArea className="flex-grow pr-4">
                        <div className="grid gap-5 py-4 text-sm md:text-base">
                            <p className="text-muted-foreground italic">{recommendation.description}</p>
                            
                            {recommendation.preparationSteps && recommendation.preparationSteps.length > 0 && (
                                <div className='space-y-2'>
                                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 flex items-center gap-2"><ListChecks className="h-5 w-5 text-mamasaheli-secondary"/>Preparation Steps</h3>
                                    <ol className="list-decimal list-outside pl-5 text-gray-700 dark:text-gray-300 space-y-2 marker:font-medium marker:text-mamasaheli-primary dark:marker:text-mamasaheli-accent">
                                        {recommendation.preparationSteps.map((step, i) => <li key={`step-${i}`}>{step}</li>)}
                                    </ol>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </>
            )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DailyMealRecommendation;