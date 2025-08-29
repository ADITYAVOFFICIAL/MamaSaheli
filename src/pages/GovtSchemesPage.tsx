import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { HandCoins, Target, FileText, ExternalLink, Library, Building2, Globe, Baby, Heart, User, Users } from 'lucide-react';
import { getGovtSchemes, GovernmentScheme, SchemeCategory } from '@/lib/govtschemes';

const SchemeCard: React.FC<{ scheme: GovernmentScheme }> = ({ scheme }) => (
  <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow border-l-4 border-mamasaheli-primary dark:border-mamasaheli-accent bg-white dark:bg-gray-800/50">
    <CardHeader>
      <div className="flex justify-between items-start gap-2">
        <CardTitle className="text-lg font-bold text-mamasaheli-dark dark:text-white">{scheme.name}</CardTitle>
        <Badge variant="secondary" className="flex-shrink-0">{scheme.category}</Badge>
      </div>
      {scheme.state && <p className="text-xs font-semibold text-mamasaheli-secondary dark:text-blue-400">{scheme.state} Specific</p>}
      <CardDescription className="text-sm pt-1">{scheme.description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4 flex-grow">
      <div>
        <h4 className="font-semibold text-sm flex items-center gap-2 mb-1"><Target className="h-4 w-4 text-mamasaheli-secondary" />Eligibility</h4>
        <div className="prose prose-sm text-muted-foreground dark:text-gray-400 max-w-none prose-ul:list-disc prose-li:my-0.5">
          <ReactMarkdown>{scheme.eligibility}</ReactMarkdown>
        </div>
      </div>
      <div>
        <h4 className="font-semibold text-sm flex items-center gap-2 mb-1"><HandCoins className="h-4 w-4 text-mamasaheli-accent" />Benefits</h4>
        <div className="prose prose-sm text-muted-foreground dark:text-gray-400 max-w-none prose-ul:list-disc prose-li:my-0.5">
          <ReactMarkdown>{scheme.benefits}</ReactMarkdown>
        </div>
      </div>
       <div>
        <h4 className="font-semibold text-sm flex items-center gap-2 mb-1"><FileText className="h-4 w-4 text-gray-500" />Documents Required</h4>
        <div className="prose prose-sm text-muted-foreground dark:text-gray-400 max-w-none prose-ul:list-disc prose-li:my-0.5">
          <ReactMarkdown>{scheme.documentsRequired}</ReactMarkdown>
        </div>
      </div>
    </CardContent>
    <CardFooter className="flex flex-wrap gap-2 pt-4 border-t dark:border-gray-700">
      {scheme.applicationLink && (
        <Button asChild size="sm" className="flex-1 min-w-[120px]">
          <a href={scheme.applicationLink} target="_blank" rel="noopener noreferrer">
            <FileText className="mr-2 h-4 w-4" /> Apply Now
          </a>
        </Button>
      )}
      <Button asChild variant="outline" size="sm" className="flex-1 min-w-[120px]">
        <a href={scheme.sourceLink} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="mr-2 h-4 w-4" /> Official Source
        </a>
      </Button>
    </CardFooter>
  </Card>
);

const SchemeSkeleton: React.FC = () => (
    <Card className="flex flex-col h-full">
        <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
        </CardHeader>
        <CardContent className="space-y-4 flex-grow">
            <Skeleton className="h-4 w-1/4 mb-1" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-4 w-1/4 mt-3 mb-1" />
            <Skeleton className="h-3 w-full" />
        </CardContent>
        <CardFooter className="flex gap-2 pt-4 border-t">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
        </CardFooter>
    </Card>
);

const categoryIcons: Record<SchemeCategory['title'], React.ElementType> = {
    "For Pregnant Women": Heart,
    "For Newborn Babies": Baby,
    "For the Girl Child": User,
    "For Those Trying to Conceive": Users,
};

const GovtSchemesPage: React.FC = () => {
  const [schemes, setSchemes] = useState<SchemeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const data = getGovtSchemes();
    setSchemes(data);
    setIsLoading(false);
  }, []);

  return (
    <MainLayout requireAuth>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <header className="mb-10 md:mb-12 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 sm:text-4xl tracking-tight">
            Government Schemes Guide
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-3xl mx-auto">
            An overview of key national and state-level government schemes for maternal and child welfare in India.
          </p>
        </header>

        <div className="space-y-12">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
                <section key={i}>
                    <Skeleton className="h-8 w-1/3 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <SchemeSkeleton />
                        <SchemeSkeleton />
                        <SchemeSkeleton />
                    </div>
                </section>
            ))
          ) : schemes.length > 0 ? (
            schemes.map((category) => {
                const Icon = categoryIcons[category.title] || Library;
                return (
                    <section key={category.title}>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-mamasaheli-dark dark:text-white border-b pb-2">
                            <Icon className="h-6 w-6 text-mamasaheli-primary" />
                            {category.title}
                        </h2>
                        <p className="text-muted-foreground mb-6">{category.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {category.schemes.map(scheme => <SchemeCard key={scheme.id} scheme={scheme} />)}
                        </div>
                    </section>
                )
            })
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg bg-gray-50 dark:bg-gray-800/30">
              <Library className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-800 dark:text-gray-200">No Schemes Information Available</h3>
              <p className="mt-2 text-sm text-muted-foreground">The list of government schemes could not be loaded at this time.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default GovtSchemesPage;