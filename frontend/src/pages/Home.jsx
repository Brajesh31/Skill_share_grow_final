import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getPosts, commentOnPost, updateComment, deleteComment, addReaction, followUser } from "../api.js";
import { motion, AnimatePresence } from "framer-motion";
import { SunIcon, MoonIcon, PencilIcon, TrashIcon, HandThumbUpIcon, ChatBubbleLeftIcon, ShareIcon, HeartIcon, LinkIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { FaWhatsapp, FaFacebook } from "react-icons/fa";

export default function Home() {
  const {
    user,
    theme,
    toggleTheme,
    login,
    register,
    showAuthForm,
    setShowAuthForm,
    isLogin,
    setIsLogin,
    logout, // Assuming AuthContext provides a logout function
  } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComments, setNewComments] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [showReactions, setShowReactions] = useState(null);
  const [showShareOptions, setShowShareOptions] = useState(null);
  const [copied, setCopied] = useState(false);
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const fetchPosts = async () => {
    setLoading(true);
    try {
      if (!user?.token) {
        throw new Error("No authentication token found. Please log in.");
      }
      const postsData = await getPosts(user.token);
      setPosts(postsData);
      setFilteredPosts(postsData);
    } catch (err) {
      console.error("Failed to load posts:", err);
      if (err.response?.status === 401) {
        // Handle 401 Unauthorized: Log out the user and show login form
        logout(); // Assuming logout clears the user state
        setShowAuthForm(true);
        setIsLogin(true);
        setError("Session expired. Please log in again.");
      } else {
        setError("Failed to load posts. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
    } else {
      setPosts([]);
      setFilteredPosts([]);
    }
  }, [user]);

  const getUniqueTags = () => {
    const allTags = posts.flatMap((post) => (post.tags ? post.tags.split(",").map((tag) => tag.trim()) : []));
    return ["All", ...new Set(allTags)];
  };

  useEffect(() => {
    let result = posts;
    if (selectedTag !== "All") {
      result = result.filter((post) => post.tags && post.tags.split(",").map((tag) => tag.trim()).includes(selectedTag));
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (post) =>
          post.title?.toLowerCase().includes(query) ||
          post.content?.toLowerCase().includes(query)
      );
    }
    setFilteredPosts(result);
  }, [selectedTag, searchQuery, posts]);

  const handleCommentSubmit = async (postId) => {
    if (!user || !newComments[postId]?.trim()) return;
    try {
      const updatedPost = await commentOnPost(postId, newComments[postId], user.token);
      setPosts(posts.map((p) => (p.id === postId ? updatedPost : p)));
      setNewComments({ ...newComments, [postId]: "" });
    } catch (err) {
      console.error("Failed to add comment:", err);
      if (err.response?.status === 401) {
        logout();
        setShowAuthForm(true);
        setIsLogin(true);
        setError("Session expired. Please log in again.");
      }
    }
  };

  const startEditingComment = (comment) => {
    if (!user || String(user.id) !== String(comment.user.id)) return;
    setEditingCommentId(comment.id);
    setEditedCommentText(comment.text);
  };

  const handleCommentUpdate = async (postId, commentId) => {
    if (!user || !editedCommentText.trim()) return;
    try {
      const updatedPost = await updateComment(postId, commentId, editedCommentText, user.token);
      setPosts(posts.map((p) => (p.id === postId ? updatedPost : p)));
      setEditingCommentId(null);
      setEditedCommentText("");
    } catch (err) {
      console.error("Failed to update comment:", err);
      if (err.response?.status === 401) {
        logout();
        setShowAuthForm(true);
        setIsLogin(true);
        setError("Session expired. Please log in again.");
      }
    }
  };

  const handleCommentDelete = async (postId, commentId) => {
    if (!user) return;
    try {
      await deleteComment(commentId, user.token);
      setPosts(posts.map((p) =>
        p.id === postId ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) } : p
      ));
      setEditingCommentId(null);
    } catch (err) {
      console.error("Failed to delete comment:", err);
      if (err.response?.status === 401) {
        logout();
        setShowAuthForm(true);
        setIsLogin(true);
        setError("Session expired. Please log in again.");
      }
    }
  };

  const toggleCommentSection = (postId) => {
    setActiveCommentPostId(activeCommentPostId === postId ? null : postId);
  };

  const handleReaction = async (postId, reactionType) => {
    if (!user) return;
    try {
      const updatedPost = await addReaction(postId, reactionType, user.token);
      setPosts(posts.map((p) => (p.id === postId ? updatedPost : p)));
    } catch (err) {
      console.error("Failed to add reaction:", err);
      if (err.response?.status === 401) {
        logout();
        setShowAuthForm(true);
        setIsLogin(true);
        setError("Session expired. Please log in again.");
      }
    }
    setShowReactions(null);
  };

  const handleFollowPost = async (postId, userId) => {
    if (!user) {
      setShowAuthForm(true);
      setIsLogin(true);
      return;
    }
    try {
      const updatedUser = await followUser(userId, user.token);
      setPosts(posts.map((p) =>
        p.id === postId ? { ...p, user: { ...p.user, followers: updatedUser.followers } } : p
      ));
      console.log(`Now following user ${userId}`);
    } catch (err) {
      console.error("Failed to follow user:", err);
      if (err.response?.status === 401) {
        logout();
        setShowAuthForm(true);
        setIsLogin(true);
        setError("Session expired. Please log in again.");
      } else {
        setError("Failed to follow user. Please try again.");
      }
    }
  };

  const toggleShareOptions = (postId) => {
    if (showShareOptions === postId) {
      setShowShareOptions(null);
    } else {
      setShowShareOptions(postId);
      setCopied(false);
      setTimeout(() => setShowShareOptions(null), 5000);
    }
  };

  const getPostUrl = (postId) => `http://localhost:3000/posts/${postId}`;

  const handleShare = (postId, platform) => {
    const url = getPostUrl(postId);
    const title = posts.find((p) => p.id === postId)?.title || "Check out this post!";
    switch (platform) {
      case "whatsapp":
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} - ${url}`)}`, "_blank");
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
        break;
      case "copy":
        navigator.clipboard.writeText(url).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
        break;
      default:
        break;
    }
    setShowShareOptions(null);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, password);
      }
      setUsername("");
      setPassword("");
      setError(""); // Clear error on successful auth
    } catch (err) {
      console.error("Authentication error:", err.message);
      setError(err.message || "Authentication failed");
    }
  };

  const getReactionCount = (post, type) => post.reactions?.filter((r) => r.reactionType === type).length || 0;
  const hasUserReacted = (post, type) => post.reactions?.some((r) => r.userId === user?.id && r.reactionType === type);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    hover: { scale: 1.02, transition: { duration: 0.3 } },
  };

  const formVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3, ease: "easeIn" } },
  };

  const heroTextVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const heroButtonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, delay: 0.4, ease: "easeOut" } },
    hover: { scale: 1.05, transition: { duration: 0.3 } },
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"} `}>
      {/* Theme Toggle */}
      <motion.div
        className="fixed top-6 right-6 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-full shadow-lg ${theme === "dark" ? "bg-gray-800 text-yellow-400" : "bg-white text-gray-800"}`}
        >
          {theme === "light" ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
        </button>
      </motion.div>

      {/* Hero Section - Full Screen */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative w-full h-screen mb-12 overflow-hidden rounded-none shadow-none"
      >
        {/* Background Image */}
        <motion.img
          src="/skill_sharing_workplace.jpg"
          alt="Inspire Creativity"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          onError={(e) => {
            console.error("Failed to load hero image at /skill_sharing_workplace.jpg. Check if the file exists in the public folder.");
            e.target.src = "https://via.placeholder.com/1920x1080?text=Hero+Image+Not+Found"; // Fallback image
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white px-6">
            {/* Main Heading */}
            <motion.h1
              variants={heroTextVariants}
              initial="hidden"
              animate="visible"
              className="text-4xl md:text-6xl font-bold mb-4"
            >
              Inspire Creativity in Others.
            </motion.h1>
            {/* Sub heading */}
            <motion.p
              variants={heroTextVariants}
              initial="hidden"
              animate="visible"
              className="text-lg md:text-2xl mb-6"
            >
              Teach on SkillSphere and share your passion with members around the world.
            </motion.p>
            {/* Info Box */}
            <motion.div
              variants={heroTextVariants}
              initial="hidden"
              animate="visible"
              className="bg-gray-800 bg-opacity-80 p-4 rounded-lg mb-6 text-sm md:text-lg max-w-md mx-auto"
            >
              <p>
                Before signing up, check out this{" "}
                <a href="#" className="text-teal-400 hover:underline">
                  Teacher Help Center
                </a>{" "}
                article, which will guide you through the sign-up process.
              </p>
            </motion.div>
            {/* Call-to-Action Button */}
            <motion.button
              variants={heroButtonVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              onClick={() => {
                setShowAuthForm(true);
                setIsLogin(false); // Open register form
              }}
              className="px-8 py-4 bg-teal-500 text-white font-semibold rounded-lg shadow-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 text-lg"
            >
              Sign Up to Teach
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Why Teach Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center mb-12"
      >
        <h2 className={`text-3xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Why Teach on SkillSphere?
        </h2>
        <p className={`text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
          When you help others along their creative journey, it’s rewarding in more ways than one.
        </p>
      </motion.div>

      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`text-5xl font-extrabold text-center mb-12 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
      >
        SkillSphere Community
      </motion.h1>

      {/* Search and Sorting */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto mb-8 flex flex-col sm:flex-row gap-4 items-center"
      >
        <div className="relative w-full sm:w-96">
          <motion.input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className={`w-full p-3 pl-10 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-white text-gray-900"}`}
            whileFocus={{ scale: 1.02 }}
          />
          <svg
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setSearchQuery("")}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full ${theme === "dark" ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
            >
              <XMarkIcon className="w-5 h-5" />
            </motion.button>
          )}
        </div>
        <div className={`relative w-64 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className={`w-full p-3 rounded-lg shadow-md appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 ${theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-white text-gray-900"}`}
          >
            {getUniqueTags().map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Posts Container */}
      <div className="max-w-3xl mx-auto">
        {loading ? (
          <p className={`text-center text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Loading posts...</p>
        ) : filteredPosts.length === 0 ? (
          <p className={`text-center text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>No posts found.</p>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            {filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                variants={cardVariants}
                whileHover="hover"
                className={`rounded-2xl shadow-xl p-6 backdrop-blur-md ${theme === "dark" ? "bg-gray-800/80" : "bg-white/80"} border ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
              >
                {post.images && (
                  <div className="mb-4 flex flex-wrap gap-3">
                    {post.images.split(",").map((imageUrl, index) => (
                      <motion.img
                        key={index}
                        src={`http://localhost:8080${imageUrl.trim()}`}
                        alt={`${post.title} image ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-lg shadow-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        onError={(e) => (e.target.src = "/fallback-image.jpg")}
                      />
                    ))}
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <h3 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"} mb-2`}>
                    {post.title}
                  </h3>
                  {user && user.id !== post.user?.id && (
                    <motion.button
                      onClick={() => handleFollowPost(post.id, post.user?.id)}
                      whileHover={{ scale: 1.1, boxShadow: "0 0 10px rgba(147, 51, 234, 0.5)" }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-purple-600 text-white px-4 py-1 rounded-full shadow-md"
                    >
                      Follow
                    </motion.button>
                  )}
                </div>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"} mb-3`}>
                  By: {post.user?.username || "Unknown"} • {new Date(post.createdAt).toLocaleDateString()}
                </p>
                <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"} mb-4`}>{post.content}</p>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-3`}>
                  Followers: {post.user?.followers?.length || 0}
                </p>
                {post.tags && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.split(",").map((tag, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`text-xs px-3 py-1 rounded-full ${theme === "dark" ? "bg-indigo-900 text-indigo-300" : "bg-indigo-100 text-indigo-800"}`}
                      >
                        {tag.trim()}
                      </motion.span>
                    ))}
                  </div>
                )}
                <div className="flex justify-between items-center border-t pt-4">
                  <div
                    className="relative"
                    onMouseEnter={() => setShowReactions(post.id)}
                    onMouseLeave={() => setShowReactions(null)}
                  >
                    <motion.button
                      className={`flex items-center gap-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                      whileHover={{ scale: 1.1 }}
                    >
                      <HandThumbUpIcon className="h-5 w-5" />
                      <span>{post.reactions?.length || 0}</span>
                    </motion.button>
                    <AnimatePresence>
                      {showReactions === post.id && user && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: -50 }}
                          exit={{ opacity: 0, y: 10 }}
                          className={`absolute flex gap-3 p-2 rounded-full shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}
                        >
                          <motion.button
                            onClick={() => handleReaction(post.id, "LIKE")}
                            whileHover={{ scale: 1.2 }}
                            className={`${hasUserReacted(post, "LIKE") ? "text-blue-500" : ""}`}
                          >
                            <HandThumbUpIcon className="h-6 w-6" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleReaction(post.id, "LOVE")}
                            whileHover={{ scale: 1.2 }}
                            className={`${hasUserReacted(post, "LOVE") ? "text-red-500" : ""}`}
                          >
                            <HeartIcon className="h-6 w-6" />
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Likes: {getReactionCount(post, "LIKE")}
                    </span>
                    <span className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Loves: {getReactionCount(post, "LOVE")}
                    </span>
                  </div>
                  <motion.button
                    onClick={() => toggleCommentSection(post.id)}
                    whileHover={{ scale: 1.1 }}
                    className={`flex items-center gap-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                  >
                    <ChatBubbleLeftIcon className="h-5 w-5" />
                    <span>{post.comments?.length || 0}</span>
                  </motion.button>
                  <div className="relative">
                    <motion.button
                      onClick={() => toggleShareOptions(post.id)}
                      whileHover={{ scale: 1.1 }}
                      className={`flex items-center gap-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                    >
                      <ShareIcon className="h-5 w-5" />
                      <span>Share</span>
                    </motion.button>
                    <AnimatePresence>
                      {showShareOptions === post.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: -70 }}
                          exit={{ opacity: 0, y: 10 }}
                          className={`absolute right-0 mt-2 p-3 rounded-lg shadow-xl backdrop-blur-md ${theme === "dark" ? "bg-gray-700/90 text-white" : "bg-white/90 text-gray-800"}`}
                        >
                          <motion.button
                            onClick={() => handleShare(post.id, "whatsapp")}
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-2 w-full text-left p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            <FaWhatsapp className="h-5 w-5 text-green-500" />
                            WhatsApp
                          </motion.button>
                          <motion.button
                            onClick={() => handleShare(post.id, "facebook")}
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-2 w-full text-left p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            <FaFacebook className="h-5 w-5 text-blue-600" />
                            Facebook
                          </motion.button>
                          <motion.button
                            onClick={() => handleShare(post.id, "copy")}
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-2 w-full text-left p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            <LinkIcon className="h-5 w-5" />
                            {copied ? "Copied!" : "Copy Link"}
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <AnimatePresence>
                  {activeCommentPostId === post.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6"
                    >
                      {post.comments?.map((comment) => (
                        <div key={comment.id} className="py-3 border-t flex gap-4">
                          <div className={`w-10 h-10 rounded-full ${theme === "dark" ? "bg-gray-600" : "bg-gray-300"}`} />
                          <div className="flex-1">
                            {editingCommentId === comment.id ? (
                              <div className="flex flex-col gap-3">
                                <textarea
                                  value={editedCommentText}
                                  onChange={(e) => setEditedCommentText(e.target.value)}
                                  className={`w-full p-3 rounded-lg ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"}`}
                                  rows={3}
                                />
                                <div className="flex gap-2">
                                  <motion.button
                                    onClick={() => handleCommentUpdate(post.id, comment.id)}
                                    whileHover={{ scale: 1.05 }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                                  >
                                    Update
                                  </motion.button>
                                  <motion.button
                                    onClick={() => setEditingCommentId(null)}
                                    whileHover={{ scale: 1.05 }}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg"
                                  >
                                    Cancel
                                  </motion.button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
                                  {comment.user?.username} • {new Date(comment.createdAt).toLocaleString()}
                                </p>
                                <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"} mt-1`}>
                                  {comment.text}
                                </p>
                                {user && String(user.id) === String(comment.user.id) && (
                                  <div className="flex gap-2 mt-2">
                                    <motion.button
                                      onClick={() => startEditingComment(comment)}
                                      whileHover={{ scale: 1.1 }}
                                      className={`p-2 rounded-full ${theme === "dark" ? "bg-gray-700 text-blue-400" : "bg-gray-200 text-blue-600"}`}
                                    >
                                      <PencilIcon className="h-5 w-5" />
                                    </motion.button>
                                    <motion.button
                                      onClick={() => handleCommentDelete(post.id, comment.id)}
                                      whileHover={{ scale: 1.1 }}
                                      className={`p-2 rounded-full ${theme === "dark" ? "bg-gray-700 text-red-400" : "bg-gray-200 text-red-600"}`}
                                    >
                                      <TrashIcon className="h-5 w-5" />
                                    </motion.button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      {user ? (
                        <div className="mt-4 flex gap-3 items-center">
                          <ChatBubbleLeftIcon className={`h-5 w-5 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />
                          <input
                            value={newComments[post.id] || ""}
                            onChange={(e) => setNewComments({ ...newComments, [post.id]: e.target.value })}
                            placeholder="Add a comment..."
                            className={`flex-1 p-3 rounded-lg ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"}`}
                          />
                          <motion.button
                            onClick={() => handleCommentSubmit(post.id)}
                            whileHover={{ scale: 1.05 }}
                            className="px-5 py-2 bg-indigo-600 text-white rounded-lg"
                          >
                            Post
                          </motion.button>
                        </div>
                      ) : (
                        <p className={`text-center text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          Please{" "}
                          <button
                            onClick={() => {
                              setShowAuthForm(true);
                              setIsLogin(true);
                            }}
                            className="text-purple-600 hover:text-purple-700"
                          >
                            login
                          </button>{" "}
                          to comment.
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Login/Register Popup */}
      <AnimatePresence>
        {showAuthForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`w-full max-w-md p-8 rounded-2xl shadow-2xl backdrop-blur-lg ${theme === "dark" ? "bg-gray-800/90 text-gray-200" : "bg-white/90 text-gray-900"}`}
            >
              <h2 className="text-3xl font-bold mb-6 text-center">
                {isLogin ? "Welcome Back" : "Join SkillSphere"}
              </h2>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-center mb-4"
                >
                  {error}
                </motion.p>
              )}
              <form onSubmit={handleAuthSubmit} className="space-y-6">
                <motion.input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className={`w-full p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}
                  whileFocus={{ scale: 1.02 }}
                  required
                />
                <motion.input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className={`w-full p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}
                  whileFocus={{ scale: 1.02 }}
                  required
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg shadow-md"
                >
                  {isLogin ? "Login" : "Register"}
                </motion.button>
              </form>
              <motion.button
                onClick={() => setShowAuthForm(false)}
                whileHover={{ scale: 1.05 }}
                className={`w-full mt-4 text-sm ${theme === "dark" ? "text-gray-400 hover:text-purple-300" : "text-gray-600 hover:text-purple-600"}`}
              >
                Cancel
              </motion.button>
              <motion.p
                className={`text-center mt-4 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              >
                {isLogin ? "Need an account?" : "Already have an account?"}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                  }}
                  className={`ml-1 ${theme === "dark" ? "text-purple-300 hover:text-purple-400" : "text-purple-600 hover:text-purple-700"}`}
                >
                  {isLogin ? "Register" : "Login"}
                </button>
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}