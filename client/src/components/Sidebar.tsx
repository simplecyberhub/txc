import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  HomeIcon, 
  TrendingUpIcon, 
  RefreshCwIcon, 
  BriefcaseIcon, 
  CopyIcon,
  WalletIcon, 
  UserIcon, 
  LogOutIcon,
  UsersIcon,
  FileTextIcon,
  CheckCircleIcon,
  SettingsIcon,
  DollarSignIcon,
  MenuIcon,
  XIcon
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  admin?: boolean;
}

export default function Sidebar({ admin = false }: SidebarProps) {
  const [location] = useLocation();
  const { logout, isAdmin } = useAuth();
  const isMobile = useMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);
  
  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location, isMobile]);
  
  // Handle sidebar toggle
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  // Update isOpen when screen size changes
  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);
  
  // Determine if user is allowed to see admin links
  const showAdminLinks = admin && isAdmin;
  
  // Determine if user is viewing the admin section
  const isAdminSection = location.startsWith('/admin');
  
  // Navigation links
  const userLinks = [
    { name: "Dashboard", path: "/", icon: <HomeIcon className="h-5 w-5 mr-3" /> },
    { name: "Markets", path: "/markets", icon: <TrendingUpIcon className="h-5 w-5 mr-3" /> },
    { name: "Trade", path: "/trade", icon: <RefreshCwIcon className="h-5 w-5 mr-3" /> },
    { name: "Portfolio", path: "/portfolio", icon: <BriefcaseIcon className="h-5 w-5 mr-3" /> },
    { name: "Copy Trading", path: "/copy-trading", icon: <CopyIcon className="h-5 w-5 mr-3" /> },
    { name: "Wallet", path: "/wallet", icon: <WalletIcon className="h-5 w-5 mr-3" /> },
    { name: "Profile", path: "/profile", icon: <UserIcon className="h-5 w-5 mr-3" /> },
  ];
  
  const adminLinks = [
    { name: "Dashboard", path: "/admin", icon: <HomeIcon className="h-5 w-5 mr-3" /> },
    { name: "Users", path: "/admin/users", icon: <UsersIcon className="h-5 w-5 mr-3" /> },
    { name: "KYC Verification", path: "/admin/kyc", icon: <CheckCircleIcon className="h-5 w-5 mr-3" /> },
    { name: "Transactions", path: "/admin/transactions", icon: <DollarSignIcon className="h-5 w-5 mr-3" /> },
    { name: "Content", path: "/admin/content", icon: <FileTextIcon className="h-5 w-5 mr-3" /> },
    { name: "Settings", path: "/admin/settings", icon: <SettingsIcon className="h-5 w-5 mr-3" /> }
  ];
  
  // Determine which links to show
  const links = showAdminLinks ? adminLinks : userLinks;
  
  return (
    <>
      {/* Mobile menu button - visible only on small screens */}
      {isMobile && (
        <button 
          className="fixed top-4 right-4 z-50 p-2 rounded-md bg-primary text-white md:hidden"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <XIcon className="h-6 w-6" />
          ) : (
            <MenuIcon className="h-6 w-6" />
          )}
        </button>
      )}
      
      <aside 
        className={`bg-primary text-white w-full md:w-64 md:min-h-screen md:fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out ${
          isOpen ? "fixed inset-0" : "hidden md:block"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-blue-800">
          <Link href={isAdmin ? "/admin" : "/"} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-lg">TX</span>
            </div>
            <span className="text-xl font-semibold">TradeXCapital</span>
          </Link>
          
          {isMobile && (
            <button onClick={toggleSidebar} className="text-white md:hidden">
              <XIcon className="h-6 w-6" />
            </button>
          )}
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <p className="text-gray-400 text-xs uppercase mb-2">
              {showAdminLinks ? "Admin Menu" : "Main Menu"}
            </p>
            <nav>
              {links.map((link) => (
                <Link 
                  key={link.path} 
                  href={link.path}
                  className={`flex items-center px-4 py-2 text-white hover:bg-primary-light rounded-lg mb-1 ${
                    location === link.path 
                      ? "bg-primary-light" 
                      : ""
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
              
              {/* If user is admin, add a link to switch between user and admin interfaces */}
              {isAdmin && !isAdminSection && (
                <Link 
                  href="/admin"
                  className="flex items-center px-4 py-2 text-white hover:bg-primary-light rounded-lg mb-1"
                >
                  <SettingsIcon className="h-5 w-5 mr-3" />
                  Admin Panel
                </Link>
              )}
              
              {isAdmin && isAdminSection && (
                <Link 
                  href="/"
                  className="flex items-center px-4 py-2 text-white hover:bg-primary-light rounded-lg mb-1"
                >
                  <HomeIcon className="h-5 w-5 mr-3" />
                  User Dashboard
                </Link>
              )}
            </nav>
          </div>
          
          <div className="pt-4 border-t border-blue-800">
            <button
              onClick={() => logout()}
              className="flex items-center px-4 py-2 text-white hover:bg-primary-light rounded-lg w-full text-left"
            >
              <LogOutIcon className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </aside>
      
      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}
