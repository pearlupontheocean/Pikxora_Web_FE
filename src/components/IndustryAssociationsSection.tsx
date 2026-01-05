import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, ExternalLink, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { industryAssociations, IndustryAssociation } from '@/data/industryAssociations';

// Professional scroll-triggered animation variants
const fadeUpVariants = {
  hidden: {
    opacity: 0,
    y: 50,
    filter: "blur(8px)",
    scale: 0.96
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1] as const,
      opacity: { duration: 0.7 },
      y: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
      filter: { duration: 0.6 },
      scale: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const }
    }
  },
};

const headerVariants = {
  hidden: {
    opacity: 0,
    y: 50,
    filter: "blur(10px)",
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      duration: 1,
      delay: 0.15,
      ease: [0.16, 1, 0.3, 1] as const,
    }
  },
};

const subtitleVariants = {
  hidden: {
    opacity: 0,
    y: 35,
    filter: "blur(6px)",
    scale: 0.97
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      duration: 0.85,
      delay: 0.3,
      ease: [0.16, 1, 0.3, 1] as const,
    }
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
    filter: "blur(4px)"
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1] as const,
    }
  },
};


const IndustryAssociationCard: React.FC<{ association: IndustryAssociation }> = ({ association }) => (
  <a
    href={association.website}
    target="_blank"
    rel="noopener noreferrer"
    className="block group h-full"
  >
    <Card className="relative overflow-hidden border border-primary/20 hover:border-primary/50 bg-card/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 h-full flex flex-col">
      {/* Red accent bar */}
      <div className="p-6 flex flex-col flex-grow min-h-0">
        {/* Logo section with white background - Fixed height */}
        <div className="relative w-28 h-28 mx-auto mb-6 rounded-full overflow-hidden border-2 border-primary/40 group-hover:border-primary/70 transition-colors ring-4 ring-primary/10">
          <img
            src={association.logo}
            alt={association.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.classList.remove('bg-white/95');
                parent.classList.add('bg-gray-900');
                parent.innerHTML = `<div class="text-3xl font-bold text-gray-600">${association.name}</div>`;
              }
            }}
          />
          <div className="absolute top-1 right-1">
            <div className="flex items-center gap-1 bg-primary/20 backdrop-blur-md px-2 py-1 rounded-full border border-primary/30">
              <Award className="h-3 w-3 text-primary" />
              <span className="text-xs font-semibold text-foreground">Elite</span>
            </div>
          </div>
        </div>

        {/* Content - Fixed height sections */}
        <div className="space-y-3 flex flex-col flex-grow min-h-0">
          <div className="flex-shrink-0 text-center">
            <h3 className="font-bold text-xl text-foreground mb-1">{association.name}</h3>
            <p className="text-primary text-sm italic font-medium line-clamp-1">{association.fullName}</p>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 h-16 flex-shrink-0 text-center">
            {association.description}
          </p>
          <div className="flex-grow min-h-0" />
          <div className="flex items-center justify-between pt-3 border-t border-gray-800 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Badge
                variant={association.type === "National" ? "default" : "secondary"}
                className={`text-xs flex-shrink-0 ${
                  association.type === "National"
                    ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
                    : "bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600"
                } border`}
              >
                {association.type}
              </Badge>
              <div className="flex items-center gap-1 text-gray-500 text-xs truncate">
                <Globe className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{association.country}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-red-600 group-hover:text-red-500 transition-colors text-xs font-medium flex-shrink-0 ml-2">
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Card>
  </a>
);

const IndustryAssociationsSection: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300; // Scroll by one card width + gap
      const newScrollLeft = direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });

      setTimeout(checkScrollButtons, 300);
    }
  };
  return (
    <div className="relative">
      <div className="relative group/scroll">
        {/* Left scroll button */}
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/90 hover:bg-red-600 border-2 border-gray-800 hover:border-red-600 rounded-full p-3 transition-all duration-300 shadow-lg ${
            canScrollLeft 
              ? 'opacity-0 group-hover/scroll:opacity-100 cursor-pointer' 
              : 'opacity-0 cursor-not-allowed'
          }`}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollButtons}
          className="flex space-x-4 overflow-x-auto pb-4 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {industryAssociations.map((association, index) => (
            <motion.div 
              key={association.id} 
              className="w-[280px] h-[380px] flex-shrink-0"
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <IndustryAssociationCard association={association} />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Right scroll button */}
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/90 hover:bg-red-600 border-2 border-gray-800 hover:border-red-600 rounded-full p-3 transition-all duration-300 shadow-lg ${
            canScrollRight 
              ? 'opacity-0 group-hover/scroll:opacity-100 cursor-pointer' 
              : 'opacity-0 cursor-not-allowed'
          }`}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};

export default IndustryAssociationsSection;