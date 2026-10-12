import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({ rating = 0, count = null, size = 'w-4 h-4' }) => {
  const numericRating = Number(rating) || 0;

  return (
    <div className="flex items-center gap-1">
      <div className="flex text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              numericRating >= star
                ? 'fill-amber-400 text-amber-400'
                : numericRating >= star - 0.5
                ? 'fill-amber-200 text-amber-400'
                : 'text-slate-300'
            }`}
          />
        ))}
      </div>
      {numericRating > 0 && (
        <span className="text-xs font-semibold text-slate-700 ml-1">
          {numericRating.toFixed(1)}
        </span>
      )}
      {count !== null && (
        <span className="text-xs text-slate-400">({count})</span>
      )}
    </div>
  );
};

export default RatingStars;
