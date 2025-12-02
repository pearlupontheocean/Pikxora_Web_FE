import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowRight, 
  Globe, 
  Sparkles, 
  Users, 
  Zap, 
  TrendingUp, 
  Rocket,
  Heart,
  Target,
  Calendar,
  Newspaper,
  Brain,
  Award
} from "lucide-react";
import heroGlobe from "@/assets/HeroSection/RRR.jpg";
import studioFuture from "@/assets/HeroSection/Salaar.jpg";
import aiNeural from "@/assets/HeroSection/bahubali.jpg";
import aiNeural2 from "@/assets/ai-neural.jpg";

import artistCyber from "@/assets/HeroSection/dune.jpg";
import eventFuture from "@/assets/HeroSection/interstellar.jpg";

type HeroMedia =
  | {
      type: "image";
      src: string;
      alt: string;
    }
  | {
      type: "video";
      src: string;
      alt: string;
      poster?: string;
      loop?: boolean;
      muted?: boolean;
    };

const heroMedia: HeroMedia[] = [
  {
    type: "image",
    src: heroGlobe,
    alt: "RRR inspired cinematic still",
  },
  {
    type: "image",
    src: studioFuture,
    alt: "Salaar cinematic frame",
  },
  {
    type: "image",
    src: aiNeural,
    alt: "Bahubali battle sequence",
  },
  {
    type: "image",
    src: artistCyber,
    alt: "Dune inspired vista",
  },
  {
    type: "image",
    src: eventFuture,
    alt: "Interstellar inspired cosmos",
  },
];

const heroTaglines = [
  "Cinematic universes, crafted frame by frame.",
  "Indian studios, writing the next chapter of global VFX.",
  "AI-powered pipelines that keep your imagination in motion.",
  "Artists, reels, and stories that travel beyond borders.",
  "Collaborations and festivals that light up the VFX sky.",
];

const wordContainerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.25, // slower stagger between words
    },
  },
};

const wordItemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9, // slower fade for each word
    },
  },
};

type StatConfig = {
  value: number;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  suffix?: string;
};

const AnimatedStatValue: React.FC<{ value: number; suffix?: string }> = ({ value, suffix }) => {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.floor(latest).toLocaleString());

  useEffect(() => {
    if (!isInView) {
      motionValue.set(0);
      return;
    }

    const controls = animate(motionValue, value, {
      duration: 1.8,
    });

    return () => {
      controls.stop();
    };
  }, [isInView, value, motionValue]);

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
};
//     title: "Pikxora",
//     tagline: "Where Indian Pixels Power Global Dreams",
//     primaryLabel: "",
//     primaryTo: "/auth",
//     secondaryLabel: "",
//     secondaryTo: "/auth",
//   },
//   {
//     title: "Studios. Stories. Supernova Energy.",
//     tagline: "Showcase your reels, pipelines, and production firepower to the world.",
//     primaryLabel: "Create Studio Profile",
//     primaryTo: "/auth",
//     secondaryLabel: "Browse Elite Studios",
//     secondaryTo: "/browse",
//   },
//   {
//     title: "AI-Enhanced Creativity",
//     tagline: "Blend neural magic with human imagination for next‑gen visuals.",
//     primaryLabel: "Explore AI Workflows",
//     primaryTo: "/browse",
//     secondaryLabel: "Join as Creator",
//     secondaryTo: "/auth",
//   },
//   {
//     title: "Artists at the Epicenter",
//     tagline: "Build a portfolio that travels farther than any film release.",
//     primaryLabel: "Claim Your Artist Profile",
//     primaryTo: "/auth",
//     secondaryLabel: "Discover Rising Talent",
//     secondaryTo: "/browse",
//   },
//   {
//     title: "Events. Collabs. Cosmic Launchpads.",
//     tagline: "From festivals to hackathons—step into the room where it happens.",
//     primaryLabel: "See Opportunities",
//     primaryTo: "/browse",
//     secondaryLabel: "Get Started on Pikxora",
//     secondaryTo: "/auth",
//   },
// ];

