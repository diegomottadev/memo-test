import React, { useState, useEffect } from "react";
import MemoGame from "../components/MemoGame";
import "./MemoTestSession.scss";
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery ,useMutation} from '@apollo/client';
import { MEMO_TEST_BY_ID_QUERY ,UPDATE_GAME_SESSION_MUTATION} from './../apollo/query';
import RoundProgressBar from "../components/RoundProgressBar";
import Score from "../components/Score";

const MemoTestSession = () => {
  const { gameId,sessionId,action } = useParams();
  const navigate = useNavigate();
  const [memoTestSession, setMemoTestSession] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(null);

  const { loading, error, data } = useQuery(MEMO_TEST_BY_ID_QUERY, {
    variables: { id: gameId },
  });


  const [updateGameSession] = useMutation(UPDATE_GAME_SESSION_MUTATION);


  useEffect(() => {
    const storedSession = localStorage.getItem(`memoTestSession_${gameId}`);

    if (action === "continue" && storedSession) {
      // Continue the existing session
      const pairs = localStorage.getItem(`memoTestSessionPairs_${gameId}`);

      setMemoTestSession(JSON.parse(pairs));
    } else if (!loading && !error) {
      const memoTests = data.memoTest;
      const pairs = [...memoTests.images, ...memoTests.images]; // Duplicate to create pairs

      setMemoTestSession(pairs);

      // Save the new session in local storage
      localStorage.setItem(
        `memoTestSessionPairs_${gameId}`,
        JSON.stringify(pairs)
      );
    }
  }, [gameId, action, loading, error, data]);

  const handleGameOver = async (finalScore) => {
    setGameOver(true);
    setScore(finalScore);

    try {
       // Retrieve the game session ID from local storage
     
        // Perform the mutation to update the score
        const { data } = await updateGameSession({
          variables: { id: sessionId, score:  parseInt (finalScore) , status: 'Completed' },
        });

        // Access the updated game session information from data
        const updatedGameSession = data.updateGameSession;      

      // Clear the session from local storage when the game is over
        localStorage.removeItem(`memoTestSession_${gameId}`);
        localStorage.removeItem(`memoTestSessionPairs_${gameId}`);
        
    } catch (error) {
      console.error('Error updating game session score:', error.message);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (memoTestSession.length == 0 ){
    return <RoundProgressBar progress={100}/>;
  }


  return (
    <div >
     
      {gameOver ? (

        <Score onReturnHome={handleGoHome} score={parseInt(score)}/>

      ) : (
        <div className="memo-test-session">
          <h2>Memo Test Session {gameId}</h2>
            <button className="go-home-button" onClick={handleGoHome}>
              Go Home
            </button>
          <MemoGame pairs={memoTestSession} onGame={gameId} onGameOver={handleGameOver} />
        </div>
       
      )}
    </div>
  );
};

export default MemoTestSession;
