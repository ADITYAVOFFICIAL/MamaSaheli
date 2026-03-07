import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { analyzePregnancyRisk, RiskAnalysisResult } from "../lib/risk";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Activity, AlertTriangle, CheckCircle, Info, Loader2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import MainLayout from "../components/layout/MainLayout";

const RiskPage: React.FC = () => {
  // Changed userProfile to user (Standard in Appwrite/Zustand setups)
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [riskData, setRiskData] = useState<RiskAnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchRiskScore = async () => {
    if (!user) {
      toast({
        title: "Account not found",
        description: "Please log in to calculate risk.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Safely extracting user data. Adjust based on where you store custom attributes 
      // (e.g., directly on the user object, in Appwrite prefs, or a separate collection).
      const u = user as any; 
      
      const comprehensiveData = {
        age: u.prefs?.age || u.age || "Not provided",
        weight: u.prefs?.weight || u.weight || "Not provided",
        height: u.prefs?.height || u.height || "Not provided",
        bloodGroup: u.prefs?.bloodGroup || u.bloodGroup || "Not provided",
        dueDate: u.prefs?.dueDate || u.dueDate || "Not provided",
        medicalHistory: u.prefs?.medicalHistory || u.medicalHistory || "None reported",
        pregnancyWeek: u.prefs?.pregnancyWeek || u.pregnancyWeek || "Not provided",
      };

      const result = await analyzePregnancyRisk(comprehensiveData);
      setRiskData(result);
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: error.message || "An error occurred during risk calculation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !riskData && !loading) {
      fetchRiskScore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Low": return "text-green-500";
      case "Moderate": return "text-yellow-500";
      case "High": return "text-orange-500";
      case "Critical": return "text-red-500";
      default: return "text-blue-500";
    }
  };

  // Fixed: Returns a Tailwind class that targets the inner child div of Shadcn's Progress component
  const getLevelProgressClass = (level: string) => {
    switch (level) {
      case "Low": return "[&>div]:bg-green-500";
      case "Moderate": return "[&>div]:bg-yellow-500";
      case "High": return "[&>div]:bg-orange-500";
      case "Critical": return "[&>div]:bg-red-500";
      default: return "[&>div]:bg-blue-500";
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div>
          <h1 className="text-3xl font-bold tracking-tight">Pregnancy Risk Assessment</h1>
          <p className="text-muted-foreground mt-1">AI-powered analysis of your current health profile.</p>
        </div>
        <Button onClick={fetchRiskScore} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}
          {riskData ? "Recalculate" : "Calculate Risk"}
        </Button>
      </div>

      {!riskData && !loading && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No Data</AlertTitle>
          <AlertDescription>
            Click the calculate button to analyze your health profile and generate a risk score.
          </AlertDescription>
        </Alert>
      )}

      {loading && (
        <Card className="w-full flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Analyzing your health metrics with AI...</p>
        </Card>
      )}

      {riskData && !loading && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Score Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl">Overall Risk Score</CardTitle>
              <CardDescription>Based on your profile and logged vitals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-6">
                <div className="text-center">
                  <span className={`text-6xl font-extrabold ${getLevelColor(riskData.level)}`}>
                    {riskData.score}
                  </span>
                  <span className="text-2xl text-muted-foreground"> / 100</span>
                </div>
                
                <div className="w-full max-w-md">
                  {/* Fixed the invalid indicatorColor prop */}
                  <Progress 
                    value={riskData.score} 
                    className={`h-4 ${getLevelProgressClass(riskData.level)} bg-secondary`} 
                  />
                  <div className="flex justify-between mt-2 text-sm font-medium text-muted-foreground">
                    <span>0 (Low)</span>
                    <span className={getLevelColor(riskData.level)}>Status: {riskData.level}</span>
                    <span>100 (Critical)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reasons Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Risk Factors & Reasons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {riskData.reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recommendations Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {riskData.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground mt-8 text-center">
        Disclaimer: This AI-generated risk score is for informational purposes only and does not replace professional medical advice. Always consult your healthcare provider.
      </p>
      </div>
    </MainLayout>
  );
};

export default RiskPage;