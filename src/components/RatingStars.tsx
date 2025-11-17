import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface RatingStarsProps {
  rating: number;
  showBadge?: boolean;
}

const RatingStars = ({ rating, showBadge = false }: RatingStarsProps) => {
  const getBadgeText = (rating: number) => {
    if (rating === 5) return "PIKXORA Global Elite";
    if (rating === 4) return "Premier Studio";
    if (rating === 3) return "Verified Studio";
    return "Approved Studio";
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.div
            key={star}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: star * 0.1 }}
          >
            <Star
              className={`h-4 w-4 ${
                star <= rating
                  ? "fill-primary text-primary drop-shadow-[0_0_8px_hsl(var(--red-glow))]"
                  : "fill-muted text-muted-foreground"
              }`}
            />
          </motion.div>
        ))}
      </div>
      {showBadge && rating >= 3 && (
        <span className="text-xs font-semibold text-primary red-glow">
          {getBadgeText(rating)}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
