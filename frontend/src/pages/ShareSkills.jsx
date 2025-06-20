import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { createPost, getPosts, updatePost, deletePost } from "../api.js";
import { motion } from "framer-motion";
//
export default function ShareSkills() {
  const { user, theme } = useContext(AuthContext);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);

  const fetchUserPosts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const allPosts = await getPosts(user.token);
      const userPosts = allPosts.filter(post => String(post.user?.id) === String(user.id));
      setPosts(userPosts);
    } catch (err) {
      setError("Failed to fetch your posts: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPosts();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to share a post");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category", category);
    formData.append("tags", tags);
    files.forEach(file => formData.append("files", file));

    try {
      if (editingPost) {
        const updatedPost = await updatePost(editingPost.id, formData, user.token);
        setPosts(posts.map(post => post.id === updatedPost.id ? updatedPost : post));
        setSuccess("Skill updated successfully!");
        setEditingPost(null);
      } else {
        const newPost = await createPost(formData, user.token);
        setPosts([newPost, ...posts]);
        setSuccess("Skill shared successfully!");
      }
      setTitle("");
      setContent("");
      setCategory("");
      setTags("");
      setFiles([]);
      setError(null);
      fetchUserPosts();
    } catch (err) {
      setError(`Failed to ${editingPost ? "update" : "share"} skill: ${err.message}`);
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setCategory(post.category || "");
    setTags(post.tags || "");
    setFiles([]);
  };

  const handleDelete = async (postId) => {
    try {
      await deletePost(postId, user.token);
      setPosts(posts.filter(post => post.id !== postId));
      setSuccess("Skill deleted successfully!");
    } catch (err) {
      setError("Failed to delete skill: " + err.message);
    }
  };

  if (!user) {
    return (
      <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"} flex items-center justify-center`}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
        >
          Log in to share your skills!
        </motion.p>
      </div>
    );
  }

  return (
    <div className={`${theme === "dark" ? "bg-gray-900" : "bg-gray-50"} py-16 px-4`}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className={`max-w-3xl mx-auto p-8 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
      >
        <h1 className={`text-4xl font-bold mb-8 text-center ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          {editingPost ? "Edit Skill" : "Share a Skill"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Skill Title"
            className={`w-full p-4 rounded ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"}`}
            required
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe your skill..."
            className={`w-full p-4 rounded ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"} h-40`}
            required
          />
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
            className={`w-full p-4 rounded ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"}`}
          />
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma-separated)"
            className={`w-full p-4 rounded ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"}`}
          />
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files))}
            className={`w-full p-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          />
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-4 rounded text-white ${loading ? "bg-gray-500" : "bg-indigo-600"}`}
            >
              {loading ? "Processing..." : editingPost ? "Update" : "Share"}
            </button>
            {editingPost && (
              <button
                onClick={() => {
                  setEditingPost(null);
                  setTitle("");
                  setContent("");
                  setCategory("");
                  setTags("");
                  setFiles([]);
                }}
                className="flex-1 py-4 rounded bg-gray-500 text-white"
              >
                Cancel
              </button>
            )}
          </div>
          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && <p className="text-green-500 text-center">{success}</p>}
        </form>
      </motion.div>

      <div className="max-w-6xl mx-auto mt-12">
        <h2 className={`text-3xl font-bold mb-8 text-center ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Your Skills
        </h2>
        {loading ? (
          <p className={`text-center ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Loading...</p>
        ) : posts.length === 0 ? (
          <p className={`text-center ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>No skills shared yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-6 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
              >
                {post.images && (
                  <img
                    src={`http://localhost:8080${post.images.split(",")[0].trim()}`}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded mb-4"
                    onError={(e) => {
                      console.error(`Failed to load image: http://localhost:8080${post.images.split(",")[0]}`);
                      e.target.src = "/fallback-image.jpg"; // Optional: Provide a fallback image
                    }}
                  />
                )}
                <h3 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{post.title}</h3>
                <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>{post.content}</p>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => handleEdit(post)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}