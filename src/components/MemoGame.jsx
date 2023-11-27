import { useState, useEffect } from "react";
import Card from "./Card";
import "./MemoGame.scss";
import { useParams } from 'react-router-dom';
import { useMutation,useQuery } from '@apollo/client';
import { UPDATE_GAME_SESSION_CARD_MUTATION,GAME_SESSION_BY_ID_QUERY } from '../apollo/query'; 

const MemoGame = ({ pairs, onGameOver }) => {

  const [updateGameSessionCard] = useMutation(UPDATE_GAME_SESSION_CARD_MUTATION);

  const { gameId, sessionId,action } = useParams();

  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [retries, setRetries] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0); 

  const { loading, error, data } = useQuery(GAME_SESSION_BY_ID_QUERY, {
    variables: { id: sessionId },
  });


  useEffect(() => {
    const storedCards = localStorage.getItem(`memoGameCards_${gameId}`);
    
    
    if(action === 'continue' && !loading && !error ){
      setRetries(data.gameSession.retries)
      setMatchedPairs(data.gameSession.number_of_pairs)
    }

    if (storedCards && JSON.parse(storedCards).length > 0) {
      const loadedCards = JSON.parse(storedCards);

      const flippedPairs = loadedCards
        .filter((card) => card.isMatched && card.isFlipped)
        .map((card) => card.image_url);
    
      const updatedCards = loadedCards.map((card) => {
        if (!card.isMatched && !flippedPairs.includes(card.image_url)) {
          return { ...card, isFlipped: false };
        }
        return card;
      });
    
      setCards(updatedCards);
    } else {
      const newCards = generateCards();
      setCards(newCards);
      localStorage.setItem(`memoGameCards_${gameId}`, JSON.stringify(newCards));
    }
  }, [gameId,action, loading, error,data]);
  
  

  useEffect(() => {
    // Save the current state of cards in localStorage
    localStorage.setItem(`memoGameCards_${gameId}`, JSON.stringify(cards));
  }, [cards, gameId]); // Run whenever cards state changes or memoTestId changes

  function generateCards() {
    const shuffledPairs = shuffleArray([...pairs]);
    const cardsWithIds = shuffledPairs.flatMap((pair, index) => [
      { ...pair, id: index * 2 + 1, isMatched: false, isFlipped: false },
    ]);
  
    return shuffleArray(cardsWithIds);
  }
  

  function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  function handleCardClick(cardId) {
    const clickedCard = cards.find((card) => card.id === cardId);
  
    if (clickedCard.isFlipped || clickedCard.isMatched) {
      return;
    }
  
    const updatedCards = cards.map((card) =>
      card.id === cardId ? { ...card, isFlipped: true } : card
    );
  
    setCards(updatedCards);
    setSelectedCards([...selectedCards, cardId]);
    setRetries(retries + 1);
    if (selectedCards.length === 1) {
      const firstCardId = selectedCards[0];
      const firstCard = updatedCards.find((card) => card.id === firstCardId);
  
      if (firstCard.image_url === clickedCard.image_url) {
         const updatedCardsWithMatch = updatedCards.map((card) =>
          card.id === cardId || card.id === firstCardId
            ? { ...card, isMatched: true }
            : card
        );

        setCards(updatedCardsWithMatch);
        setSelectedCards([]);

        const allMatched = updatedCardsWithMatch.every((card) => card.isMatched);
        if (allMatched) {
          setMatchedPairs((prevMatchedPairs) => {
            const updatedMatchedPairs = prevMatchedPairs + 1;
        
            updateGameSessionCard({
              variables: {
                id: sessionId, 
                retries: retries,
                number_of_pairs: updatedMatchedPairs, 
              },
            });
            return updatedMatchedPairs;

          });
          const finalScore = (pairs.length / retries) * 100;
          localStorage.removeItem(`memoGameCards_${gameId}`);
          onGameOver(finalScore);
        }
        else{
          // If not all cards are matched, update the GameSession
          setMatchedPairs((prevMatchedPairs) => {
            const updatedMatchedPairs = prevMatchedPairs + 1;
        
            updateGameSessionCard({
              variables: {
                id: sessionId, 
                retries: retries,
                number_of_pairs: updatedMatchedPairs, 
              },
            });
            return updatedMatchedPairs;
          });
        
        }

      }
      else {
        setTimeout(() => {
          const updatedCardsWithoutMatch = updatedCards.map((card) =>
            card.id === cardId || card.id === firstCardId
              ? { ...card, isFlipped: false }
              : card
          );

          setCards(updatedCardsWithoutMatch);
          setSelectedCards([]);
  
          // Girar de nuevo las cartas que no hicieron match
          const unmatchedCards = updatedCardsWithoutMatch.filter(
            (card) => !card.isMatched
          );
  
          const resetCards = unmatchedCards.map((card) => ({
            ...card,
            isFlipped: false,
          }));
  
          if (typeof updatedCardsWithMatch !== 'undefined') {
            setCards([...updatedCardsWithMatch, ...resetCards]);
          }       
         }, 1000);
      }
    }
  }
  
  if (cards.length == 0 ) return

  return (
    <div className="memo-game">

      {cards.map((card, index) => (
        <Card
          key={index}
          number={index}
          id={card.id}
          image={card.image_url}
          onClick={() => handleCardClick(card.id)}
          isFlipped={card.isFlipped || card.isMatched}
          isMatched={card.isMatched}
        />
      ))}
    </div>
  );
};

export default MemoGame;