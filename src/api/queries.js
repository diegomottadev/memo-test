/**
 * GraphQL documents used by `memoTestApi.js`. They follow the backend schema
 * (`graphql/schema.graphql` in the api-memo-test repo), which uses snake_case.
 */

/** Lists every memo test with its best session score. */
export const MEMO_TESTS_QUERY = /* GraphQL */ `
  query MemoTests {
    memoTests {
      id
      name
      scoreMax {
        score
      }
    }
  }
`;

/** Fetches one memo test with its images. */
export const MEMO_TEST_QUERY = /* GraphQL */ `
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

/** Creates a game session for a memo test. */
export const CREATE_GAME_SESSION_MUTATION = /* GraphQL */ `
  mutation CreateGameSession(
    $memo_test_id: ID!
    $retries: Int!
    $number_of_pairs: Int!
    $state: SessionState!
  ) {
    createGameSession(
      memo_test_id: $memo_test_id
      retries: $retries
      number_of_pairs: $number_of_pairs
      state: $state
    ) {
      id
    }
  }
`;

/** Stores clicks (`retries`) and matched pairs (`number_of_pairs`) of a session. */
export const UPDATE_GAME_SESSION_PROGRESS_MUTATION = /* GraphQL */ `
  mutation UpdateGameSessionCard($id: ID!, $retries: Int!, $number_of_pairs: Int!) {
    updateGameSessionCard(id: $id, retries: $retries, number_of_pairs: $number_of_pairs) {
      id
    }
  }
`;

/** Stores the final score of a session. */
export const FINISH_GAME_SESSION_MUTATION = /* GraphQL */ `
  mutation UpdateGameSession($id: ID!, $score: Int!) {
    updateGameSession(id: $id, score: $score) {
      id
    }
  }
`;
