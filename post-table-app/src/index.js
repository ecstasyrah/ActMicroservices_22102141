import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloClient, ApolloProvider, InMemoryCache, HttpLink, split } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import App from './App';

// Configure HTTP connection for regular operations
const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql' // Your GraphQL endpoint
});

// Configure WebSocket connection for subscriptions
const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000/graphql', // Your subscription endpoint
  options: {
    reconnect: true
  }
});

// Split links based on operation type
const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

// Create Apollo Client instance
const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
});

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root')
);