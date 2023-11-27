import MemoTestList from '../components/MemoTestList';
import { useQuery } from '@apollo/client';
import { MEMO_TESTS_QUERY } from './../apollo/query';

import './Home.scss'; 
import RoundProgressBar from '../components/RoundProgressBar';
import { useEffect } from 'react';


const Home = () => {

  const { loading, error, data,refetch} = useQuery(MEMO_TESTS_QUERY);

  useEffect(() => {
    refetch();
  }, []);

  if (loading) return <div className="home"><RoundProgressBar/></div>;
  if (error) return <p>Error al cargar los Memo Tests</p>;

  const memoTests = data.memoTests;

  return (
    <div className="home">
      <h1>Memory Test App</h1>
      <MemoTestList memoTests={memoTests} />
    </div>
  );
};

export default Home;
