// src/components/dashboard/ToolsAccessCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Wrench, ChevronRight, HeartPulse, Salad, Package, Gamepad2 } from 'lucide-react';

const ToolsAccessCard: React.FC = () => {
  // Array of tools to be displayed in the card
  const tools = [
    {
      path: '/schecker',
      label: 'Symptom Checker',
      description: 'Get general info on symptoms.',
      icon: HeartPulse,
      color: 'text-red-500 dark:text-red-400'
    },
    {
      path: '/meals',
      label: 'Meal & Exercise Ideas',
      description: 'AI-powered suggestions.',
      icon: Salad,
      color: 'text-green-500 dark:text-green-400'
    },
    {
      path: '/products',
      label: 'Product Suggestions',
      description: 'Find helpful products.',
      icon: Package,
      color: 'text-blue-500 dark:text-blue-400'
    },
    {
      path: '/games',
      label: 'Relaxing Games',
      description: 'Play and unwind.',
      icon: Gamepad2,
      color: 'text-purple-500 dark:text-purple-400'
    }
  ];

  return (
    <Card className="h-full flex flex-col shadow-sm border dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold">
          <Wrench className="mr-2 h-5 w-5 text-mamasaheli-secondary" />
          Access Your Tools
        </CardTitle>
        <CardDescription>
          Explore AI-powered tools to help you on your journey.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <div className="space-y-2">
          {tools.map((tool) => (
            <Link
              key={tool.path}
              to={tool.path}
              className="group flex items-center justify-between p-3 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/50"
              aria-label={`Navigate to ${tool.label}`}
            >
              <div className="flex items-center gap-4">
                <tool.icon className={`h-7 w-7 flex-shrink-0 ${tool.color}`} />
                <div>
                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{tool.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{tool.description}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-mamasaheli-secondary hover:bg-mamasaheli-secondary/90 text-white">
          <Link to="/logging">
            Go to Daily Logging
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ToolsAccessCard;