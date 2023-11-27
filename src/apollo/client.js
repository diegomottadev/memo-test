import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:82/graphql', // Reemplaza esto con la URL de tu servidor GraphQL
  cache: new InMemoryCache(),
});

export default client;