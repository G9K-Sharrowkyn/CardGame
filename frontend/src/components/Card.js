import React, { useState } from 'react';
import cardsSpecifics from '../mechanics/CardsSpecifics';

// Component to handle card image loading with fallback
const CardImage = ({ cardName, cardType }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [allImagesFailed, setAllImagesFailed] = useState(false);

  // All possible image paths to try
  const possiblePaths = [
    // Try with process.env.PUBLIC_URL first
    `${process.env.PUBLIC_URL}/assets/cards/${cardName}.png`,
    `${process.env.PUBLIC_URL}/assets/cards/${cardName}.jpg`,
    `${process.env.PUBLIC_URL}/assets/cards2/${cardName}.png`,
    `${process.env.PUBLIC_URL}/assets/cards2/${cardName}.jpg`,
    // Try relative paths
    `/assets/cards/${cardName}.png`,
    `/assets/cards/${cardName}.jpg`,
    `/assets/cards2/${cardName}.png`,
    `/assets/cards2/${cardName}.jpg`,
    // Try with encoding for special characters
    `${process.env.PUBLIC_URL}/assets/cards/${encodeURIComponent(cardName)}.png`,
    `${process.env.PUBLIC_URL}/assets/cards/${encodeURIComponent(cardName)}.jpg`,
  ];

  const handleImageError = () => {
    console.log(`Failed to load image: ${possiblePaths[currentImageIndex]} for card: ${cardName}`);
    const nextIndex = currentImageIndex + 1;
    if (nextIndex < possiblePaths.length) {
      setCurrentImageIndex(nextIndex);
      setImageLoaded(false);
    } else {
      console.log(`All image paths failed for card: ${cardName}`);
      setAllImagesFailed(true);
    }
  };

  const handleImageLoad = () => {
    console.log(`Successfully loaded image: ${possiblePaths[currentImageIndex]} for card: ${cardName}`);
    setImageLoaded(true);
  };

  // If all images failed to load, show fallback
  if (allImagesFailed || !cardName) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800 relative">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-transparent via-white to-transparent transform rotate-45 scale-150"></div>
        </div>
        
        <div className="relative z-10 text-center px-1">
          <span className="text-xs text-white font-bold leading-tight block">
            {cardName?.replace(/_/g, ' ').substring(0, 20)}
          </span>
          
          {/* Card type indicator */}
          {cardType && cardType.length > 0 && (
            <div className="mt-1">
              <span className="text-xs text-yellow-300 font-semibold">
                {cardType[0]}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {!imageLoaded && (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-800">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
      <img 
        src={possiblePaths[currentImageIndex]} 
        alt={cardName}
        className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </>
  );
};

const Card = ({ 
  card, 
  isSelected = false, 
  onClick, 
  size = 'normal', 
  showStats = false, 
  className = '',
  disabled = false 
}) => {
  const details = cardsSpecifics.find(c => c.name === card.name) || {};
  
  const sizeClasses = {
    tiny: 'w-8 h-12',
    small: 'w-12 h-16',
    normal: 'w-16 h-24 sm:w-20 sm:h-28',
    large: 'w-20 h-28 sm:w-24 sm:h-32',
    huge: 'w-28 h-40 sm:w-32 sm:h-44'
  };

  const handleClick = (e) => {
    if (disabled) return;
    if (onClick) {
      e.stopPropagation();
      onClick(card);
    }
  };

  return (
    <div 
      className={`${sizeClasses[size]} relative cursor-pointer transition-all duration-300 transform card-hover ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
      } ${
        isSelected ? 'animate-selected scale-110 ring-2 ring-yellow-400 shadow-2xl z-20' : 'hover:shadow-xl'
      } ${className}`}
      onClick={handleClick}
    >
      <div className="w-full h-full bg-gradient-to-b from-gray-700 to-gray-900 rounded-lg border-2 border-gray-600 shadow-lg overflow-hidden relative">
        {/* Card Image/Background */}
        <CardImage 
          cardName={card.name}
          cardType={details.type}
        />
        
        {/* Card Stats Overlay */}
        {showStats && (
          <>
            {/* Command Cost */}
            {details.commandCost !== undefined && details.commandCost >= 0 && (
              <div className="absolute top-1 left-1 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-blue-300 shadow-lg mana-crystal">
                {details.commandCost}
              </div>
            )}
            
            {/* Attack Value */}
            {details.attack !== undefined && details.attack >= 0 && (
              <div className="absolute bottom-1 left-1 w-6 h-6 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-red-300 shadow-lg">
                {details.attack}
              </div>
            )}
            
            {/* Defense Value */}
            {details.defense !== undefined && details.defense >= 0 && (
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-green-300 shadow-lg">
                {details.defense}
              </div>
            )}
            
            {/* Special indicators */}
            {details.type && details.type.includes('Shipyard') && (
              <div className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full border border-yellow-300 shadow-lg">
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xs text-black font-bold">⚓</span>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Selection glow effect */}
        {isSelected && (
          <div className="absolute inset-0 rounded-lg border-2 border-yellow-400 shadow-lg pointer-events-none">
            <div className="w-full h-full rounded-lg bg-yellow-400 opacity-20 animate-pulse"></div>
          </div>
        )}
        
        {/* Hover effect overlay */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-transparent to-white opacity-0 hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default Card;