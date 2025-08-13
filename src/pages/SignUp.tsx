import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select components
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { Heart, Loader2, Hospital } from 'lucide-react'; // Import Hospital icon

// Define the interface for a hospital entry from hospitals.json
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
  // New state for hospital selection
  const [hospitals, setHospitals] = useState<HospitalOption[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
  const [selectedHospitalName, setSelectedHospitalName] = useState<string>('');
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(true);
  const [hospitalFetchError, setHospitalFetchError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Effect to fetch hospitals data on component mount
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch('/hospitals.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: HospitalOption[] = await response.json();
        setHospitals(data);
        // Automatically select the first hospital if available and not already selected
        if (data.length > 0 && !selectedHospitalId) {
          setSelectedHospitalId(data[0].id);
          setSelectedHospitalName(data[0].name);
        }
      } catch (error) {
        console.error("Failed to load hospitals data:", error);
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
  }, []); // Empty dependency array means this runs once on mount

  // Handler for hospital selection change
  const handleHospitalChange = (value: string) => {
    setSelectedHospitalId(value);
    const selected = hospitals.find(h => h.id === value);
    setSelectedHospitalName(selected ? selected.name : '');
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

    // Validate hospital selection
    if (!selectedHospitalId) {
      toast({
        title: "Hospital Selection Required",
        description: "Please select your primary hospital.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Pass hospitalId and hospitalName to the signup function
      await signup(email, password, name, selectedHospitalId, selectedHospitalName);
      toast({
        title: "Account created successfully",
        description: "Welcome to MamaSaheli!",
      });
      navigate('/profile'); // Redirect to profile page after signup
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
                      placeholder="••••••••"
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
                  {/* New Hospital Selection Field */}
                  <div className="space-y-2">
                    <Label htmlFor="hospital-select" className="flex items-center">
                      <Hospital className="mr-2 h-4 w-4" /> Primary Hospital *
                    </Label>
                    {isLoadingHospitals ? (
                      <div className="flex items-center justify-center h-10 border rounded-md text-gray-500">
                        <Loader2 className="animate-spin mr-2" size={16} /> Loading Hospitals...
                      </div>
                    ) : hospitalFetchError ? (
                      <div className="text-red-500 text-sm">{hospitalFetchError}</div>
                    ) : (
                      <Select value={selectedHospitalId} onValueChange={handleHospitalChange} required disabled={isLoading}>
                        <SelectTrigger id="hospital-select">
                          <SelectValue placeholder="Select your primary hospital" />
                        </SelectTrigger>
                        <SelectContent>
                          {hospitals.map((hospital) => (
                            <SelectItem key={hospital.id} value={hospital.id}>
                              {hospital.name} ({hospital.city}, {hospital.state})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-mamasaheli-primary hover:bg-mamasaheli-dark"
                    disabled={isLoading || isLoadingHospitals || hospitalFetchError !== null || !selectedHospitalId}
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