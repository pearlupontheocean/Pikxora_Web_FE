import React, { useRef, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { industryAssociations } from '@/data/industryAssociations';

interface IndustryAssociation {
  id: string;
  name: string;
  fullName: string;
  type: "National" | "International";
  country: string;
  logo: string;
  website: string;
  description: string;
}

const IndustryAssociationCard: React.FC<{ association: IndustryAssociation }> = ({ association }) => (
  <a
    href={association.website}
    target="_blank"
    rel="noopener noreferrer"
    className="block group h-full"
  >
    <Card className="relative overflow-hidden border-2 border-gray-800 bg-black group-hover:border-red-600 transition-all duration-300 h-full flex flex-col">
      {/* Red accent bar */}
      <div className="h-1 bg-red-600 w-full flex-shrink-0" />
      
      <div className="p-6 flex flex-col flex-grow min-h-0">
        {/* Logo section with white background - Fixed height */}
        <div className="relative mb-4 h-32 flex-shrink-0 flex items-center justify-center bg-white/95 rounded-lg border border-gray-800 group-hover:border-red-600/30 transition-all duration-300 overflow-hidden">
          <img
            src={association.logo}
            alt={association.name}
            className="max-w-full max-h-28 w-auto h-auto object-contain p-4 group-hover:scale-105 transition-transform duration-300"
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
        </div>

        {/* Content - Fixed height sections */}
        <div className="space-y-3 flex flex-col flex-grow min-h-0">
          {/* Title section - Fixed height */}
          <div className="flex-shrink-0">
            <h3 className="font-bold text-lg text-white mb-1 group-hover:text-red-600 transition-colors line-clamp-1">
              {association.name}
            </h3>
            <p className="text-gray-400 text-xs line-clamp-2 h-8">
              {association.fullName}
            </p>
          </div>

          {/* Description - Fixed height with ellipsis */}
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 h-16 flex-shrink-0">
            {association.description}
          </p>

          {/* Spacer to push footer to bottom */}
          <div className="flex-grow min-h-0" />

          {/* Footer - Fixed at bottom */}
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

      // Update button states after scroll animation
      setTimeout(checkScrollButtons, 300);
    }
  };

  return (
    <div className="relative">
      <h2 className="text-xl sm:text-2xl font-bold mb-6">Industry Associations</h2>
      
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
          {industryAssociations.map((association) => (
            <div 
              key={association.id} 
              className="w-[280px] h-[380px] flex-shrink-0"
            >
              <IndustryAssociationCard association={association} />
            </div>
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