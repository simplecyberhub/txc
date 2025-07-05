import { useState } from "react";
import { Bell, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";

interface HeaderProps {
  title?: string;
  admin?: boolean;
}

export default function Header({ title = "Dashboard", admin = false }: HeaderProps) {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
  };
  
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    } else if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return "U";
  };
  
  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.username) {
      return user.username;
    }
    return "User";
  };
  
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {admin ? `Admin ${title}` : title}
          </h1>
          
          <div className="flex items-center space-x-4 ml-4">
            <div className="relative">
              <button 
                className="p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
                aria-label="Notifications"
              >
                <Bell className="h-6 w-6" />
              </button>
            </div>
            
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button 
                  type="button" 
                  className="flex items-center text-sm rounded-full focus:outline-none"
                  aria-label="User menu"
                >
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                    {getUserInitials()}
                  </div>
                  <span className="ml-2 text-gray-700 hidden md:block">{getDisplayName()}</span>
                  <ChevronDown className="h-4 w-4 ml-1 text-gray-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-medium text-gray-900">
                  {getDisplayName()}
                </div>
                <div className="px-2 py-1 text-xs text-gray-500 truncate">
                  {user?.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/wallet" className="cursor-pointer">
                    Wallet
                  </Link>
                </DropdownMenuItem>
                {user?.isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href={admin ? "/" : "/admin"} className="cursor-pointer">
                      {admin ? "User Dashboard" : "Admin Dashboard"}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
