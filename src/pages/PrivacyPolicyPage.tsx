// src/pages/PrivacyPolicyPage.tsx
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
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
                <ShieldCheck className="mr-3 h-7 w-7 flex-shrink-0" />
                Privacy Policy
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                Last Updated: {lastUpdatedDate}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 text-gray-700 dark:text-gray-300 leading-relaxed space-y-6">
              <p className="text-base">
                MamaSaheli ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, and related services (collectively, the "Service"). Please read this policy carefully. By using the Service, you consent to the data practices described in this policy.
              </p>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-mamasaheli-dark dark:text-white border-b pb-2">1. Information We Collect</h2>
                <p className="text-sm">We collect information to provide and improve our Service. This includes:</p>
                <ul className="list-disc list-outside pl-6 space-y-2 text-sm">
                  <li>
                    <strong>Personal and Health Data:</strong> Information you provide during registration and use, such as your name, email, age, pregnancy details (e.g., weeks pregnant), and health information you choose to track (e.g., blood pressure, blood sugar, weight). This also includes any medical documents you upload and appointment details you schedule.
                  </li>
                  <li>
                    <strong>AI Interaction Data:</strong> Text and images you submit to our AI features, such as the AI Chat Assistant, Symptom Checker, and Document Transcription (OCR). This data is processed to provide you with the requested service.
                  </li>
                  <li>
                    <strong>Community Data:</strong> Content you create in the Community Forum, including topics, posts, and votes. Your chosen username will be visible to other users.
                  </li>
                  <li>
                    <strong>Location Data:</strong> With your explicit permission, we collect your device's location to power features like finding nearby hospitals on the Emergency page.
                  </li>
                   <li>
                    <strong>Blockchain Data:</strong> For features interacting with the Monad blockchain (like the Stacking Game leaderboard and NFT milestones), we will interact with your public wallet address. Transactions you approve will be publicly visible on the blockchain.
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Information automatically collected when you use the Service, such as your IP address, browser type, device information, pages visited, and features used, to help us understand usage patterns and improve the Service.
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-mamasaheli-dark dark:text-white border-b pb-2">2. How We Use Your Information</h2>
                <p className="text-sm">Your information is used to:</p>
                 <ul className="list-disc list-outside pl-6 space-y-2 text-sm">
                    <li>Provide, operate, and maintain the core functionalities of the Service.</li>
                    <li>Personalize your experience on the dashboard with relevant milestones and tips.</li>
                    <li>Process and manage your scheduled appointments and medication reminders.</li>
                    <li>Securely store and allow you to access your uploaded medical documents.</li>
                    <li>Power our AI-driven features by sending relevant, anonymized context to our AI provider.</li>
                    <li>Operate the real-time Community Forum.</li>
                    <li>Send you important notifications and updates about the Service, including push notifications if you grant permission.</li>
                    <li>Analyze usage to improve the Service's performance, features, and user interface.</li>
                 </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-mamasaheli-dark dark:text-white border-b pb-2">3. Data Sharing and Third-Party Services</h2>
                <p className="text-sm">We do not sell your personal information. To provide our Service, we partner with specialized third-party providers and may share necessary information with them:</p>
                 <ul className="list-disc list-outside pl-6 space-y-2 text-sm">
                    <li><strong>Appwrite:</strong> Our primary backend-as-a-service provider. Appwrite securely stores all your account information, health data, documents, and other application data.</li>
                    <li><strong>Google (Gemini API):</strong> Our AI provider. To power features like the AI Chat, Document Transcription (OCR), Symptom Checker, and personalized suggestions, we send relevant data (such as your anonymized profile context and your direct inputs) to the Gemini API for processing.</li>
                    <li><strong>Google (Maps Platform):</strong> Used for the Emergency page feature to find and display nearby hospitals based on your location.</li>
                    <li><strong>Firebase (Google):</strong> Used to deliver push notifications for appointments and medication reminders to your registered devices.</li>
                    <li><strong>InfinyOn Cloud (Fluvio):</strong> Our real-time streaming provider used to enable live updates in the Community Forum.</li>
                    <li><strong>Monad Blockchain:</strong> For blockchain-related features, your public wallet address and transaction data (like high scores) are, by nature, publicly recorded on the Monad Testnet.</li>
                    <li><strong>For Legal Reasons:</strong> We may disclose your information if required by law or in the good-faith belief that such action is necessary to comply with a legal obligation, protect and defend our rights or property, or protect the personal safety of users or the public.</li>
                 </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-mamasaheli-dark dark:text-white border-b pb-2">4. Data Security</h2>
                <p className="text-sm">
                  We are committed to protecting your data. We leverage the security features of our cloud provider, Appwrite, which includes role-based permissions to ensure that only you can access your sensitive data. All data is transmitted over encrypted connections (HTTPS). However, no method of transmission over the Internet or method of electronic storage is 100% secure.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-mamasaheli-dark dark:text-white border-b pb-2">5. Your Choices and Rights</h2>
                <p className="text-sm">
                  We believe in giving you control over your data. Within your user profile on the Service, you have the right to:
                </p>
                 <ul className="list-disc list-outside pl-6 space-y-2 text-sm">
                    <li>
                        <strong>Access and Update:</strong> You can access and update your personal profile information at any time.
                    </li>
                    <li>
                        <strong>Data Export:</strong> You can request an export of all your data stored on our platform in both JSON and PDF formats directly from your profile settings.
                    </li>
                    <li>
                        <strong>Account Deletion:</strong> You have the right to permanently delete your account and all associated data. This action is irreversible and can be initiated from your profile settings.
                    </li>
                 </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-mamasaheli-dark dark:text-white border-b pb-2">6. Changes to This Privacy Policy</h2>
                <p className="text-sm">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-mamasaheli-dark dark:text-white border-b pb-2">7. Contact Us</h2>
                <p className="text-sm">
                  If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:av4923@srmist.edu.in" className="text-mamasaheli-primary hover:underline">av4923@srmist.edu.in</a>.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default PrivacyPolicyPage;