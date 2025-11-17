import { motion } from "framer-motion";
import { Award, ExternalLink } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface StudioIdentityProps {
  logoUrl?: string;
  tagline?: string;
  brandColors?: { primary: string; secondary: string };
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    website?: string;
  };
  awards?: string[];
}

const StudioIdentity = ({
  logoUrl,
  tagline,
  brandColors,
  socialLinks,
  awards
}: StudioIdentityProps) => {
  return (
    <div className="space-y-8">
      {/* Logo and Tagline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        {logoUrl && (
          <div className="flex justify-center">
            <img
              src={logoUrl}
              alt="Studio Logo"
              className="h-32 w-auto object-contain"
            />
          </div>
        )}
        {tagline && (
          <p className="text-xl md:text-2xl text-muted-foreground italic">
            "{tagline}"
          </p>
        )}
      </motion.div>

      {/* Brand Colors */}
      {brandColors && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <h3 className="text-lg font-semibold">Brand Identity</h3>
          <div className="flex gap-4">
            <div className="space-y-2">
              <div
                className="w-24 h-24 rounded-lg border-2 border-border"
                style={{ backgroundColor: brandColors.primary }}
              />
              <p className="text-sm text-muted-foreground text-center">
                Primary
              </p>
            </div>
            <div className="space-y-2">
              <div
                className="w-24 h-24 rounded-lg border-2 border-border"
                style={{ backgroundColor: brandColors.secondary }}
              />
              <p className="text-sm text-muted-foreground text-center">
                Secondary
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Social Links */}
      {socialLinks && Object.keys(socialLinks).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h3 className="text-lg font-semibold">Connect With Us</h3>
          <div className="flex flex-wrap gap-2">
            {socialLinks.twitter && (
              <Button variant="outline" size="sm" asChild>
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                  Twitter <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            )}
            {socialLinks.linkedin && (
              <Button variant="outline" size="sm" asChild>
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            )}
            {socialLinks.instagram && (
              <Button variant="outline" size="sm" asChild>
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                  Instagram <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            )}
            {socialLinks.website && (
              <Button variant="outline" size="sm" asChild>
                <a href={socialLinks.website} target="_blank" rel="noopener noreferrer">
                  Website <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {/* Awards */}
      {awards && awards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Awards & Recognition
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {awards.map((award, index) => (
              <Card key={index} className="p-4">
                <p className="text-sm">{award}</p>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StudioIdentity;
