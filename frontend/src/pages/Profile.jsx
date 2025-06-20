import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { getUserProfile, followUser, unfollowUser } from "../api";

function Profile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();
  const { user, addNotification, theme } = useContext(AuthContext);

  useEffect(() => {
    if (!userId || isNaN(userId)) {
      setError("Invalid user ID");
      navigate("/");
      return;
    }

    // Fetch user profile
    getUserProfile(userId)
      .then((res) => {
        setProfile(res);
        if (user && res.followers) {
          setIsFollowing(res.followers.some((f) => f.id === user.id));
        }
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
        navigate("/");
      });

    // Fetch notes
    fetchNotes();
  }, [userId, navigate, user]);

  const fetchNotes = async () => {
    try {
      const token = user?.token;
      if (!token) {
        setNotes([]);
        return;
      }
      const res = await axios.get(`http://localhost:8080/api/notes/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(res.data || []);
    } catch (err) {
      console.error("Error fetching notes:", err);
      setNotes([]);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      addNotification("Please log in to follow users.");
      navigate("/login");
      return;
    }
    try {
      if (isFollowing) {
        await unfollowUser(userId, user.token);
        setIsFollowing(false);
        setProfile((prev) => ({
          ...prev,
          followers: prev.followers.filter((f) => f.id !== user.id),
        }));
        addNotification(`Unfollowed ${profile?.username || "user"}.`);
      } else {
        const updatedProfile = await followUser(userId, user.token);
        setIsFollowing(true);
        setProfile(updatedProfile);
        addNotification(`Now following ${profile?.username || "user"}!`);
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
      addNotification("Failed to update follow status.");
    }
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (!user || user.id !== userId) {
      addNotification("You can only add notes to your own profile.");
      return;
    }
    try {
      const res = await axios.post(
        `http://localhost:8080/api/notes?userId=${userId}`,
        newNote,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setNotes([...notes, res.data]);
      setNewNote({ title: "", content: "" });
      addNotification("Note added successfully!");
    } catch (err) {
      console.error("Error adding note:", err);
      addNotification("Failed to add note.");
    }
  };

  if (error) {
    return (
      <div className="text-center p-6 text-red-500 text-xl font-semibold">
        {error}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center p-6 text-gray-500 text-xl font-semibold">
        Loading...
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { scale: 1.03, transition: { duration: 0.3 } },
  };

  return (
    <div
      className={`min-h-screen w-full ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      } transition-colors duration-300`}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto px-4 py-12"
      >
        {/* Profile Header */}
        <motion.div
          variants={itemVariants}
          className={`relative rounded-2xl shadow-xl p-8 backdrop-blur-lg ${
            theme === "dark" ? "bg-gray-800/80" : "bg-white/80"
          }`}
        >
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg"
            >
              {profile.username?.[0]?.toUpperCase() || "?"}
            </motion.div>
            <div className="flex-1 text-center md:text-left">
              <h1
                className={`text-3xl md:text-4xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {profile.username || "Unknown User"}
              </h1>
              <p
                className={`text-sm mt-1 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {profile.isAdmin ? "Admin" : "User"}
              </p>
              <p
                className={`text-sm mt-1 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Joined:{" "}
                {profile.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A"}
              </p>
              <div className="flex justify-center md:justify-start space-x-6 mt-4">
                <span
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Posts: {profile.posts?.length || 0}
                </span>
                <span
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Followers: {profile.followers?.length || 0}
                </span>
              </div>
            </div>
            {user && user.id !== userId && (
              <motion.button
                onClick={handleFollowToggle}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`absolute top-6 right-6 px-6 py-2 rounded-full shadow-lg text-white font-semibold ${
                  isFollowing
                    ? "bg-gray-500 hover:bg-gray-600"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Note Creation Form */}
        {user && user.id === userId && (
          <motion.div
            variants={itemVariants}
            className={`mt-8 rounded-2xl shadow-xl p-8 ${
              theme === "dark" ? "bg-gray-800/80" : "bg-white/80"
            }`}
          >
            <h2
              className={`text-2xl font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              } mb-6`}
            >
              Add a Note
            </h2>
            <form onSubmit={handleNoteSubmit} className="space-y-4">
              <motion.input
                type="text"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Note Title"
                className={`w-full p-3 rounded-lg border ${
                  theme === "dark"
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-100 text-gray-900 border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`}
                whileFocus={{ scale: 1.01 }}
                required
              />
              <motion.textarea
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Note Content"
                className={`w-full p-3 rounded-lg border ${
                  theme === "dark"
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-100 text-gray-900 border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`}
                rows="4"
                whileFocus={{ scale: 1.01 }}
                required
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
              >
                Add Note
              </motion.button>
            </form>
          </motion.div>
        )}

        {/* Notes Section */}
        <motion.div
          variants={itemVariants}
          className={`mt-8 rounded-2xl shadow-xl p-8 ${
            theme === "dark" ? "bg-gray-800/80" : "bg-white/80"
          }`}
        >
          <h2
            className={`text-2xl font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            } mb-6`}
          >
            Notes
          </h2>
          {notes.length > 0 ? (
            <div className="space-y-4">
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  variants={itemVariants}
                  whileHover="hover"
                  className={`p-4 rounded-lg ${
                    theme === "dark" ? "bg-gray-700/50" : "bg-gray-100/50"
                  }`}
                >
                  <h3
                    className={`text-lg font-semibold ${
                      theme === "dark" ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {note.title}
                  </h3>
                  <p
                    className={`mt-1 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {note.content}
                  </p>
                  <span
                    className={`text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Created: {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p
              className={`text-base ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              No notes yet.
            </p>
          )}
        </motion.div>

        {/* Posts Section */}
        <motion.div
          variants={itemVariants}
          className={`mt-8 rounded-2xl shadow-xl p-8 ${
            theme === "dark" ? "bg-gray-800/80" : "bg-white/80"
          }`}
        >
          <h2
            className={`text-2xl font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            } mb-6`}
          >
            Posts
          </h2>
          {profile.posts?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.posts.map((post) => (
                <motion.div
                  key={post.id}
                  variants={itemVariants}
                  whileHover="hover"
                  className={`p-4 rounded-lg ${
                    theme === "dark" ? "bg-gray-700/50" : "bg-gray-100/50"
                  } cursor-pointer`}
                  onClick={() => navigate(`/posts/${post.id}`)}
                >
                  {post.images && (
                    <img
                      src={`/uploads/${post.images}`}
                      alt={post.title}
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3
                    className={`text-lg font-semibold ${
                      theme === "dark" ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {post.title}
                  </h3>
                  <p
                    className={`mt-1 line-clamp-3 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {post.content}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span
                      className={`text-xs ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Likes: {post.likes || 0}
                    </span>
                    <span
                      className={`text-xs ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {post.createdAt
                        ? new Date(post.createdAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  {post.category && (
                    <span
                      className={`text-xs mt-1 inline-block ${
                        theme === "dark" ? "text-indigo-400" : "text-indigo-600"
                      }`}
                    >
                      {post.category}
                    </span>
                  )}
                  {post.tags && (
                    <div className="mt-1">
                      {post.tags.split(",").map((tag, index) => (
                        <span
                          key={index}
                          className={`text-xs mr-1 px-1 py-0.5 rounded ${
                            theme === "dark"
                              ? "bg-gray-600 text-gray-200"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <p
              className={`text-base ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              No posts yet.
            </p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Profile;