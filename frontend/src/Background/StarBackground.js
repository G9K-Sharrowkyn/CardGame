import React, { useEffect, useState } from 'react';
import './StarBackground.css';

function generateBoxShadows(numberOfStars, width, height) {
  let boxShadow = '';
  for (let i = 0; i < numberOfStars; i++) {
    const x = Math.round(Math.random() * width);
    const y = Math.round(Math.random() * height);
    boxShadow += `${x}px ${y}px #FFF, `;
  }
  return boxShadow.slice(0, -2);
}

const StarBackground = () => {
  const [smallStars] = useState(() => generateBoxShadows(2100, window.innerWidth, window.innerHeight));
  const [mediumStars] = useState(() => generateBoxShadows(500, window.innerWidth, window.innerHeight));
  const [bigStars] = useState(() => generateBoxShadows(500, window.innerWidth, window.innerHeight));


  return (
    <div className="stars-background">
      <div id="stars" style={{ boxShadow: smallStars }}></div>
      <div id="stars2" style={{ boxShadow: mediumStars }}></div>
      <div id="stars3" style={{ boxShadow: bigStars }}></div>
      <div id="title">
        <span>
          Proteus Nebule
          <br />
          Battle Card Game
        </span>
      </div>
    </div>
  );
};

export default StarBackground;
