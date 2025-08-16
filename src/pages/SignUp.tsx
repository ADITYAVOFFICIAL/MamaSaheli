import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { Heart, Loader2, Hospital, XCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HospitalOption {
  id: string;
  name: string;
  city: string;
  state: string;
}

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hospitals, setHospitals] = useState<HospitalOption[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
  const [selectedHospitalName, setSelectedHospitalName] = useState<string>('');
  const [hospitalSearchTerm, setHospitalSearchTerm] = useState('');
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(true);
  const [hospitalFetchError, setHospitalFetchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch('/hospitals.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: HospitalOption[] = await response.json();
        setHospitals(data);
      } catch (error) {
        setHospitalFetchError("Could not load hospital list. Please try again later.");
        toast({
          title: "Error Loading Hospitals",
          description: "Failed to load the list of hospitals. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingHospitals(false);
      }
    };

    fetchHospitals();
  }, [toast]);

  const filteredHospitals = useMemo(() => {
    if (hospitalSearchTerm.trim() === '') {
      return [];
    }
    const lowercasedQuery = hospitalSearchTerm.toLowerCase();
    return hospitals
      .filter(hospital =>
        hospital.name.toLowerCase().includes(lowercasedQuery) ||
        hospital.city.toLowerCase().includes(lowercasedQuery) ||
        hospital.state.toLowerCase().includes(lowercasedQuery)
      )
      .slice(0, 10);
  }, [hospitalSearchTerm, hospitals]);

  const handleHospitalSelect = (hospital: HospitalOption) => {
    setSelectedHospitalId(hospital.id);
    setSelectedHospitalName(hospital.name);
    setHospitalSearchTerm('');
  };

  const clearHospitalSelection = () => {
    setSelectedHospitalId('');
    setSelectedHospitalName('');
    setHospitalSearchTerm('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedHospitalId) {
      toast({
        title: "Hospital Selection Required",
        description: "Please search for and select your primary hospital.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await signup(email, password, name, selectedHospitalId, selectedHospitalName);
      toast({
        title: "Account created successfully",
        description: "Welcome to MamaSaheli!",
      });
      navigate('/profile');
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "An error occurred during signup.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] py-12">
        <div className="w-full max-w-md px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center">
              <Heart className="h-10 w-10 text-mamasaheli-accent" />
              <span className="ml-2 text-2xl font-bold text-mamasaheli-primary">MamaSaheli</span>
            </div>
          </div>

          <Card className="shadow-lg border-mamasaheli-primary/20">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Create Account</CardTitle>
              <CardDescription className="text-center">
                Join MamaSaheli for personalized pregnancy support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="hello@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="•••••••• (min. 8 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hospital-search" className="flex items-center">
                      <Hospital className="mr-2 h-4 w-4" /> Primary Hospital *
                    </Label>
                    {isLoadingHospitals ? (
                      <div className="flex items-center justify-center h-10 border rounded-md text-gray-500">
                        <Loader2 className="animate-spin mr-2" size={16} /> Loading Hospitals...
                      </div>
                    ) : hospitalFetchError ? (
                      <div className="text-red-500 text-sm">{hospitalFetchError}</div>
                    ) : selectedHospitalId ? (
                      <div className="flex items-center justify-between h-10 pl-3 pr-2 border rounded-md bg-gray-50">
                        <p className="text-sm font-medium text-gray-800 truncate">{selectedHospitalName}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-500 hover:text-red-600"
                          onClick={clearHospitalSelection}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="relative">
                        <Input
                          id="hospital-search"
                          placeholder="Search by hospital name or city..."
                          value={hospitalSearchTerm}
                          onChange={(e) => setHospitalSearchTerm(e.target.value)}
                          disabled={isLoading}
                          autoComplete="off"
                        />
                        {filteredHospitals.length > 0 && (
                          <Card className="absolute z-10 w-full mt-1 shadow-lg max-h-56 overflow-y-auto">
                            <ScrollArea className="max-h-56 overflow-y-auto">
                              <ul className="p-1">
                                {filteredHospitals.map((hospital) => (
                                  <li
                                    key={hospital.id}
                                    className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-md"
                                    onClick={() => handleHospitalSelect(hospital)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleHospitalSelect(hospital)}
                                    tabIndex={0}
                                  >
                                    <p className="font-medium">{hospital.name}</p>
                                    <p className="text-xs text-gray-500">{hospital.city}, {hospital.state}</p>
                                  </li>
                                ))}
                              </ul>
                            </ScrollArea>
                          </Card>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-mamasaheli-primary hover:bg-mamasaheli-dark"
                    disabled={isLoading || isLoadingHospitals || !!hospitalFetchError || !selectedHospitalId}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-mamasaheli-primary font-semibold hover:underline"
                >
                  Log in
                </Link>
              </div>
              <div className="text-center text-xs text-gray-500">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="underline">Privacy Policy</Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default SignUp;