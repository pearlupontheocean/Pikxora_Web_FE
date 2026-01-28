import { Shield, Globe, Users, Mail, Linkedin, Twitter, Instagram } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Footer = () => {
  const navigate = useNavigate();

  const handlePricingClick = () => {
    // Scroll to pricing section if on homepage, otherwise navigate to homepage
    if (window.location.pathname === "/") {
      const pricingSection = document.getElementById("pricing");
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: "smooth" });
      } else {
        toast.info("Pricing information coming soon!");
      }
    } else {
      navigate("/");
      setTimeout(() => {
        const pricingSection = document.getElementById("pricing");
        if (pricingSection) {
          pricingSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  const handleComingSoon = (name: string) => {
    toast.info(`${name} coming soon!`);
  };

  return (
    <footer className="py-16 px-4 lg:px-8 bg-background border-t border-primary/20">
      <div className="max-w-7xl pl-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-4 text-left">
            <Link to="/" className="block">
              <h3 className="text-3xl font-bold red-glow mb-6 hover:opacity-80 transition-opacity">PIKXORA</h3>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The leading global community platform empowering VFX studios and artists worldwide. 
              Connecting talent with opportunities and driving innovation in visual effects.
            </p>
            <div className="pt-4">
              <p className="text-xs text-muted-foreground/80">
                🇮🇳 Proudly crafted in India for the world
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 text-left">
            <h4 className="font-semibold text-lg mb-6 text-foreground">Platform</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <Link to="/browse" className="block hover:text-primary cursor-pointer transition-colors">Find Studios</Link>
              <Link to="/browse" className="block hover:text-primary cursor-pointer transition-colors">Browse Artists</Link>
              <Link to="/jobs" className="block hover:text-primary cursor-pointer transition-colors">Job Board</Link>
              <Link to="/browse" className="block hover:text-primary cursor-pointer transition-colors">Showcase Projects</Link>
              <button onClick={handlePricingClick} className="block hover:text-primary cursor-pointer transition-colors text-left w-full">Pricing</button>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4 text-left">
            <h4 className="font-semibold text-lg mb-6 text-foreground">Resources</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <button onClick={() => handleComingSoon("Help Center")} className="block hover:text-primary cursor-pointer transition-colors text-left w-full">Help Center</button>
              <button onClick={() => handleComingSoon("API Documentation")} className="block hover:text-primary cursor-pointer transition-colors text-left w-full">API Documentation</button>
              <button onClick={() => handleComingSoon("Community Forum")} className="block hover:text-primary cursor-pointer transition-colors text-left w-full">Community Forum</button>
              <button onClick={() => handleComingSoon("Blog & News")} className="block hover:text-primary cursor-pointer transition-colors text-left w-full">Blog & News</button>
              <a href="mailto:support@pikxora.com" className="block hover:text-primary cursor-pointer transition-colors">Contact Support</a>
            </div>
          </div>

          {/* Legal & Social */}
          <div className="space-y-4 text-left">
            <h4 className="font-semibold text-lg mb-6 text-foreground">Connect With Us</h4>
            <div className="flex gap-4 mb-6">
              <a href="https://linkedin.com/company/pikxora" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-all hover:scale-110" />
              </a>
              <a href="https://twitter.com/pikxora" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-all hover:scale-110" />
              </a>
              <a href="https://instagram.com/pikxora" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-all hover:scale-110" />
              </a>
              <a href="mailto:contact@pikxora.com" aria-label="Email">
                <Mail className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-all hover:scale-110" />
              </a>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <button onClick={() => handleComingSoon("Privacy Policy")} className="block hover:text-primary cursor-pointer transition-colors text-left w-full">Privacy Policy</button>
              <button onClick={() => handleComingSoon("Terms of Service")} className="block hover:text-primary cursor-pointer transition-colors text-left w-full">Terms of Service</button>
              <button onClick={() => handleComingSoon("Community Guidelines")} className="block hover:text-primary cursor-pointer transition-colors text-left w-full">Community Guidelines</button>
              <button onClick={() => handleComingSoon("Cookie Preferences")} className="block hover:text-primary cursor-pointer transition-colors text-left w-full">Cookie Preferences</button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground pt-8 border-t border-primary/10">
          <p className="text-center md:text-left">© 2025 Pikxora. All rights reserved.</p>
          <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6 items-center">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="text-xs">Secure Platform</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="text-xs">Global Community</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-xs">10K+ Members</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;