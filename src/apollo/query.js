// query.js

import { gql } from '@apollo/client';

// Consulta para obtener todos los MemoTests
export const MEMO_TESTS_QUERY = gql`
{
    memoTests {
      id
      name
      scoreMax {
        score
      }
    }
  }
`;

// Mutación para crear una nueva sesión de juego
export const CREATE_GAME_SESSION_MUTATION = gql`
mutation CreateGameSession($memo_test_id: ID!, $retries: Int!, $number_of_pairs: Int!, $state: SessionState!) {
    createGameSession(memo_test_id: $memo_test_id, retries: $retries, number_of_pairs: $number_of_pairs, state: $state) {
      id
      memo_test_id
      retries
      number_of_pairs
      state
      user_selections
      score
      created_at
      updated_at
    }
  }  
`;

export const MEMO_TEST_BY_ID_QUERY = gql`
  query MemoTest($id: ID!) {
    memoTest(id: $id) {
      id
      name
      images {
        id
        image_url
      }
    }
  }
`;

export const UPDATE_GAME_SESSION_MUTATION  = gql`
mutation UpdateGameSession($id: ID!, $score: Int!) {
    updateGameSession(id: $id, score: $score) {
      id
      memo_test_id
      retries
      number_of_pairs
      state
      user_selections
      score
      created_at
      updated_at
    }
  }  
`

export const GAME_SESSION_BY_ID_QUERY = gql`
  query Gamession($id: ID!) {
    gameSession(id: $id) {
      id
      memo_test_id
      retries
      number_of_pairs
      state
      user_selections
      score
    }
  }
`;

export const UPDATE_GAME_SESSION_CARD_MUTATION = gql`
mutation UpdateGameSessionCard($id: ID!, $retries: Int!, $number_of_pairs: Int!) {
  updateGameSessionCard(id: $id, retries: $retries,number_of_pairs: $number_of_pairs) {
    id
    memo_test_id
    retries
    number_of_pairs
    state
    user_selections
    score
    created_at
    updated_at
  }
}  
`