const Index = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroMedia.length);
    }, 6000); // 6s per image

    return () => clearInterval(interval);
  }, []);

  // (Text animation now handled by Framer Motion, keyed on currentIndex)


  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Cinematic Background with Overlay Text */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Fullscreen media background */}
        <div className="absolute inset-0 z-0">
          {heroMedia.map((media, index) => (
            <motion.div
              key={index}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{
                opacity: index === currentIndex ? 1 : 0,
                scale: index === currentIndex ? 1 : 1.02,
              }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
            >
              {media.type === "video" ? (
                <video
                  className="h-full w-full object-cover"
                  src={media.src}
                  poster={media.poster}
                  autoPlay
                  loop={media.loop ?? true}
                  muted={media.muted ?? true}
                  playsInline
                />
              ) : (
                <img
                  src={media.src}
                  alt={media.alt}
                  className="h-full w-full object-cover"
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Floating Nav */}
        <div className="absolute inset-x-0 top-0 z-20">
          <div className="container mx-auto max-w-7xl px-4 lg:px-8 py-6 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl border border-primary/40 bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                PX
              </div>
              <div className="text-left">
                <p className="text-lg font-semibold tracking-widest text-foreground">PIKXORA</p>
                <p className="text-xs text-muted-foreground uppercase tracking-[0.4em]">Studio Nexus</p>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/auth">
                <Button className="px-7 py-3 rounded-full group shadow-lg hover:shadow-xl transition-all text-sm font-semibold">
                  <Rocket className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                  Launch Studio
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button
                  variant="outline"
                  className="px-6 py-3 rounded-full border-primary/40 hover:bg-primary/10 hover:border-primary/60 transition-all text-sm font-semibold"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Artist Mode
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Centered overlay text with faded background */}
        <div className="relative z-10 container px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl left-0"
          >
            <div className="bg-none md:bg-none rounded-3xl md:rounded-[2.5rem] px-5 py-6 md:px-8 md:py-8">
              <motion.h1
                className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 text-center md:text-left"
                key={currentIndex}
                variants={wordContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {"Where Indian Pixels Power Global Dreams".split(" ").map((word, index) => (
                  <motion.span
                    key={`${word}-${index}`}
                    className="inline-block mr-2"
                    variants={wordItemVariants}
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.h1>

              <motion.p
                key={`tagline-${currentIndex}`}
                className="mt-3 text-sm md:text-base lg:text-lg text-muted-foreground leading-relaxed text-center md:text-left min-h-[2.5rem]"
                variants={wordContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {heroTaglines[currentIndex % heroTaglines.length].split(" ").map((word, index) => (
                  <motion.span
                    key={`tag-${word}-${index}`}
                    className="inline-block mr-2"
                    variants={wordItemVariants}
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.p>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:block"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center backdrop-blur-sm">
            <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse" />
          </div>
        </motion.div>
      </section>

      {/* Empowerment Spotlight Section */}
      <section className="pt-28 px-6 lg:px-8 bg-gradient-to-b from-background via-card to-background">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold red-glow mb-8 leading-tight">
              The Neural Hub for VFX Growth
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Pikxora isn't just a platform—it's a living ecosystem where studios showcase cutting-edge reels, 
              artists build portfolios with AI-enhanced tools, and the community drives welfare through mentorship, 
              fair-pay advocacy, and skill-upgrading grants.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
            {[
              {
                icon: TrendingUp,
                title: "Growth",
                description: "Scale your studio with global gigs and AI matchmaking that connects you to opportunities worldwide."
              },
              {
                icon: Rocket,
                title: "Empowerment",
                description: "Artists, claim your spotlight—build profiles that evolve with your career and showcase your unique vision."
              },
              {
                icon: Zap,
                title: "Enhancement",
                description: "Indian-born tools for seamless collaboration across time zones, powered by cutting-edge technology."
              },
              {
                icon: Heart,
                title: "Welfare",
                description: "Championing diversity, mental health resources, and equitable opportunities for all creators."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Card className="p-8 h-full border border-primary/20 hover:border-primary/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2">
                  <feature.icon className="h-14 w-14 text-primary mb-6 drop-shadow-[0_0_15px_hsl(var(--primary)/0.5)] group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-xl font-bold mb-4 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* <div className="text-center pt-8">
            <Link to="/browse">
              <Button size="lg" variant="outline" className="border-primary/40 hover:bg-primary/10 hover:border-primary/60 px-8 py-6 text-base rounded-lg transition-all">
                <Target className="mr-2 h-5 w-5" />
                Discover Your Power
              </Button>
            </Link>
          </div> */}
        </div>
      </section>

      {/* Showcase Studios & Talent */}
      <section className="pt-0 pb-2 px-6 lg:px-8 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold red-glow mb-6 leading-tight">
              Global Studios • Infinite Talent
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Connecting visionaries across continents
            </p>
          </motion.div>

          {/* Studio Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {[
              {
                name: "PixelForge India",
                tagline: "Masters of Quantum Realms",
                location: "Mumbai, India",
                specialty: "Photorealistic CGI & Simulations",
                image: studioFuture
              },
              {
                name: "NovaEffects LA",
                tagline: "Holo-Warriors of Tomorrow",
                location: "Los Angeles, USA",
                specialty: "Character Animation & Motion Capture",
                image: heroGlobe
              },
              {
                name: "Celestial Studios",
                tagline: "Architects of Digital Dreams",
                location: "London, UK",
                specialty: "Virtual Production & Real-time VFX",
                image: eventFuture
              }
            ].map((studio, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Card className="overflow-hidden border border-primary/30 hover:border-primary/60 cursor-pointer transition-all duration-300 hover:-translate-y-2 h-full">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={studio.image}
                      alt={studio.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-1.5 bg-primary/20 backdrop-blur-md px-4 py-2 rounded-full border border-primary/30">
                        <Award className="h-4 w-4 text-primary" />
                        <span className="text-xs font-semibold text-foreground">Elite</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 space-y-4">
                    <h3 className="text-2xl font-bold red-glow">{studio.name}</h3>
                    <p className="text-sm text-primary italic font-medium">{studio.tagline}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      {studio.location}
                    </p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{studio.specialty}</p>
                    <Link to="/browse">
                      <Button className="w-full mt-4 group/btn">
                        Connect Now
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Artist Spotlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Rising Stars</h3>
            <p className="text-muted-foreground text-base">Meet the next generation of VFX pioneers</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-12">
            {[
              {
                name: "Aisha Rao",
                role: "AI VFX Pioneer",
                location: "Mumbai, India",
                specialty: "Revolutionizing Particle Simulations",
                image: artistCyber
              },
              {
                name: "Marcus Chen",
                role: "Character Technical Director",
                location: "Singapore",
                specialty: "Photorealistic Facial Rigs"
              },
              {
                name: "Sofia Martinez",
                role: "Compositing Artist",
                location: "Barcelona, Spain",
                specialty: "Cinematic Color Grading"
              }
            ].map((artist, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Card className="p-8 border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 h-full bg-card/50 backdrop-blur-sm">
                  {/* {artist.image && (
                    <div className="relative w-28 h-28 mx-auto mb-6 rounded-full overflow-hidden border-2 border-primary/40 group-hover:border-primary/70 transition-colors ring-4 ring-primary/10">
                      <img src={artist.image} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  )} */}
                  <div className="text-center space-y-3">
                    <h4 className="font-bold text-xl text-foreground">{artist.name}</h4>
                    <p className="text-primary text-sm font-medium">{artist.role}</p>
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <Globe className="h-3 w-3" />
                      {artist.location}
                    </p>
                    <p className="text-sm italic text-foreground/70 leading-relaxed pt-2">{artist.specialty}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 px-6 lg:px-8 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold red-glow mb-8 leading-tight">
              Upcoming Events • Hype Timeline
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Network with visionaries, demo bleeding-edge tech, and co-create the industry's tomorrow
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                name: "VFX Summit 2026: Bangalore",
                tagline: "Where AI Meets Mandala Magic",
                dates: "March 15-17, 2026",
                type: "In-Person Conference"
              },
              {
                name: "Global Animation Convergence",
                tagline: "Crossing Dimensions",
                dates: "Nov 10-12, 2025",
                type: "Virtual Event"
              },
              {
                name: "Pikxora AI Hackathon",
                tagline: "Forge the Next VFX Frontier",
                dates: "February 2026",
                type: "India Edition"
              }
            ].map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Card className="p-8 border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 h-full bg-card/50 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="text-xs text-primary font-semibold uppercase tracking-wider">{event.type}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-foreground leading-tight">{event.name}</h3>
                  <p className="text-sm text-primary italic mb-4 font-medium">{event.tagline}</p>
                  <p className="text-sm text-muted-foreground mb-6">{event.dates}</p>
                  <Button variant="outline" size="sm" className="w-full border-primary/40 hover:bg-primary/10 hover:border-primary/60 transition-all">
                    <Rocket className="mr-2 h-4 w-4" />
                    Secure Your Spot
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Industry News */}
      <section className="py-16 px-6 lg:px-8 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold red-glow mb-8 leading-tight">
              Latest Industry Pulse
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Stay ahead of the VFX revolution
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 mb-12">
            {[
              {
                headline: "Adobe's New AI Upscaler Shatters Render Times",
                teaser: "How Pikxora Members Are Leading the Charge",
                category: "Technology"
              },
              {
                headline: "Indian Studio Wins Oscar Nod for VFX",
                teaser: "Spotlight on Hyderabad's Hidden Gems",
                category: "Awards"
              },
              {
                headline: "Global Talent Shortage? Not Anymore.",
                teaser: "Pikxora's Empowerment Initiative Bridges the Gap with Free Upskilling",
                category: "Education"
              },
              {
                headline: "Welfare Win: New Union Pushes for AI-Ethics",
                teaser: "Join the Conversation on Responsible Innovation",
                category: "Community"
              }
            ].map((news, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Card className="p-8 border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 h-full cursor-pointer bg-card/50 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Newspaper className="h-5 w-5 text-primary" />
                    <span className="text-xs text-primary font-semibold uppercase tracking-wider">{news.category}</span>
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-foreground group-hover:text-primary/90 transition-colors leading-tight">{news.headline}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{news.teaser}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center pt-4">
            <Button variant="outline" size="lg" className="border-primary/40 hover:bg-primary/10 hover:border-primary/60 px-8 py-6 text-base rounded-lg transition-all">
              <Newspaper className="mr-2 h-5 w-5" />
              Dive Deeper into News Hub
            </Button>
          </div>
        </div>
      </section>

      {/* AI Revolution Section */}
      <section className="py-16 px-6 lg:px-8 bg-gradient-to-b from-card to-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <img src={aiNeural2} alt="AI Neural Network" className="w-full h-full object-cover" />
        </div>
        
        <div className="container mx-auto relative z-10 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold red-glow-intense mb-8 leading-tight">
              AI: The Cosmic Catalyst Reshaping VFX
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Harness It with Pikxora
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <p className="text-base md:text-lg leading-relaxed text-foreground/90">
                From generative neural networks birthing impossible worlds to predictive tools empowering solo artists, 
                AI isn't replacing creators—<span className="text-primary font-semibold">it's amplifying Indian innovation on the global stage</span>.
              </p>
              <p className="text-base md:text-lg leading-relaxed text-foreground/90">
                At Pikxora, explore ethical AI integrations, case studies from Mumbai to Hollywood, and welfare safeguards 
                against job displacement. Our platform champions responsible AI adoption that enhances human creativity rather than replacing it.
              </p>
              <div className="space-y-4 pt-4">
                {[
                  "Real-Time Deepfakes & Virtual Humans (2025)",
                  "AI-Assisted Scene Composition (2026)",
                  "Sentient Simulation Environments (2030)"
                ].map((item, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-start gap-4 p-4 rounded-lg bg-card/30 border border-primary/10"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Brain className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm md:text-base text-foreground/80 leading-relaxed">{item}</span>
                  </motion.div>
                ))}
              </div>
              <Button size="lg" className="mt-8 px-8 py-6 text-base rounded-lg">
                <Sparkles className="mr-2 h-5 w-5" />
                Explore AI Tools
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative lg:mt-0 mt-8"
            >
              <div className="relative rounded-xl overflow-hidden border-2 border-primary/30 shadow-2xl">
                <img
                  src={aiNeural2}
                  alt="AI Neural Network Visualization"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 lg:px-8 bg-background border-y border-primary/10">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              { value: 500, suffix: "+", label: "Global Creators", icon: Users },
              { value: 10, suffix: "+", label: "Countries", icon: Globe },
              { value: 50, suffix: "+", label: "Elite Studios", icon: Award },
              { value: 1000, suffix: "+", label: "Projects Shared", icon: Sparkles }
            ].map((stat: StatConfig, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <stat.icon className="h-12 w-12 text-primary mx-auto mb-6 drop-shadow-[0_0_15px_hsl(var(--primary)/0.5)] group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-4xl md:text-5xl font-bold red-glow mb-3">
                  <AnimatedStatValue value={stat.value} suffix={stat.suffix} />
                </h3>
                <p className="text-muted-foreground text-sm md:text-base">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-6 lg:px-8 bg-gradient-to-b from-card via-background to-background relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={eventFuture} alt="Future Event" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/70" />
        </div>

        <div className="container mx-auto text-center relative z-10 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold red-glow-intense mb-8 leading-tight">
              In Pikxora, Every Pixel Pulses with Purpose
            </h2>
            <p className="text-xl md:text-2xl lg:text-3xl font-light mb-10 leading-relaxed">
              <span className="text-primary font-semibold">Crafted in India</span> • <span className="text-foreground">Conquering the Cosmos</span>
            </p>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-16 leading-relaxed">
              Join the revolution where creativity meets technology, tradition embraces innovation, 
              and every artist finds their voice in the global VFX symphony.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/auth">
                <Button size="lg" className="text-base md:text-lg px-10 py-7 rounded-lg group shadow-xl hover:shadow-2xl transition-all">
                  <Rocket className="mr-2 h-6 w-6 group-hover:animate-pulse" />
                  Launch Your Journey
                  <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/browse">
                <Button size="lg" variant="outline" className="text-base md:text-lg px-10 py-7 rounded-lg border-primary/40 hover:bg-primary/10 hover:border-primary/60 transition-all">
                  <Globe className="mr-2 h-6 w-6" />
                  Explore the Universe
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Index;