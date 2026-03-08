import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, CreditCard, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const LoggedOutNav = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
        <Link to="/" className="font-heading text-xl text-gray-900" data-testid="logo">
          PosterSmith AI
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => scrollToSection('how-it-works')}
            className="text-gray-600 hover:text-gray-900 transition-colors duration-300 font-body text-sm"
            data-testid="how-it-works-link"
          >
            How it works
          </button>
          <button 
            onClick={() => scrollToSection('pricing')}
            className="text-gray-600 hover:text-gray-900 transition-colors duration-300 font-body text-sm"
            data-testid="pricing-link"
          >
            Pricing
          </button>
          <button 
            onClick={() => scrollToSection('about')}
            className="text-gray-600 hover:text-gray-900 transition-colors duration-300 font-body text-sm"
            data-testid="about-link"
          >
            About
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <Link 
            to="/login" 
            className="text-gray-600 hover:text-gray-900 transition-colors duration-300 font-body text-sm"
            data-testid="login-link"
          >
            Log in
          </Link>
          <Link 
            to="/register" 
            className="bg-violet-500 text-white px-5 py-2.5 rounded-full font-body text-sm hover:bg-violet-600 transition-colors duration-300"
            data-testid="start-trial-btn"
          >
            Start free trial
          </Link>
        </div>
      </div>
    </header>
  );
};

export const LoggedInNav = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
        <Link to="/workspace" className="font-heading text-xl text-gray-900" data-testid="logo">
          PosterSmith AI
        </Link>
        
        <nav className="flex items-center gap-8">
          <Link 
            to="/workspace" 
            className={`font-body text-sm transition-colors duration-300 ${
              isActive('/workspace') 
                ? 'text-gray-900 font-medium' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
            data-testid="generate-posters-link"
          >
            Generate posters
          </Link>
          <Link 
            to="/listings" 
            className={`font-body text-sm transition-colors duration-300 ${
              isActive('/listings') 
                ? 'text-gray-900 font-medium' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
            data-testid="manage-listings-link"
          >
            Manage listings
          </Link>
          <Link 
            to="/library" 
            className={`font-body text-sm transition-colors duration-300 ${
              isActive('/library') 
                ? 'text-gray-900 font-medium' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
            data-testid="my-library-link"
          >
            My library
          </Link>
          {user?.role === "admin" && (
            <Link 
              to="/admin" 
              className={`font-body text-sm transition-colors duration-300 ${
                isActive('/admin') 
                  ? 'text-gray-900 font-medium' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              data-testid="admin-link"
            >
              Admin
            </Link>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="w-10 h-10 bg-violet-500 text-white rounded-full flex items-center justify-center font-body text-sm hover:bg-violet-600 transition-colors"
                data-testid="user-menu-btn"
              >
                {user?.name?.charAt(0).toUpperCase()}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-3">
                <p className="font-body text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="font-body text-xs text-gray-500">{user?.email}</p>
                {user?.role === "admin" && (
                  <span className="inline-block mt-1 text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/account" className="flex items-center cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/account/billing" className="flex items-center cursor-pointer">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/account/settings" className="flex items-center cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-500 cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
};

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-heading text-gray-900">PosterSmith AI</span>
            <span className="text-gray-400 text-sm font-body">© 2026</span>
          </div>
          
          <nav className="flex items-center gap-6">
            <Link 
              to="/help" 
              className="text-gray-500 hover:text-gray-900 transition-colors duration-300 font-body text-sm"
              data-testid="footer-help-link"
            >
              Help / FAQ
            </Link>
            <Link 
              to="/terms" 
              className="text-gray-500 hover:text-gray-900 transition-colors duration-300 font-body text-sm"
              data-testid="footer-terms-link"
            >
              Terms
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-500 hover:text-gray-900 transition-colors duration-300 font-body text-sm"
              data-testid="footer-contact-link"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};
