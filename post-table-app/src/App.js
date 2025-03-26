import { useQuery, useMutation } from '@apollo/client';
import DataTable from 'react-data-table-component';
import React, { useState } from 'react';
import { gql } from '@apollo/client';
import './App.css'; // Import CSS for styles

// 1. Define GraphQL operations
const GET_POSTS = gql`
  query GetPosts {
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

const DELETE_POST = gql`
  mutation DeletePost($id: Int!) {
    deletePost(id: $id) {
      id
    }
  }
`;

const UPDATE_POST = gql`
  mutation UpdatePost($id: Int!, $title: String!, $content: String!) {
    updatePost(id: $id, title: $title, content: $content) {
      id
      title
      content
    }
  }
`;

const TRUNCATE_POSTS = gql`
  mutation TruncatePosts {
    truncatePosts
  }
`;

// 2. Configure table columns
export default function App() {
  const { loading, error, data, refetch } = useQuery(GET_POSTS);
  const [createPost, { loading: createLoading, error: createError }] = useMutation(CREATE_POST, {
    onCompleted: () => refetch(),
  });
  const [deletePost, { loading: deleteLoading, error: deleteError }] = useMutation(DELETE_POST, {
    onCompleted: () => refetch(),
  });
  const [updatePost, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_POST, {
    onCompleted: () => {
      refetch();
      setEditingPost(null);
    },
  });
  const [truncatePosts, { loading: truncateLoading, error: truncateError }] = useMutation(TRUNCATE_POSTS, {
    onCompleted: () => refetch(),
  });

  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [editingPost, setEditingPost] = useState(null);

  // Handle form submission for creating or updating posts
  const handleSavePost = async () => {
    if (editingPost) {
      await updatePost({
        variables: { id: editingPost.id, title: newPost.title, content: newPost.content },
      });
    } else {
      await createPost({ variables: newPost });
    }
    setNewPost({ title: '', content: '' });
  };

  // Handle delete post
  const handleDelete = async (id) => {
    try {
      await deletePost({ variables: { id } });
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(`Delete failed: ${error.message}`);
    }
  };

  // Handle truncate posts
  const handleTruncate = async () => {
    try {
      await truncatePosts();
    } catch (error) {
      console.error('Error truncating posts:', error);
      alert(`Truncate failed: ${error.message}`);
    }
  };

  // Handle edit post
  const handleEdit = (post) => {
    setEditingPost(post);
    setNewPost({ title: post.title, content: post.content });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingPost(null);
    setNewPost({ title: '', content: '' });
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div className="app-container">
      {/* Create or Edit Post Form */}
      <div className="form-container">
        <h2 className="form-title">{editingPost ? 'Edit Post' : 'Create a New Post'}</h2>
        <input
          placeholder="Title"
          value={newPost.title}
          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
          className="input-field"
        />
        <input
          placeholder="Content"
          value={newPost.content}
          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
          className="input-field"
        />
        <div className="form-buttons">
          <button
            onClick={handleSavePost}
            className="create-button"
            disabled={createLoading || updateLoading}
          >
            {editingPost
              ? updateLoading
                ? 'Updating...'
                : 'Update Post'
              : createLoading
              ? 'Creating...'
              : 'Create Post'}
          </button>
          {editingPost && (
            <button onClick={handleCancelEdit} className="cancel-button">
              Cancel Edit
            </button>
          )}
        </div>
        {(createError || updateError) && (
          <p className="error-message">
            {createError ? createError.message : updateError.message}
          </p>
        )}
      </div>

      {/* Display posts in a table */}
      <div className="table-container">
        <div className="table-header">
          <h2 className="table-title">All Posts</h2>
          <button
            onClick={handleTruncate}
            className="truncate-button"
            disabled={truncateLoading || data.posts.length === 0}
          >
            {truncateLoading ? 'Clearing...' : 'Clear All Posts'}
          </button>
        </div>
        <DataTable
          columns={[
            { name: 'ID', selector: (row) => row.id, sortable: true, width: '80px' },
            { name: 'Title', selector: (row) => row.title, sortable: true },
            { name: 'Content', selector: (row) => row.content, sortable: true, wrap: true },
            {
              name: 'Actions',
              cell: (row) => (
                <div className="action-buttons">
                  <button onClick={() => handleEdit(row)} className="edit-button">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="delete-button"
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              ),
              width: '200px',
            },
          ]}
          data={data.posts}
          pagination
          highlightOnHover
          customStyles={{
            headCells: {
              style: {
                backgroundColor: '#f5f7f5',
                fontWeight: 'bold',
                fontSize: '16px',
              },
            },
            cells: {
              style: {
                fontSize: '14px',
              },
            },
          }}
        />
        {deleteError && <p className="error-message">{deleteError.message}</p>}
        {truncateError && <p className="error-message">{truncateError.message}</p>}
      </div>
    </div>
  );
}