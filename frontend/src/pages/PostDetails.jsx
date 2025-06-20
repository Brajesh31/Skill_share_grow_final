import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaHeart, FaEdit, FaTrash } from "react-icons/fa";

export default function PostDetails({ postId }) { // Default export
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);

  // Placeholder for addNotification (replace with your actual implementation)
  const addNotification = (message) => console.log(message);

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/posts/${postId}`, { withCredentials: true })
      .then((res) => setPost(res.data))
      .catch((err) => console.error("Error fetching post:", err));
    axios
      .get("http://localhost:8080/api/users/me", { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch((err) => console.error("Error fetching user:", err));
  }, [postId]);

  const handleLike = () => {
    axios
      .post(`http://localhost:8080/api/posts/${postId}/like`, {}, { withCredentials: true })
      .then((res) => {
        setPost(res.data);
        addNotification("Post liked!");
      })
      .catch((err) => console.error("Error liking post:", err));
  };

  const handleUnlike = () => {
    axios
      .post(`http://localhost:8080/api/posts/${postId}/unlike`, {}, { withCredentials: true })
      .then((res) => {
        setPost(res.data);
        addNotification("Post unliked!");
      })
      .catch((err) => console.error("Error unliking post:", err));
  };

  const handleEditComment = async (commentId, newText) => {
    try {
      const res = await axios.put(
        `http://localhost:8080/api/posts/comments/${commentId}?userId=${user.userId}`,
        { text: newText },
        { withCredentials: true }
      );
      setPost({
        ...post,
        comments: post.comments.map((c) => (c.id === commentId ? res.data : c)),
      });
      addNotification("Comment updated!");
    } catch (err) {
      console.error("Error editing comment:", err);
      addNotification("Failed to update comment.");
    }
  };

  const handleDeleteComment = (commentId) => {
    axios
      .delete(`http://localhost:8080/api/posts/comments/${commentId}?userId=${user.userId}`, {
        withCredentials: true,
      })
      .then(() => {
        setPost({
          ...post,
          comments: post.comments.filter((c) => c.id !== commentId),
        });
        addNotification("Comment deleted!");
      })
      .catch((err) => console.error("Error deleting comment:", err));
  };

  if (!post) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">{post.title}</h1>
      <p className="mt-2 text-gray-700 dark:text-gray-300">{post.content}</p>
      <div className="mt-4 flex space-x-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLike}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <FaHeart />
          <span>Like ({post.likes})</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleUnlike}
          className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <FaHeart />
          <span>Unlike</span>
        </motion.button>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold">Comments</h2>
        {post.comments && post.comments.length > 0 ? (
          post.comments.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mt-2 flex justify-between items-center"
            >
              <p className="text-gray-800 dark:text-gray-200">{c.text}</p>
              {user?.userId === c.user.id && (
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => {
                      const newText = prompt("Edit comment:", c.text);
                      if (newText) handleEditComment(c.id, newText);
                    }}
                    className="text-blue-500"
                  >
                    <FaEdit />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => handleDeleteComment(c.id)}
                    className="text-red-500"
                  >
                    <FaTrash />
                  </motion.button>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <p className="text-gray-500">No comments yet.</p>
        )}
      </div>
    </div>
  );
}