import './RoundProgressBar.scss';

const RoundProgressBar = () => {
  return (
    <div className='center-container'>
    <div className="round-progress-bar">
      <div className="loader">
        <div className="spinner"></div>
        <div className="text">...Loading</div>
      </div>
    </div>
    </div>
  );
};

export default RoundProgressBar;
