import  { useState, useEffect } from 'react';
import './Card.scss';

const Card = ({ number,id, image, onClick, isFlipped, isMatched }) => {
  const [isAnimationDone, setIsAnimationDone] = useState(false);

  useEffect(() => {
    setIsAnimationDone(true);
  }, [isFlipped, isMatched]);

  const handleCardClick = () => {
    if (isAnimationDone && !isFlipped && !isMatched) {
      onClick(id);
    }
  };

  return (
    <div
      className={`card ${isFlipped || isMatched ? 'flipped' : ''}`}
      onClick={handleCardClick}
    >
      {isFlipped || isMatched ? (
        <img src={image} alt={`Card ${id}`} />
      ) : (
        <div className="card-back">{number + 1}</div>
      )}
    </div>
  );
};

export default Card;
