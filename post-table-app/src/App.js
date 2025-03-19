import { useQuery, useMutation, useSubscription } from '@apollo/client';
import DataTable from 'react-data-table-component';
import React from 'react';
import { gql } from '@apollo/client';

// 1. Define GraphQL operations
const GET_USERS_WITH_POSTS = gql`
  query {
    users {
      id
      name
      posts {
        id
        title
        content
        userId
      }
    }
  }
`;

const POST_SUBSCRIPTION = gql`
  subscription {
    postAdded {
      id
      title
      content
      userId
    }
  }
`;

const CREATE_POST = gql`
  mutation CreatePost($title: String!, $content: String!, $userId: ID!) {
    createPost(title: $title, content: $content, userId: $userId) {
      id
      title
    }
  }
`;

// 2. Configure table columns
const postColumns = [
  {
    name: 'Title',
    selector: row => row.title,
    sortable: true
  },
  {
    name: 'Content',
    selector: row => row.content,
    wrap: true
  }
];

export default function App() {
  // 3. Fetch initial data
  const { loading, error, data, refetch } = useQuery(GET_USERS_WITH_POSTS);
  
  // 4. Set up subscription
  useSubscription(POST_SUBSCRIPTION, {
    onData: ({ data }) => {
      console.log('New post:', data.postAdded);
      refetch(); // Refresh table data
    }
  });

  // 5. Create post mutation
  const [createPost] = useMutation(CREATE_POST);
  const [newPost, setNewPost] = React.useState({ 
    title: '', 
    content: '', 
    userId: '1' 
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container">
      {/* Create Post Form */}
      <div className="mb-4">
        <input
          placeholder="Title"
          value={newPost.title}
          onChange={e => setNewPost({...newPost, title: e.target.value})}
          className="mr-2 p-2 border"
        />
        <input
          placeholder="Content"
          value={newPost.content}
          onChange={e => setNewPost({...newPost, content: e.target.value})}
          className="mr-2 p-2 border"
        />
        <button
          onClick={() => {
            createPost({ variables: newPost });
            setNewPost({ title: '', content: '', userId: '1' });
          }}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Create Post
        </button>
      </div>

      {/* Display tables per user */}
      {data.users.map(user => (
        <div key={user.id} className="mb-8">
          <h2 className="text-xl mb-4">{user.name}'s Posts</h2>
          <DataTable
            columns={postColumns}
            data={user.posts}
            pagination
            highlightOnHover
          />
        </div>
      ))}
    </div>
  );
}
