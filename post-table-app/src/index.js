import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloClient, ApolloProvider, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import App from './App';

// HTTP link for queries and mutations
const httpLink = new HttpLink({
  uri: '/graphql', // Relative URI, will be proxied to http://localhost:4002/graphql
});

// Middleware to dynamically set the x-apollo-operation-name header
const operationNameLink = setContext((operation, previousContext) => {
  return {
    headers: {
      ...previousContext.headers,
      'Content-Type': 'application/json',
      'x-apollo-operation-name': operation.operationName || 'UnnamedOperation',
    },
  };
});

// Combine the links
const link = ApolloLink.from([operationNameLink, httpLink]);

// Create Apollo Client instance
const client = new ApolloClient({
  link: link,
  cache: new InMemoryCache(),
});

// Reset the cache to clear any old queries
client.resetStore();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);