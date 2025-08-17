import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Calendar,
  FilePlus,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Heart,
  Baby,
  CheckCircle,
  BellRing,
  ShieldCheck,
  Sparkles,
  Users,
  UserPlus,
  Activity,
  Package,
  Salad,
  Gamepad2,
  Loader2,
  AlertCircle,
  Tag,
  BadgeCheck,
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import Hero from '@/components/home/Hero';
import { useQuery } from '@tanstack/react-query';
import { getTotalUserCount } from '@/lib/appwrite';
import HomeCta from '@/components/home/HomeCta';

const HomePage = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Effect to redirect authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Fetch total user count using React Query
  const {
    data: userCountData,
    isLoading: isLoadingUserCount,
    isError: isErrorUserCount,
    error: userCountError,
  } = useQuery({
    queryKey: ['totalUserCount'],
    queryFn: getTotalUserCount,
    refetchInterval: 60000, // Refetch every 60 seconds
    staleTime: 30000,       // Data is considered fresh for 30 seconds
    retry: 1,               // Retry once on failure
  });

  // Helper function to render the user count with loading and error states
  const renderUserCount = () => {
    if (isLoadingUserCount) {
      return <Loader2 className="h-5 w-5 animate-spin text-mamasaheli-primary inline-block" aria-label="Loading user count"/>;
    }

    if (isErrorUserCount) {
      const errorMessage = userCountError instanceof Error ? userCountError.message : 'Could not load user count';
      return (
        <span className="font-medium flex items-center" title={errorMessage}>
          <AlertCircle className="h-5 w-5 text-red-500 inline-block mr-1" /> --
        </span>
      );
    }

    if (userCountData && typeof userCountData.totalUsers === 'number') {
      const formattedCount = new Intl.NumberFormat().format(userCountData.totalUsers);
      return (
        <span className="font-medium">
          <span className="font-bold">{formattedCount}</span> Active Users
        </span>
      );
    }

    // Fallback for unexpected data format
    return <span className="font-medium">-- Active Users</span>;
  };

  // If the user is authenticated, this component will render briefly before the useEffect redirects them.
  // Returning null or a loader prevents the homepage from flashing.
  if (isAuthenticated) {
    return (
        <MainLayout>
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-mamasaheli-primary" />
            </div>
        </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero Section */}
      <Hero />

      {/* Trusted By Section */}
      <section className="py-10 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Trusted by expectant mothers</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <ShieldCheck className="h-5 w-5 text-mamasaheli-primary" />
                <span className="font-medium">Secure & Private</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <CheckCircle className="h-5 w-5 text-mamasaheli-primary" />
                {renderUserCount()}
              </div>
              <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <Sparkles className="h-5 w-5 text-mamasaheli-primary" />
                <span className="font-medium">AI Powered Advice</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-mamasaheli-primary dark:text-mamasaheli-light">What We Offer</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              MamaSaheli provides a comprehensive suite of tools and resources to support you throughout your pregnancy journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {/* AI Chat */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-all hover:shadow-lg border-t-4 border-mamasaheli-primary dark:border-mamasaheli-accent">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-mamasaheli-primary dark:bg-mamasaheli-accent text-white mb-4">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI Chat Assistant</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                Get personalized answers to your pregnancy questions anytime, tailored to your specific needs.
              </p>
              <Link to="/chat" onClick={() => window.scrollTo(0, 0)} className="mt-4 inline-flex items-center text-sm font-medium text-mamasaheli-primary dark:text-mamasaheli-accent hover:text-mamasaheli-dark dark:hover:text-mamasaheli-light">
                Start chatting <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            {/* Appointment Scheduling */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-all hover:shadow-lg border-t-4 border-mamasaheli-secondary dark:border-blue-500">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-mamasaheli-secondary dark:bg-blue-500 text-white mb-4">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Appointment Scheduling</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                Easily book and manage appointments with healthcare providers for your prenatal care.
              </p>
              <Link to="/appointment" onClick={() => window.scrollTo(0, 0)} className="mt-4 inline-flex items-center text-sm font-medium text-mamasaheli-secondary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                Book appointment <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            {/* Medical Document Management */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-all hover:shadow-lg border-t-4 border-mamasaheli-accent dark:border-pink-500">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-mamasaheli-accent dark:bg-pink-500 text-white mb-4">
                <FilePlus className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Medical Document Management</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                Securely store and manage your medical records, scans, and test results in one place.
              </p>
              <Link to="/medicaldocs" onClick={() => window.scrollTo(0, 0)} className="mt-4 inline-flex items-center text-sm font-medium text-mamasaheli-accent dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300">
                Manage documents <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            {/* Emergency Info */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-all hover:shadow-lg border-t-4 border-red-500 dark:border-red-600">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 dark:bg-red-600 text-white mb-4">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Emergency Information</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                Quick access to emergency contacts, warning signs, and nearby hospitals when needed most.
              </p>
              <Link to="/emergency" onClick={() => window.scrollTo(0, 0)} className="mt-4 inline-flex items-center text-sm font-medium text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                View emergency info <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            {/* Resources & Blog */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-all hover:shadow-lg border-t-4 border-green-500 dark:border-green-600">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 dark:bg-green-600 text-white mb-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Resources & Blog</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                Access informative articles, tips, and resources about pregnancy, childbirth, and early motherhood.
              </p>
              <Link to="/resources" onClick={() => window.scrollTo(0, 0)} className="mt-4 inline-flex items-center text-sm font-medium text-green-500 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
                Explore resources <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            {/* Personalized Dashboard */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-all hover:shadow-lg border-t-4 border-purple-500 dark:border-purple-600">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 dark:bg-purple-600 text-white mb-4">
                <Baby className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Personalized Dashboard</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                Track your pregnancy journey with a personalized dashboard showing important milestones and reminders.
              </p>
              <Link to="/dashboard" onClick={() => window.scrollTo(0, 0)} className="mt-4 inline-flex items-center text-sm font-medium text-purple-500 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                View dashboard <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Community Forum */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-all hover:shadow-lg border-t-4 border-orange-500 dark:border-orange-600">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 dark:bg-orange-600 text-white mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Community Forum</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                Connect with other expectant mothers, share experiences, and find support in our community.
              </p>
              <Link to="/forum" onClick={() => window.scrollTo(0, 0)} className="mt-4 inline-flex items-center text-sm font-medium text-orange-500 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300">
                Join the discussion <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Product Suggestions */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-all hover:shadow-lg border-t-4 border-indigo-500 dark:border-indigo-600">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 dark:bg-indigo-600 text-white mb-4">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI Product Suggestions</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                Discover helpful products for pregnancy and baby care, recommended by AI based on your profile or needs.
              </p>
              <Link to="/products" onClick={() => window.scrollTo(0, 0)} className="mt-4 inline-flex items-center text-sm font-medium text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                Find products <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Meal & Exercise Ideas */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-all hover:shadow-lg border-t-4 border-teal-500 dark:border-teal-600">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-teal-500 dark:bg-teal-600 text-white mb-4">
                <Salad className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Meal & Exercise Ideas</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                Receive personalized meal plans and safe exercise suggestions tailored to your pregnancy stage and preferences.
              </p>
              <Link to="/meals" onClick={() => window.scrollTo(0, 0)} className="mt-4 inline-flex items-center text-sm font-medium text-teal-500 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300">
                Get ideas <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Blockchain Stacking Game */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-all hover:shadow-lg border-t-4 border-cyan-500 dark:border-cyan-600">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-cyan-500 dark:bg-cyan-600 text-white mb-4">
                <Gamepad2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Stacking Game (on Monad)</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                Play our fun stacking game, test your skills, and submit your high score to the Monad blockchain leaderboard.
              </p>
              <Link to="/games" onClick={() => window.scrollTo(0, 0)} className="mt-4 inline-flex items-center text-sm font-medium text-cyan-500 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300">
                Play the game <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            {/* Symptom Checker */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-all hover:shadow-lg border-t-4 border-yellow-500 dark:border-yellow-600">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-500 dark:bg-yellow-600 text-white mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Symptom Checker (Beta)</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                Get general information about common pregnancy symptoms. (Not a substitute for medical advice).
              </p>
              <Link to="/schecker" onClick={() => window.scrollTo(0, 0)} className="mt-4 inline-flex items-center text-sm font-medium text-yellow-500 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300">
                Check symptoms <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Monad Milestones */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-all hover:shadow-lg border-t-4 border-purple-500 dark:border-purple-600">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 dark:bg-purple-600 text-white mb-4">
                <BadgeCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Monad Milestones</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
              Celebrate your journey by minting NFT badges for key milestones on the Monad Testnet.
              </p>
              <Link to="/milestones" onClick={() => window.scrollTo(0, 0)} className="mt-4 inline-flex items-center text-sm font-medium text-purple-500 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                View milestones <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900/50 dark:via-gray-800/50 dark:to-gray-900/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-mamasaheli-primary tracking-tight">How MamaSaheli Works</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Follow these simple steps to begin your personalized pregnancy support journey.
            </p>
          </div>

          <div className="relative">
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {/* Step 1 Card */}
              <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 flex flex-col text-center h-full border-t-4 border-mamasaheli-primary">
                <div className="flex-shrink-0 mb-4">
                   <div className="flex items-center justify-center h-16 w-16 rounded-full bg-mamasaheli-light dark:bg-gray-700 text-mamasaheli-primary dark:text-mamasaheli-light mx-auto mb-4 border-2 border-mamasaheli-primary font-bold text-2xl">
                     1
                   </div>
                   <UserPlus className="mx-auto h-10 w-10 text-mamasaheli-primary" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Create Your Profile</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Sign up easily and provide some basic details about your pregnancy and health history to personalize your experience.
                  </p>
                </div>
              </div>

              {/* Step 2 Card */}
              <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 flex flex-col text-center h-full border-t-4 border-mamasaheli-secondary">
                 <div className="flex-shrink-0 mb-4">
                   <div className="flex items-center justify-center h-16 w-16 rounded-full bg-mamasaheli-light dark:bg-gray-700 text-mamasaheli-primary dark:text-mamasaheli-light mx-auto mb-4 border-2 border-mamasaheli-primary font-bold text-2xl">
                     2
                   </div>
                   <Sparkles className="mx-auto h-10 w-10 text-mamasaheli-secondary" />
                 </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Access Personalized Care</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Interact with our AI assistant, explore tailored resources, schedule appointments, and manage your health data securely.
                  </p>
                </div>
              </div>

              {/* Step 3 Card */}
              <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 flex flex-col text-center h-full border-t-4 border-mamasaheli-accent">
                 <div className="flex-shrink-0 mb-4">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-mamasaheli-light dark:bg-gray-700 text-mamasaheli-primary dark:text-mamasaheli-light mx-auto mb-4 border-2 border-mamasaheli-primary font-bold text-2xl">
                      3
                    </div>
                   <Activity className="mx-auto h-10 w-10 text-mamasaheli-accent" />
                 </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Stay Informed & Prepared</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Receive timely reminders, track milestones on your dashboard, and access helpful guides for every stage of your journey.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <HomeCta />
      
      {/* Features Highlights */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-mamasaheli-primary" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Expert-Guided AI</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Our AI is developed with healthcare professionals to ensure accurate advice.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <BellRing className="h-6 w-6 text-mamasaheli-primary" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Timely Reminders</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Get personalized reminders for appointments, tests, and important milestones.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <Heart className="h-6 w-6 text-mamasaheli-primary" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Compassionate Support</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Designed with empathy to support mothers through the emotional journey of pregnancy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
       {/* Pricing Section */}
       <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Tag className="mx-auto h-10 w-10 text-mamasaheli-secondary mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-mamasaheli-primary dark:text-mamasaheli-light tracking-tight mb-4">
            Find the Perfect Plan
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Whether you're just starting or need comprehensive support, we have a plan that fits your needs. Explore our flexible pricing options.
          </p>
          <Button size="lg" className="bg-mamasaheli-secondary hover:bg-mamasaheli-secondary/90 text-white text-lg px-8 py-3" asChild>
            <Link to="/pricing" onClick={() => window.scrollTo(0, 0)}>
              View Pricing Plans <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </MainLayout>
  );
};

export default HomePage;