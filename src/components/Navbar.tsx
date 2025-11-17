import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { LogOut, User, LayoutGrid, LogIn, UserPlus } from "lucide-react";
import { useSignOut } from "@/lib/api-hooks";
import { toast } from "sonner";

interface NavbarProps {
  user?: any;
  profile?: any;
}

const Navbar = ({ user, profile }: NavbarProps) => {
  const navigate = useNavigate();
  const signOutMutation = useSignOut();

  const handleSignOut = async () => {
    try {
      await signOutMutation.mutateAsync();
      toast.success("Signed out successfully");
      navigate("/auth");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <motion.h1
            className="text-2xl font-bold red-glow-intense"
            whileHover={{ scale: 1.05 }}
          >
            PIKXORA
          </motion.h1>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/browse">
                <Button variant="ghost" size="sm">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Browse
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/browse">
                <Button variant="ghost" size="sm">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Browse
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="sm" className="hover:bg-primary/10">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
