import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloClient, ApolloProvider, InMemoryCache, HttpLink } from '@apollo/client';
import App from './App';

// HTTP link for queries and mutations
const httpLink = new HttpLink({
  uri: '/graphql', // Relative URI, will be proxied to http://localhost:4002/graphql
  headers: {
    'Content-Type': 'application/json',
    'x-apollo-operation-name': 'GetPosts', // Add this header to bypass CSRF protection
  },
});

// Create Apollo Client instance
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);