import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, ValidationError } from '@formspree/react';
import { motion, Variants } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Mail, User, AtSign, BookOpen, MessageSquare, Send, Loader2, Phone,
  MapPin, Building, Briefcase, Globe, CheckCircle, Home, ClipboardList, UserCheck
} from 'lucide-react';

const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const contactSubjects = [
  'General Inquiry', 'Technical Support', 'Feedback & Suggestions',
  'Appointment Question', 'Billing Issue', 'Partnership Inquiry', 'Other'
];

const userRoles = [
  'User / Expectant Mother', 'Doctor / Healthcare Provider',
  'Nurse / Medical Staff', 'Other'
];

const countryOptions = ['India', 'Other'];

const ContactPage: React.FC = () => {
  const [state, handleSubmit] = useForm("xblalrkp");
  const [roleValue, setRoleValue] = useState('');
  const [subjectValue, setSubjectValue] = useState('');
  const [countrySelect, setCountrySelect] = useState('India');
  const [otherCountry, setOtherCountry] = useState('');

  if (state.succeeded) {
    return (
      <MainLayout requireAuth={false}>
        <motion.div
          className="flex items-center justify-center min-h-[calc(100vh-12rem)] py-12 px-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Card className="w-full max-w-md text-center shadow-lg border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20">
            <CardHeader>
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <CardTitle className="text-2xl font-bold text-green-800 dark:text-green-300">Thank You!</CardTitle>
              <CardDescription className="text-green-700 dark:text-green-400">
                Your message has been sent successfully. We'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full bg-mamasaheli-primary hover:bg-mamasaheli-dark">
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Return to Homepage
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </MainLayout>
    );
  }

  return (
    <MainLayout requireAuth={false}>
      <motion.div
        className="bg-gradient-to-b from-white via-mamasaheli-light/20 to-white dark:from-gray-900 dark:via-gray-800/20 dark:to-gray-900 min-h-screen"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <motion.div variants={itemVariants} className="text-center mb-12 md:mb-16">
  <Mail className="mx-auto h-12 w-12 text-mamasaheli-primary dark:text-mamasaheli-accent mb-4" />
  <h1 className="text-3xl sm:text-4xl font-extrabold text-mamasaheli-dark dark:text-mamasaheli-light tracking-tight">
    Get In Touch
  </h1>
  <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
    Have questions, feedback, or need support? We'd love to hear from you.
  </p>
</motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-5 gap-10 md:gap-12 items-start">
            <div className="lg:col-span-3">
              <Card className="shadow-xl border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-800">
                <CardHeader className="bg-gradient-to-r from-mamasaheli-light/50 to-white dark:from-gray-700/50 dark:to-gray-800 p-6 md:p-8 border-b dark:border-gray-700/50">
                  <CardTitle className="flex items-center text-xl md:text-2xl font-bold text-mamasaheli-primary dark:text-mamasaheli-light">
                    <MessageSquare className="mr-3 h-6 w-6" />
                    Send us a Message
                  </CardTitle>
                  <CardDescription className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-2">
                    We typically respond within <span className="font-semibold text-mamasaheli-primary dark:text-mamasaheli-accent">24-48 business hours</span>.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <input type="hidden" name="website" value="MamaSaheli" />
                      <div className="space-y-2">
                        <Label htmlFor="name" className="font-medium flex items-center"><User className="mr-2 h-4 w-4 text-gray-400" /> Full Name *</Label>
                        <Input id="name" type="text" name="name" placeholder="Sakshi Sharma" required disabled={state.submitting} className="h-11" />
                        <ValidationError prefix="Name" field="name" errors={state.errors} className="text-red-500 text-xs mt-1" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="font-medium flex items-center"><AtSign className="mr-2 h-4 w-4 text-gray-400" /> Email Address *</Label>
                        <Input id="email" type="email" name="email" placeholder="sakshi@example.com" required disabled={state.submitting} className="h-11" />
                        <ValidationError prefix="Email" field="email" errors={state.errors} className="text-red-500 text-xs mt-1" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <Label htmlFor="phone" className="font-medium flex items-center"><Phone className="mr-2 h-4 w-4 text-gray-400" /> Phone Number</Label>
                          <Input id="phone" type="tel" name="phone" placeholder="(Optional)" disabled={state.submitting} className="h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country" className="font-medium flex items-center"><Globe className="mr-2 h-4 w-4 text-gray-400" /> Country *</Label>
                        <Select value={countrySelect} onValueChange={setCountrySelect} required disabled={state.submitting}>
                          <SelectTrigger id="country" className="h-11"><SelectValue placeholder="Select your country" /></SelectTrigger>
                          <SelectContent>{countryOptions.map((option) => (<SelectItem key={option} value={option}>{option}</SelectItem>))}</SelectContent>
                        </Select>
                        {countrySelect === 'Other' && (
                          <Input id="otherCountry" type="text" name="country" placeholder="Type your country" value={otherCountry} onChange={e => setOtherCountry(e.target.value)} required disabled={state.submitting} className="mt-2 h-11" />
                        )}
                        {countrySelect === 'India' && (<input type="hidden" name="country" value="India" />)}
                        <ValidationError prefix="Country" field="country" errors={state.errors} className="text-red-500 text-xs mt-1" />
                      </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role" className="font-medium flex items-center"><Briefcase className="mr-2 h-4 w-4 text-gray-400" /> Your Role *</Label>
                        <Select value={roleValue} onValueChange={setRoleValue} required disabled={state.submitting}>
                          <SelectTrigger id="role" className="h-11"><SelectValue placeholder="Select your role" /></SelectTrigger>
                          <SelectContent>{userRoles.map((role) => (<SelectItem key={role} value={role}>{role}</SelectItem>))}</SelectContent>
                        </Select>
                        <input type="hidden" name="role" value={roleValue} />
                        <ValidationError prefix="Role" field="role" errors={state.errors} className="text-red-500 text-xs mt-1" />
                    </div>
                    <div className="space-y-2">
                       <Label htmlFor="subject" className="font-medium flex items-center"><BookOpen className="mr-2 h-4 w-4 text-gray-400" /> Subject *</Label>
                       <Select value={subjectValue} onValueChange={setSubjectValue} required disabled={state.submitting}>
                         <SelectTrigger id="subject" className="h-11"><SelectValue placeholder="Select a reason for contacting us" /></SelectTrigger>
                         <SelectContent>{contactSubjects.map((sub) => (<SelectItem key={sub} value={sub}>{sub}</SelectItem>))}</SelectContent>
                       </Select>
                       <input type="hidden" name="subject" value={subjectValue} />
                       <ValidationError prefix="Subject" field="subject" errors={state.errors} className="text-red-500 text-xs mt-1" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message" className="font-medium flex items-center"><MessageSquare className="mr-2 h-4 w-4 text-gray-400" /> Your Message *</Label>
                      <Textarea id="message" name="message" placeholder="Please describe your inquiry in detail..." required className="min-h-[150px]" disabled={state.submitting} />
                      <ValidationError prefix="Message" field="message" errors={state.errors} className="text-red-500 text-xs mt-1" />
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 md:p-8 border-t dark:border-gray-700/50">
                    <Button type="submit" size="lg" className="w-full py-3 text-base" disabled={state.submitting}>
                      {state.submitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>) : (<><Send className="mr-2 h-4 w-4" /> Send Message</>)}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
            <div className="lg:col-span-2 space-y-8">
              <Card className="shadow-lg border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 h-full">
                <CardHeader className="p-6 border-b dark:border-gray-700/50">
                  <CardTitle className="flex items-center text-xl font-semibold text-mamasaheli-primary dark:text-mamasaheli-light">
                    <Building className="mr-2.5 h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1"><AtSign className="h-5 w-5 text-mamasaheli-secondary dark:text-blue-400" /></div>
                    <div>
                      <h4 className="font-medium">Email Us</h4>
                      <a href="mailto:support@mamasaheli.ai" className="text-sm text-mamasaheli-primary hover:underline dark:text-mamasaheli-accent break-all">support@mamasaheli.ai</a>
                    </div>
                  </div>
                   <div className="flex items-start space-x-4">
                     <div className="mt-1"><Phone className="h-5 w-5 text-mamasaheli-secondary dark:text-blue-400" /></div>
                     <div>
                       <h4 className="font-medium">Call Us</h4>
                       <a href="tel:SAMPLE" className="text-sm text-mamasaheli-primary hover:underline dark:text-mamasaheli-accent">SAMPLE NUMBER</a>
                       <p className="text-xs text-muted-foreground mt-0.5">Mon-Fri, 9 AM - 5 PM (IST)</p>
                     </div>
                   </div>
                   <div className="flex items-start space-x-4">
                     <div className="mt-1"><MapPin className="h-5 w-5 text-mamasaheli-secondary dark:text-blue-400" /></div>
                     <div>
                       <h4 className="font-medium">Our Office</h4>
                       <p className="text-sm text-muted-foreground">INDIA</p>
                     </div>
                   </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-16 md:mt-20 pt-12 border-t dark:border-gray-700/50">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-mamasaheli-dark dark:text-white">Help Us Improve</h2>
              <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                Your feedback is invaluable. Please take a moment to complete a survey relevant to your role.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="text-center bg-white dark:bg-gray-800 border-mamasaheli-secondary/50 dark:border-blue-500/50 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <UserCheck className="mx-auto h-10 w-10 text-mamasaheli-secondary dark:text-blue-400 mb-2" />
                  <CardTitle className="text-xl font-semibold text-mamasaheli-secondary dark:text-blue-400">For Healthcare Providers</CardTitle>
                  <CardDescription>A survey for doctors, nurses, and staff handling pregnancies.</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild size="lg" className="w-full bg-mamasaheli-secondary hover:bg-mamasaheli-secondary/90 text-white">
                    <a href="https://forms.gle/wUMLU1STdHraScCs5" target="_blank" rel="noopener noreferrer">
                      <ClipboardList className="mr-2 h-5 w-5" /> Take Doctor Survey
                    </a>
                  </Button>
                </CardFooter>
              </Card>
              <Card className="text-center bg-white dark:bg-gray-800 border-mamasaheli-accent/50 dark:border-pink-500/50 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <User className="mx-auto h-10 w-10 text-mamasaheli-accent dark:text-pink-400 mb-2" />
                  <CardTitle className="text-xl font-semibold text-mamasaheli-accent dark:text-pink-400">For Platform Users</CardTitle>
                  <CardDescription>A survey for expectant mothers and users of the MamaSaheli platform.</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild size="lg" className="w-full bg-mamasaheli-accent hover:bg-mamasaheli-accent/90 text-white">
                    <a href="https://forms.gle/QjHh48qFEQvWFKeo7" target="_blank" rel="noopener noreferrer">
                      <ClipboardList className="mr-2 h-5 w-5" /> Take User Survey
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default ContactPage;