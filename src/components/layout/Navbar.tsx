import React, { useState, useEffect, useMemo } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import {
  Menu,
  X,
  User,
  Heart,
  LogOut,
  LayoutDashboard,
  Settings,
  FileText,
  Gamepad2,
  ListCheck,
  Salad,
  MessageSquare,
  Calendar,
  Users,
  TestTube2,
  Package,
  HeartPulse,
  AlertTriangle,
  BookOpen,
  LogIn,
  UserPlus
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getUserProfile, getFilePreview, profileBucketId } from '@/lib/appwrite';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, easeInOut } from 'framer-motion';
import icon256 from '/icons/icon-256x256.png';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  requiresAuth: boolean;
  hideWhenAuth?: boolean;
  isDesktopOnly?: boolean;
  isMobileOnly?: boolean;
}

const navItems: NavItem[] = [
  { path: '/login', label: 'Log In', icon: LogIn, requiresAuth: false, hideWhenAuth: true, isMobileOnly: true },
  { path: '/signup', label: 'Sign Up', icon: UserPlus, requiresAuth: false, hideWhenAuth: true, isMobileOnly: true },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, requiresAuth: true },
  { path: '/chat', label: 'AI Chat', icon: MessageSquare, requiresAuth: true },
  { path: '/doctor-chat', label: 'Doctor Chat', icon: HeartPulse, requiresAuth: true },
  { path: '/appointment', label: 'Appointments', icon: Calendar, requiresAuth: true },
  { path: '/forum', label: 'Forum', icon: Users, requiresAuth: true },
  { path: '/bloodwork', label: 'Bloodwork', icon: TestTube2, requiresAuth: true },
  { path: '/products', label: 'Products', icon: Package, requiresAuth: true },
  { path: '/meals', label: 'Meals & Exe.', icon: Salad, requiresAuth: true, isMobileOnly: true },
  { path: '/profile', label: 'Profile', icon: Settings, requiresAuth: true, isMobileOnly: true },
  { path: '/medicaldocs', label: 'Documents', icon: FileText, requiresAuth: true, isMobileOnly: true },
  { path: '/schecker', label: 'Symptom Ckr.', icon: HeartPulse, requiresAuth: true, isMobileOnly: true },
  { path: '/games', label: 'Games', icon: Gamepad2, requiresAuth: true, isMobileOnly: true },
  { path: '/milestones', label: 'Milestones', icon: ListCheck, requiresAuth: true, isMobileOnly: true },
  { path: '/resources', label: 'Knowledge', icon: BookOpen, requiresAuth: true },
  { path: '/emergency', label: 'Emergency', icon: AlertTriangle, requiresAuth: false },
];

