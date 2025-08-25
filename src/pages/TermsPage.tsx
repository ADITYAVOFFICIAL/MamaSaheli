// src/pages/TermsPage.tsx
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const TermsPage: React.FC = () => {
  const lastUpdatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <MainLayout>
      <div className="bg-gray-50 dark:bg-gray-900 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            <CardHeader className="bg-gradient-to-r from-mamasaheli-light to-white dark:from-gray-800 dark:to-gray-700/50 p-6 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="flex items-center text-2xl md:text-3xl font-bold text-mamasaheli-primary dark:text-mamasaheli-light">
                <FileText className="mr-3 h-7 w-7 flex-shrink-0" />
                Terms of Service
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                Last Updated: {lastUpdatedDate}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 text-gray-700 dark:text-gray-300 leading-relaxed space-y-6">
              <p className="text-base">
                Welcome to MamaSaheli! These Terms of Service ("Terms") govern your access to and use of the MamaSaheli website, mobile application, and related services (collectively, the "Service"). Please read these Terms carefully. By accessing or using the Service, you agree to be bound by these Terms and our Privacy Policy.
              </p>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-mamasaheli-dark dark:text-white border-b pb-2">1. Description of Service</h2>
                <p className="text-sm">
                  MamaSaheli provides an AI-powered platform offering a suite of tools for informational and organizational purposes related to pregnancy and maternal health. Features include, but are not limited to: an AI Chat Assistant for general questions and document transcription (OCR), a personalized dashboard, health tracking (blood pressure, blood sugar, weight), appointment scheduling, a secure medical document vault, a real-time community forum, AI-powered suggestions for meals, exercises, and products, a Symptom Checker for general information, and blockchain-based engagement features such as a game leaderboard and NFT milestone badges on the Monad Testnet.
                </p>
                <p className="text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/30 p-3 rounded border border-red-200 dark:border-red-700">
                  <strong>CRITICAL DISCLAIMER: Not Medical Advice.</strong> The Service, including all AI-generated content, is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. It is not a substitute for professional medical advice from a qualified healthcare provider. Always seek the advice of your physician with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of information obtained through the Service. In case of a medical emergency, call your local emergency number immediately.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-mamasaheli-dark dark:text-white border-b pb-2">2. User Accounts and Conduct</h2>
                <p className="text-sm">
                  You must register for an account to access most features. You agree to provide accurate information and are responsible for all activities under your account. You are expressly forbidden from sharing harmful, illegal, or misleading content, spam, or personally identifiable information of others in public areas like the Community Forum. We reserve the right to suspend or terminate accounts that violate these terms.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-mamasaheli-dark dark:text-white border-b pb-2">3. Third-Party Services</h2>
                <p className="text-sm">
                  The Service integrates several third-party services to function. By using our Service, you acknowledge and agree that your data may be processed by these providers as described in our Privacy Policy. These include:
                </p>
                <ul className="list-disc list-outside pl-6 space-y-1 text-sm">
                    <li><strong>Appwrite:</strong> For backend services including authentication, database, and file storage.</li>
                    <li><strong>Google (Gemini API):</strong> For processing requests for all AI-powered features.</li>
                    <li><strong>Google (Maps Platform):</strong> To provide the nearby hospitals feature.</li>
                    <li><strong>Firebase (Google):</strong> To send push notifications.</li>
                    <li><strong>InfinyOn Cloud (Fluvio):</strong> To enable real-time features in our Community Forum.</li>
                    <li><strong>Monad Blockchain:</strong> A public, decentralized ledger used for our game leaderboard and NFT features. Your interactions are public and irreversible.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-mamasaheli-dark dark:text-white border-b pb-2">4. User-Generated Content</h2>
                <p className="text-sm">
                  You retain ownership of the content you create or upload to the Service (e.g., forum posts, documents). However, by posting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display that content in connection with providing the Service. You are solely responsible for the content you post and must ensure you have the rights to do so.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-mamasaheli-dark dark:text-white border-b pb-2">5. Disclaimers and Limitation of Liability</h2>
                <p className="text-sm">
                  The Service is provided "AS IS" and "AS AVAILABLE" without any warranties. We do not guarantee the accuracy, reliability, or completeness of any content, including AI-generated information, which may contain errors or "hallucinations." Your use of the Service is at your own risk. We are not liable for any damages arising from your use of the Service, your interactions with third-party services, or any actions you take on the blockchain.
                </p>
              </section>

               <section className="space-y-3">
                <h2 className="text-xl font-semibold text-mamasaheli-dark dark:text-white border-b pb-2">6. Termination</h2>
                <p className="text-sm">
                  We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-mamasaheli-dark dark:text-white border-b pb-2">7. Changes to Terms</h2>
                <p className="text-sm">
                  We reserve the right to modify these Terms at any time. We will notify you of any material changes by updating the "Last Updated" date. By continuing to use the Service after revisions become effective, you agree to be bound by the revised terms.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-mamasaheli-dark dark:text-white border-b pb-2">8. Contact Information</h2>
                <p className="text-sm">
                  If you have any questions about these Terms, please contact us at: <a href="mailto:av4923@srmist.edu.in" className="text-mamasaheli-primary hover:underline">av4923@srmist.edu.in</a>.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default TermsPage;