// src/pages/PricingPage.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, ArrowRight, Star, HeartHandshake } from 'lucide-react';

const pricingPlans = [
  {
    name: 'Free',
    priceMonthly: '₹0',
    billingCycle: '/ month',
    description: 'For individuals starting their journey, offering essential tools.',
    features: [
      { text: 'AI Chat Assistant (Limited Usage)', included: true },
      { text: 'Basic Appointment Scheduling', included: true },
      { text: 'Medical Document Storage (Up to 5 files)', included: true },
      { text: 'Access to Resource Articles', included: true },
      { text: 'Community Forum Access', included: true },
      { text: 'Personalized Dashboard (Basic)', included: true },
      { text: 'Stacking Game Access', included: true },
      { text: 'Personalized Meal & Exercise Ideas', included: false },
      { text: 'Priority Support', included: false },
    ],
    ctaText: 'Sign Up for Free',
    ctaLink: '/signup',
    isFeatured: false,
  },
  {
    name: 'Pro',
    priceMonthly: '₹199',
    billingCycle: '/ month',
    description: 'The complete toolkit for individuals seeking in-depth support and personalization.',
    features: [
      { text: 'AI Chat Assistant (Unlimited)', included: true },
      { text: 'Full Appointment Scheduling & Management', included: true },
      { text: 'Medical Document Storage (Up to 50 files)', included: true },
      { text: 'Access to All Resource Articles & Guides', included: true },
      { text: 'Community Forum Access', included: true },
      { text: 'Personalized Dashboard (Advanced Milestones)', included: true },
      { text: 'AI Product Suggestions', included: true },
      { text: 'Personalized Meal & Exercise Ideas', included: true },
      { text: 'Standard Email Support', included: true },
      { text: 'Stacking Game Access', included: true },
    ],
    ctaText: 'Choose Pro Plan',
    ctaLink: '/signup?plan=pro',
    isFeatured: true,
  },
  {
    name: 'Enterprise',
    priceMonthly: 'Custom',
    billingCycle: ' / For Clinics & Hospitals',
    description: 'A tailored solution for healthcare providers to manage multiple patients.',
    features: [
      { text: 'All Pro features for your patients', included: true },
      { text: 'Doctor Dashboard for Patient Management', included: true },
      { text: 'Secure Doctor-Patient Communication', included: true },
      { text: 'Bulk Patient Onboarding', included: true },
      { text: 'Patient Health Data Analytics', included: true },
      { text: 'Dedicated Support & Training', included: true },
    ],
    ctaText: 'Contact Sales',
    ctaLink: '/contact',
    isFeatured: false,
  },
];