const doctorNavItems: NavItem[] = [
  { path: '/doctor', label: 'Dashboard', icon: LayoutDashboard, requiresAuth: true },
  { path: '/profile', label: 'Profile', icon: Settings, requiresAuth: true },
  { path: '/medicaldocs', label: 'Documents', icon: FileText, requiresAuth: true },
  { path: '/games', label: 'Games', icon: Gamepad2, requiresAuth: true },
  { path: '/emergency', label: 'Emergency', icon: AlertTriangle, requiresAuth: false },
  { path: '/resources', label: 'Knowledge', icon: BookOpen, requiresAuth: true },
  { path: '/forum', label: 'Forum', icon: Users, requiresAuth: true },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isDoctor = useMemo(() => Array.isArray(user?.labels) && user.labels.includes('doctor'), [user]);

  const activeDesktopNavItems = useMemo(() => {
    const items = isDoctor ? doctorNavItems : navItems;
    return items.filter(item =>
      !item.isMobileOnly &&
      (isAuthenticated ? item.requiresAuth || !item.hideWhenAuth : !item.requiresAuth)
    );
  }, [isAuthenticated, isDoctor]);

  const activeMobileNavItems = useMemo(() => {
    const items = isDoctor ? doctorNavItems : navItems;
    return items.filter(item =>
      !item.isDesktopOnly &&
      (isAuthenticated ? item.requiresAuth || !item.hideWhenAuth : !item.requiresAuth)
    );
  }, [isAuthenticated, isDoctor]);
useEffect(() => {
  if (isOpen) {
    document.body.classList.add('overflow-hidden');
  } else {
    document.body.classList.remove('overflow-hidden');
  }
  return () => {
    document.body.classList.remove('overflow-hidden');
  };
}, [isOpen]);
  useEffect(() => {
    let isMounted = true;
    const fetchProfilePhoto = async () => {
      if (!user?.$id || !profileBucketId) {
        setProfilePhotoUrl(null);
        return;
      }
      try {
        const profile = await getUserProfile(user.$id);
        if (isMounted && profile?.profilePhotoId) {
          const photoUrl = getFilePreview(profile.profilePhotoId, profileBucketId);
          setProfilePhotoUrl(photoUrl?.toString() ?? null);
        } else if (isMounted) {
          setProfilePhotoUrl(null);
        }
      } catch (error) {
        if (isMounted) setProfilePhotoUrl(null);
      }
    };

    if (isAuthenticated) {
      fetchProfilePhoto();
    } else {
      setProfilePhotoUrl(null);
    }

    return () => { isMounted = false };
  }, [user?.$id, isAuthenticated]);

  const handleLogout = async () => {
    try {
      await logout();
      setProfilePhotoUrl(null);
      setIsOpen(false);
      toast({
        title: "Logged out successfully",
        description: "See you again soon!",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Logout failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: easeInOut } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.2, ease: easeInOut } },
  };

  const mobileGridContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
  };

  const mobileGridItemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { stiffness: 300, damping: 25 } },
  };

  const getNavLinkClass = ({ isActive }: { isActive: boolean }): string =>
    cn(
      "rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
      isActive
        ? "bg-mamasaheli-light/70 text-mamasaheli-primary dark:bg-mamasaheli-primary/30 dark:text-white"
        : "text-gray-700 hover:bg-mamasaheli-light/50 hover:text-mamasaheli-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
    );

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/90">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex flex-shrink-0 items-center" aria-label="MamaSaheli Homepage">
              <img src={icon256} alt="MamaSaheli Logo" className="h-8 w-8" aria-hidden="true" />
              <span className="ml-2 text-xl font-bold text-mamasaheli-primary dark:text-mamasaheli-light">
                MamaSaheli
              </span>
            </Link>
          </div>

          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            {activeDesktopNavItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={getNavLinkClass}>
                {item.label}
              </NavLink>
            ))}

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative flex h-9 w-9 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label="User menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profilePhotoUrl ?? undefined} alt={user.name || 'User avatar'} />
                      <AvatarFallback className="bg-mamasaheli-primary text-white dark:bg-mamasaheli-accent dark:text-gray-900">
                        {user.name?.substring(0, 2).toUpperCase() || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(isDoctor ? '/doctor' : '/dashboard')}><LayoutDashboard className="mr-2 h-4 w-4" /><span>Dashboard</span></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}><Settings className="mr-2 h-4 w-4" /><span>Profile Settings</span></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/medicaldocs')}><FileText className="mr-2 h-4 w-4" /><span>Medical Documents</span></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/contact')}><MessageSquare className="mr-2 h-4 w-4" /><span>Contact</span></DropdownMenuItem>
                  {!isDoctor && <DropdownMenuItem onClick={() => navigate('/meals')}><Salad className="mr-2 h-4 w-4" /><span>Meals & Exercises</span></DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:bg-red-100 focus:text-red-700 dark:focus:bg-red-900/50 dark:focus:text-red-400">
                    <LogOut className="mr-2 h-4 w-4" /><span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => navigate('/login')} className="dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white">
                  Log In
                </Button>
                <Button onClick={() => navigate('/signup')}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center rounded-md bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-mamasaheli-primary dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
              aria-label={isOpen ? "Close main menu" : "Open main menu"}
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden overflow-hidden"
            id="mobile-menu"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="px-2 pt-2 pb-4 sm:px-3 space-y-4">
              <NavLink
                to='/emergency'
                className="flex items-center justify-center rounded-lg px-3 py-3 text-base font-semibold bg-red-600 text-red-100 hover:bg-red-700 shadow-lg"
                onClick={closeMenu}
              >
                <AlertTriangle className="mr-2 h-5 w-5" />
                Emergency
              </NavLink>

              <motion.div
                className="grid grid-cols-3 gap-2"
                variants={mobileGridContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {activeMobileNavItems
                  .filter(item => item.path !== '/emergency' && !item.hideWhenAuth)
                  .map((item) => (
                    <motion.div key={item.path} variants={mobileGridItemVariants}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) => cn(
                          "flex flex-col items-center justify-center text-center p-2 rounded-lg aspect-square transition-colors",
                          isActive
                            ? "bg-mamasaheli-light text-mamasaheli-primary dark:bg-mamasaheli-primary/30 dark:text-white"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        )}
                        onClick={closeMenu}
                      >
                        <item.icon className="h-6 w-6 mb-1" strokeWidth={1.5} />
                        <span className="text-xs font-medium truncate w-full">{item.label}</span>
                      </NavLink>
                    </motion.div>
                  ))}
              </motion.div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                {isAuthenticated ? (
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="flex w-full justify-center rounded-md px-3 py-2 text-base font-medium text-red-600 hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Log Out
                  </Button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button asChild variant="outline" className="w-full justify-center py-3">
                      <Link to="/login" onClick={closeMenu}>Log In</Link>
                    </Button>
                    <Button asChild className="w-full justify-center py-3">
                      <Link to="/signup" onClick={closeMenu}>Sign Up</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;