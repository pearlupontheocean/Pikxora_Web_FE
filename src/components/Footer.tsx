import { Shield, Globe, Users, Mail, Linkedin, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-16 px-4 lg:px-8 bg-background border-t border-primary/20">
      <div className="max-w-7xl pl-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-4 text-left">
            <h3 className="text-3xl font-bold red-glow mb-6">PIKXORA</h3>
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
              <p className="hover:text-primary cursor-pointer transition-colors">Find Studios</p>
              <p className="hover:text-primary cursor-pointer transition-colors">Browse Artists</p>
              <p className="hover:text-primary cursor-pointer transition-colors">Job Board</p>
              <p className="hover:text-primary cursor-pointer transition-colors">Showcase Projects</p>
              <p className="hover:text-primary cursor-pointer transition-colors">Pricing</p>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4 text-left">
            <h4 className="font-semibold text-lg mb-6 text-foreground">Resources</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="hover:text-primary cursor-pointer transition-colors">Help Center</p>
              <p className="hover:text-primary cursor-pointer transition-colors">API Documentation</p>
              <p className="hover:text-primary cursor-pointer transition-colors">Community Forum</p>
              <p className="hover:text-primary cursor-pointer transition-colors">Blog & News</p>
              <p className="hover:text-primary cursor-pointer transition-colors">Contact Support</p>
            </div>
          </div>

          {/* Legal & Social */}
          <div className="space-y-4 text-left">
            <h4 className="font-semibold text-lg mb-6 text-foreground">Connect With Us</h4>
            <div className="flex gap-4 mb-6">
              <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-all hover:scale-110" />
              <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-all hover:scale-110" />
              <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-all hover:scale-110" />
              <Mail className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-all hover:scale-110" />
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</p>
              <p className="hover:text-primary cursor-pointer transition-colors">Terms of Service</p>
              <p className="hover:text-primary cursor-pointer transition-colors">Community Guidelines</p>
              <p className="hover:text-primary cursor-pointer transition-colors">Cookie Preferences</p>
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