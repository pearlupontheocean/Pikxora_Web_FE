import { Shield, Globe, Users } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-16 px-6 lg:px-8 bg-background border-t border-primary/20">
      <div className="container mx-auto max-w-7xl">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          <div className="space-y-4">
            <h3 className="text-3xl font-bold red-glow mb-6">PIKXORA</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The global community platform empowering VFX studios and artists worldwide. 
              Proudly crafted in India.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-lg mb-6 text-foreground">Stay Synced to the Future</h4>
            <div className="flex gap-6">
              <Shield className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer transition-all hover:scale-110" />
              <Globe className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer transition-all hover:scale-110" />
              <Users className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer transition-all hover:scale-110" />
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-lg mb-6 text-foreground">Legal</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</p>
              <p className="hover:text-primary cursor-pointer transition-colors">Terms of Service</p>
              <p className="hover:text-primary cursor-pointer transition-colors">Community Guidelines</p>
            </div>
          </div>
        </div>
        <div className="text-center text-sm text-muted-foreground pt-10 border-t border-primary/10">
          <p>© 2025 Pikxora. All rights reserved. Made with ❤️ in India for the World.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

