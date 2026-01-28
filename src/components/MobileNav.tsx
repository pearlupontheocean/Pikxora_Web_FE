import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, LayoutGrid, User, LogOut, LogIn, UserPlus } from "lucide-react";
import { useSignOut } from "@/lib/api-hooks";
import { toast } from "sonner";
import logo from "@/assets/LogoWhite.png";
import { CurrentUser } from "@/types/jobs";

interface MobileNavProps {
  user?: CurrentUser["user"];
  profile?: CurrentUser["profile"];
}

export const MobileNav = ({ user, profile }: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const signOutMutation = useSignOut();

  const handleSignOut = async () => {
    try {
      await signOutMutation.mutateAsync();
      toast.success("Signed out successfully");
      navigate("/auth");
      setIsOpen(false); // Close menu on sign out
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  const NavLink = ({ to, icon: Icon, label, onClick }: { to?: string; icon: React.ElementType; label: string; onClick?: () => void }) => (
    <Button
      variant="ghost"
      className="w-full justify-start text-lg font-semibold h-auto py-3 px-4"
      onClick={() => {
        if (onClick) onClick();
        if (to) navigate(to);
        setIsOpen(false);
      }}
    >
      <Icon className="h-5 w-5 mr-3" />
      {label}
    </Button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col">
        <SheetHeader className="pb-6">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Link to="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <img src={logo} alt="PIKXORA Logo" className="h-10 w-auto" />
          </Link>
        </SheetHeader>
        <nav className="flex flex-col gap-2 flex-grow">
          {user ? (
            <>
              <NavLink to="/browse" icon={LayoutGrid} label="Browse" />
              <NavLink to="/dashboard" icon={User} label="Dashboard" />
              <NavLink icon={LogOut} label="Sign Out" onClick={handleSignOut} />
            </>
          ) : (
            <>
              <NavLink to="/browse" icon={LayoutGrid} label="Browse" />
              <NavLink to="/auth" icon={LogIn} label="Sign In" />
              <NavLink to="/auth" icon={UserPlus} label="Sign Up" />
            </>
          )}
        </nav>
        <div className="mt-auto pt-6 border-t border-gray-800 text-sm text-muted-foreground">
          <p>© 2025 Pikxora. All rights reserved.</p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

