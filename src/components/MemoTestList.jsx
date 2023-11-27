import { useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_GAME_SESSION_MUTATION } from './../apollo/query';
import RoundProgressBar from './RoundProgressBar';

import './MemoTestList.scss';

const MemoTestList = ({ memoTests }) => {
  const navigate = useNavigate();
  const [createGameSession] = useMutation(CREATE_GAME_SESSION_MUTATION);
  const [loading, setLoading] = useState(false);

  const handleSession = async (memoTestId) => {
    const storedSession = localStorage.getItem(`memoTestSession_${memoTestId}`);

    if (storedSession) {

        navigate(`/game/${memoTestId}/session/${storedSession}/continue`);

    } else {
      try {
        setLoading(true);
        const retries = 0;
        const numberOfPairs = 8;
        const state = 'Started';

        // Realiza la mutación para crear una nueva sesión
        const { data } = await createGameSession({
          variables: { memo_test_id: memoTestId, retries, number_of_pairs: numberOfPairs, state },
        });

        // Accede a la información de la mutación  desde data
        const newGameSession = data.createGameSession;

        // Guarda el memo test ID en el almacenamiento local para el seguimiento de la sesión
        localStorage.setItem(`memoTestSession_${memoTestId}`, newGameSession.id);

        // Inicia una nueva sesión
        // Navega a la página de sesión para una nueva sesión
        navigate(`/game/${memoTestId}/session/${newGameSession.id}/new`);

      } catch (error) {
        console.error('Error al crear la sesión de juego:', error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div>
        <RoundProgressBar />
      </div>
    )
  }

  const ScoreComponent = ({ onMemoTest }) => {
    if (!onMemoTest.scoreMax) return null; 
  
    return (
      <div className='memo-test-score'>
        Max score: {onMemoTest.scoreMax.score}
      </div>
    );
  };
  
    
  return (
    <div className="memo-test-list">
      <ul>
        {memoTests.map((memoTest) => (
          <li key={memoTest.id} className="memo-test-item">
            <div className="memo-test-name">{memoTest.name}</div>
            <button onClick={() => handleSession(memoTest.id)}>
              {localStorage.getItem(`memoTestSession_${memoTest.id}`) ? `Continue` : 'Start New'}
            </button>
            <ScoreComponent onMemoTest={memoTest}/>
            
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MemoTestList;
