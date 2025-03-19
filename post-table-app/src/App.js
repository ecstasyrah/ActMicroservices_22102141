import { useQuery, useMutation, useSubscription } from '@apollo/client';
import DataTable from 'react-data-table-component';
import React from 'react';
import { gql } from '@apollo/client';

// 1. Define GraphQL operations
const GET_POSTS = gql`
  query {
    posts {
      id
      title
      content
    }
  }
`;

const CREATE_POST = gql`
  mutation CreatePost($title: String!, $content: String!) {
    createPost(title: $title, content: $content) {
      id
      title
      content
    }
  }
`;

// 2. Configure table columns
const postColumns = [
  {
    name: 'Title',
    selector: row => row.title,
    sortable: true,
  },
  {
    name: 'Content',
    selector: row => row.content,
    wrap: true,
  },
];

export default function App() {
  // 3. Fetch initial data
  const { loading, error, data, refetch } = useQuery(GET_POSTS);

  // 4. Create post mutation with error handling
  const [createPost, { loading: mutationLoading, error: mutationError }] = useMutation(CREATE_POST, {
    onCompleted: () => {
      refetch(); // Refresh the table after a successful mutation
    },
  });

  const [newPost, setNewPost] = React.useState({
    title: '',
    content: '',
  });

  // Debug logs
  console.log('Loading:', loading);
  console.log('Error:', error);
  console.log('Data:', data);

  // Handle loading and error states for the query
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Handle form submission
  const handleCreatePost = async () => {
    try {
      await createPost({ variables: newPost });
      setNewPost({ title: '', content: '' }); // Reset form
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Create Post Form */}
      <div className="mb-4" style={{ marginBottom: '16px' }}>
        <input
          placeholder="Title"
          value={newPost.title}
          onChange={e => setNewPost({ ...newPost, title: e.target.value })}
          className="mr-2 p-2 border"
          style={{ marginRight: '8px', padding: '8px', border: '1px solid #ccc' }}
        />
        <input
          placeholder="Content"
          value={newPost.content}
          onChange={e => setNewPost({ ...newPost, content: e.target.value })}
          className="mr-2 p-2 border"
          style={{ marginRight: '8px', padding: '8px', border: '1px solid #ccc' }}
        />
        <button
          onClick={handleCreatePost}
          disabled={mutationLoading}
          className="bg-blue-500 text-white p-2 rounded"
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: mutationLoading ? 'not-allowed' : 'pointer',
            opacity: mutationLoading ? 0.6 : 1,
          }}
        >
          {mutationLoading ? 'Creating...' : 'Create Post'}
        </button>
        {mutationError && (
          <p style={{ color: 'red', marginTop: '8px' }}>
            Error creating post: {mutationError.message}
          </p>
        )}
      </div>

      {/* Display posts in a single table */}
      <div className="mb-8" style={{ marginBottom: '32px' }}>
        <h2 className="text-xl mb-4" style={{ fontSize: '1.25rem', marginBottom: '16px' }}>
          All Posts
        </h2>
        {data?.posts?.length > 0 ? (
          <DataTable
            columns={postColumns}
            data={data.posts}
            pagination
            highlightOnHover
          />
        ) : (
          <p>No posts available.</p>
        )}
      </div>
    </div>
  );
}