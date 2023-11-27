
import './Score.scss'

const Score = ({ score, onReturnHome }) => (
  <div className="game-over">
    <h3>Game Over!</h3>
    <p>Score: {score}</p>
    <button onClick={onReturnHome}>Return to Home</button>
  </div>
);

export default Score;