const PricingPage: React.FC = () => {
  return (
    <MainLayout requireAuth={false}>
      <div className="bg-gradient-to-b from-white to-mamasaheli-light/30 dark:from-gray-900 dark:to-gray-800/30 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-12 md:mb-16 lg:mb-20">
            <h1 className="text-4xl font-extrabold text-mamasaheli-dark dark:text-mamasaheli-light sm:text-5xl tracking-tight">
              Choose Your Plan
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Simple, transparent pricing for every stage of your pregnancy journey. Get the support you need, when you need it.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`flex flex-col border-2 rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl dark:bg-gray-800/80
                  ${plan.isFeatured ? 'border-mamasaheli-primary dark:border-mamasaheli-accent scale-105 lg:scale-110 z-10' : 'border-gray-200 dark:border-gray-700'}
                  ${plan.isFeatured ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'}
                `}
              >
                {plan.isFeatured && (
                  <Badge
                    variant="default"
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full bg-mamasaheli-primary text-white text-sm font-semibold shadow-md"
                  >
                    <Star className="w-4 h-4 mr-1.5" /> Recommended
                  </Badge>
                )}
                <CardHeader className="p-6 text-center border-b dark:border-gray-700/50">
                  <CardTitle className="text-2xl font-bold text-mamasaheli-dark dark:text-white mb-2">
                    {plan.name}
                  </CardTitle>
                  <div className="mb-3">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                      {plan.priceMonthly}
                    </span>
                    <span className="text-base font-medium text-gray-500 dark:text-gray-400">
                      {plan.billingCycle}
                    </span>
                  </div>
                  <CardDescription className="text-gray-600 dark:text-gray-400 min-h-[40px]">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 flex-grow">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                    Features Included:
                  </h3>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        {feature.included ? (
                          <Check className="flex-shrink-0 h-5 w-5 text-green-500 mr-2.5 mt-0.5" />
                        ) : (
                          <X className="flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-500 mr-2.5 mt-0.5" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400 line-through'}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-6 mt-auto border-t dark:border-gray-700/50">
                  <Button
                    size="lg"
                    className={`w-full text-base py-3 
                      ${plan.isFeatured ? 'bg-mamasaheli-primary hover:bg-mamasaheli-dark text-white' : 'bg-white text-mamasaheli-primary border border-mamasaheli-primary/50 hover:bg-mamasaheli-light dark:bg-gray-700 dark:text-mamasaheli-light dark:border-gray-600 dark:hover:bg-gray-600'}
                    `}
                    asChild
                  >
                    <Link to={plan.ctaLink}>
                      {plan.ctaText} <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="mt-20 md:mt-28 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-mamasaheli-dark dark:text-white mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4 text-left text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800/50 p-6 md:p-8 rounded-lg shadow-md border dark:border-gray-700">
              <details className="group">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none group-hover:text-mamasaheli-primary dark:group-hover:text-mamasaheli-light">
                  <span>What payment methods do you accept?</span>
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <p className="text-gray-600 dark:text-gray-400 mt-3 group-open:animate-fadeIn">
                  We accept all major credit cards (Visa, Mastercard, American Express) and potentially other methods like PayPal depending on your region. All payments are processed securely.
                </p>
              </details>
              <details className="group">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none group-hover:text-mamasaheli-primary dark:group-hover:text-mamasaheli-light">
                  <span>Can I cancel my subscription anytime?</span>
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <p className="text-gray-600 dark:text-gray-400 mt-3 group-open:animate-fadeIn">
                  Yes, you can cancel your paid subscription at any time from your account settings. Your access will continue until the end of your current billing period (monthly or annually). We do not offer prorated refunds for cancellations.
                </p>
              </details>
              <details className="group">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none group-hover:text-mamasaheli-primary dark:group-hover:text-mamasaheli-light">
                  <span>Is my personal and health data secure?</span>
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <p className="text-gray-600 dark:text-gray-400 mt-3 group-open:animate-fadeIn">
                  Absolutely. We prioritize data security and privacy. Your data is encrypted, stored securely, and handled in compliance with privacy regulations like HIPAA (if applicable in your region). Please review our Privacy Policy for full details.
                </p>
              </details>
               <details className="group">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none group-hover:text-mamasaheli-primary dark:group-hover:text-mamasaheli-light">
                  <span>What if I need more support or have other questions?</span>
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <p className="text-gray-600 dark:text-gray-400 mt-3 group-open:animate-fadeIn">
                   We're here to help! You can reach out via our contact form, check the community forums, or use the support options included in your plan. Premium users receive priority assistance.
                </p>
              </details>
            </div>
          </div>
          <div className="mt-16 text-center">
             <p className="text-lg text-gray-700 dark:text-gray-300">Still have questions or need a custom solution?</p>
             <Button variant="outline" size="lg" className="mt-4 border-mamasaheli-primary text-mamasaheli-primary hover:bg-mamasaheli-light hover:text-mamasaheli-dark dark:border-mamasaheli-light dark:text-mamasaheli-light dark:hover:bg-gray-700 dark:hover:text-white" asChild>
                <Link to="/contact">
                   <HeartHandshake className="mr-2 h-5 w-5" /> Contact Us
                </Link>
             </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PricingPage;