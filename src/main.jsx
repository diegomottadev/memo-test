import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import MemoTestSession from './pages/MemoTestSessions';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

import './index.css';
const client = new ApolloClient({
  uri: 'http://localhost:82/graphql', // Reemplaza esto con la URL de tu servidor GraphQL
  cache: new InMemoryCache(),
});

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" exact element={<Home />} />
        <Route path="/game/:gameId/session/:sessionId/:action" element={<MemoTestSession />} />
      </Routes>
    </Router>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(
<ApolloProvider client={client}>
  <App />
</ApolloProvider>

);
