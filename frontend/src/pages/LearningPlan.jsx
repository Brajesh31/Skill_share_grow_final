import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { createLearningPlan, getAllLearningPlans, updateLearningPlan, updateLearningPlanStatus, deleteLearningPlan, uploadImage } from "../api";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon, XMarkIcon, ChevronDownIcon, EyeSlashIcon, FlagIcon, PlayIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
//
const placeholderThumbnails = [
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521747116042-5a8107731e2e?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop",
];

const defaultThumbnail = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop";

export default function LearningPlan() {
  const { user, theme, logout, setShowAuthForm, setIsLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [learningPlans, setLearningPlans] = useState([]);
  const [allLearningPlans, setAllLearningPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showAllPlansModal, setShowAllPlansModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    thumbnailUrl: "",
    status: "NOT_STARTED",
    thumbnailFile: null,
  });
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [sortBy, setSortBy] = useState("Newest");
  const [filterBy, setFilterBy] = useState("all"); // Default to all plans
  const [hiddenPlans, setHiddenPlans] = useState(new Set());

  const fetchLearningPlans = async () => {
    setLoading(true);
    try {
      if (!user?.token) {
        throw new Error("Please log in to view learning plans");
      }
      const status = filterBy === "in-progress" ? "IN_PROGRESS" : null;
      const plans = await getAllLearningPlans(user.token, status);
      setLearningPlans(sortLearningPlans(plans, sortBy));
      console.log("Fetched learning plans for main view:", plans);
    } catch (err) {
      console.error("Failed to load learning plans:", err);
      if (err.response && err.response.status === 401) {
        logout();
        setShowAuthForm(true);
        setIsLogin(true);
        setError("Session expired. Please log in again.");
      } else {
        setError("Failed to load learning plans. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLearningPlans = async () => {
    try {
      if (!user?.token) {
        throw new Error("Please log in to view all learning plans");
      }
      const plans = await getAllLearningPlans(user.token, "IN_PROGRESS");
      setAllLearningPlans(plans);
      setShowAllPlansModal(true);
      console.log("Fetched all in-progress plans for modal:", plans);
    } catch (err) {
      console.error("Failed to load all learning plans:", err);
      if (err.response && err.response.status === 401) {
        logout();
        setShowAuthForm(true);
        setIsLogin(true);
        setError("Session expired. Please log in again.");
      } else {
        setError("Failed to load all learning plans. Please try again.");
      }
    }
  };

  const sortLearningPlans = (plans, sortBy) => {
    return [...plans].sort((a, b) => {
      if (sortBy === "Newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === "Oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === "Title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  };

  useEffect(() => {
    if (!user) {
      setLearningPlans([]);
      return;
    }
    let isMounted = true;
    fetchLearningPlans().then(() => {
      if (isMounted) console.log("Fetch completed");
    });
    return () => {
      isMounted = false;
    };
  }, [user?.id, filterBy]);

  useEffect(() => {
    setLearningPlans((prevPlans) => sortLearningPlans(prevPlans, sortBy));
  }, [sortBy]);

  const validateImageUrl = (url) => {
    if (!url) return true;
    const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp)$/i;
    const isValidProtocol = /^https?:\/\//i.test(url);
    return isValidProtocol && imageExtensions.test(url);
  };

  const handleImageLoad = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid image file (JPEG, PNG, GIF, WEBP)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image file size must be less than 5MB");
        return;
      }
      setFormData({ ...formData, thumbnailFile: file, thumbnailUrl: "" });
      setThumbnailPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowAuthForm(true);
      setIsLogin(true);
      setEditingPlan(null);
      return;
    }

    try {
      let thumbnailUrl = formData.thumbnailUrl;
      if (formData.thumbnailFile) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", formData.thumbnailFile);
        const response = await uploadImage(formDataUpload, user.token);
        thumbnailUrl = response.url;
      } else if (thumbnailUrl) {
        if (!validateImageUrl(thumbnailUrl)) {
          setError("Please provide a valid image URL (e.g., ending with .jpg, .png, etc.)");
          return;
        }
        const isImageValid = await handleImageLoad(thumbnailUrl);
        if (!isImageValid) {
          setError("The provided URL does not point to a valid image");
          return;
        }
      } else {
        thumbnailUrl = placeholderThumbnails[Math.floor(Math.random() * placeholderThumbnails.length)];
      }

      const data = {
        title: formData.title,
        description: formData.description,
        duration: formData.duration ? parseInt(formData.duration) : null,
        thumbnailUrl,
        status: "NOT_STARTED",
      };

      if (!data.title) {
        setError("Title is required");
        return;
      }

      if (editingPlan) {
        const updatedPlan = await updateLearningPlan(editingPlan.id, data, user.token);
        setLearningPlans(learningPlans.map((plan) => (plan.id === updatedPlan.id ? updatedPlan : plan)));
        setEditingPlan(null);
      } else {
        const newPlan = await createLearningPlan(data, user.token);
        console.log("New plan created:", newPlan);
        setLearningPlans([...learningPlans, newPlan]);
      }
      setFormData({ title: "", description: "", duration: "", thumbnailUrl: "", status: "NOT_STARTED", thumbnailFile: null });
      setThumbnailPreview("");
      setShowForm(false);
      setError("");
      await fetchLearningPlans();
    } catch (err) {
      console.error("Failed to save learning plan:", err);
      if (err.response && err.response.status === 401) {
        logout();
        setShowAuthForm(true);
        setIsLogin(true);
        setError("Session expired. Please log in again.");
      } else if (err.response && err.response.status === 500) {
        setError("Server error: " + (err.response.data.message || "Failed to save learning plan. Please try again."));
      } else {
        setError("Failed to save learning plan: " + err.message);
      }
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title,
      description: plan.description,
      duration: plan.duration ? plan.duration.toString() : "",
      thumbnailUrl: plan.thumbnailUrl,
      status: plan.status,
      thumbnailFile: null,
    });
    setThumbnailPreview(plan.thumbnailUrl || defaultThumbnail);
    setShowForm(true);
    setActiveDropdown(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteLearningPlan(id, user.token);
      setLearningPlans(learningPlans.filter((plan) => plan.id !== id));
      setActiveDropdown(null);
      await fetchLearningPlans();
    } catch (err) {
      console.error("Failed to delete learning plan:", err);
      if (err.response && err.response.status === 401) {
        logout();
        setShowAuthForm(true);
        setIsLogin(true);
        setError("Session expired. Please log in again.");
      } else {
        setError("Failed to delete learning plan. Please try again.");
      }
    }
  };

  const handleLaunch = async (plan) => {
    try {
      const updatedPlan = await updateLearningPlanStatus(plan.id, "IN_PROGRESS", user.token);
      setLearningPlans(learningPlans.map((p) => (p.id === plan.id ? updatedPlan : p)));
      await fetchLearningPlans();
      await fetchAllLearningPlans();
    } catch (err) {
      console.error("Failed to launch learning plan:", err);
      if (err.response && err.response.status === 401) {
        logout();
        setShowAuthForm(true);
        setIsLogin(true);
        setError("Session expired. Please log in again.");
      } else {
        setError("Failed to launch learning plan. Please try again.");
      }
    }
  };

  const handleHide = (planId) => {
    setHiddenPlans((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(planId)) {
        newSet.delete(planId);
      } else {
        newSet.add(planId);
      }
      return newSet;
    });
    setActiveDropdown(null);
  };

  const handleMarkAsOutdated = async (plan) => {
    try {
      const updatedPlan = await updateLearningPlanStatus(plan.id, "COMPLETED", user.token);
      setLearningPlans(learningPlans.map((p) => (p.id === plan.id ? updatedPlan : p)));
      setActiveDropdown(null);
      await fetchLearningPlans();
    } catch (err) {
      console.error("Failed to mark learning plan as outdated:", err);
      if (err.response && err.response.status === 401) {
        logout();
        setShowAuthForm(true);
        setIsLogin(true);
        setError("Session expired. Please log in again.");
      } else {
        setError("Failed to mark learning plan as outdated. Please try again.");
      }
    }
  };

  const toggleDropdown = (planId) => {
    setActiveDropdown(activeDropdown === planId ? null : planId);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    hover: { scale: 1.05, transition: { duration: 0.3 } },
    launch: { scale: 1.1, opacity: 0.8, transition: { duration: 0.5 } },
  };

  const formVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } },
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            Learning Plans ({learningPlans.length - hiddenPlans.size} items)
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowForm(true);
              setEditingPlan(null);
              setFormData({ title: "", description: "", duration: "", thumbnailUrl: "", status: "NOT_STARTED", thumbnailFile: null });
              setThumbnailPreview("");
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            disabled={!user}
          >
            <PlusIcon className="h-5 w-5" />
            Add Learning Plan
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchAllLearningPlans}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            disabled={!user}
          >
            View All In-Progress Plans
          </motion.button>
        </div>
        <div className="flex items-center gap-4">
          <div className={`relative ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className={`p-2 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-white text-gray-700"}`}
            >
              <option value="all">All Plans</option>
              <option value="in-progress">In-Progress Plans</option>
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" />
          </div>
          <div className={`relative ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`p-2 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-white text-gray-700"}`}
            >
              <option value="Newest">Newest to Oldest</option>
              <option value="Oldest">Oldest to Newest</option>
              <option value="Title">Sort By Title</option>
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" />
          </div>
        </div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 mb-4"
        >
          {error}
        </motion.p>
      )}

      {loading ? (
        <p className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Loading...</p>
      ) : learningPlans.length === 0 ? (
        <p className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>No learning plans found.</p>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {learningPlans
            .filter((plan) => !hiddenPlans.has(plan.id))
            .map((plan) => (
              <motion.div
                key={plan.id}
                variants={cardVariants}
                whileHover="hover"
                className={`relative rounded-lg shadow-md overflow-hidden ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
              >
                <div className="relative h-40">
                  <img
                    src={plan.thumbnailUrl || defaultThumbnail}
                    alt={plan.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <motion.button
                      onClick={() => toggleDropdown(plan.id)}
                      whileHover={{ scale: 1.1 }}
                      className={`p-2 rounded-full ${theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-white text-gray-700"} shadow-md`}
                      aria-label="More options"
                    >
                      <ChevronDownIcon className="h-5 w-5" />
                    </motion.button>
                    <AnimatePresence>
                      {activeDropdown === plan.id && (
                        <motion.div
                          variants={dropdownVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-10 ${theme === "dark" ? "bg-gray-700 text-gray-200" : "bg-white text-gray-800"}`}
                        >
                          <button
                            onClick={() => handleHide(plan.id)}
                            className={`block w-full text-left px-4 py-2 text-sm ${theme === "dark" ? "hover:bg-gray-600" : "hover:bg-gray-100"} flex items-center gap-2`}
                          >
                            <EyeSlashIcon className="h-4 w-4" />
                            {hiddenPlans.has(plan.id) ? "Unhide" : "Hide"}
                          </button>
                          <button
                            onClick={() => handleMarkAsOutdated(plan)}
                            className={`block w-full text-left px-4 py-2 text-sm ${theme === "dark" ? "hover:bg-gray-600" : "hover:bg-gray-100"} flex items-center gap-2`}
                            disabled={plan.userId !== user?.id}
                          >
                            <FlagIcon className="h-4 w-4" />
                            Mark as Outdated
                          </button>
                          <button
                            onClick={() => handleEdit(plan)}
                            className={`block w-full text-left px-4 py-2 text-sm ${theme === "dark" ? "hover:bg-gray-600" : "hover:bg-gray-100"} flex items-center gap-2`}
                            disabled={plan.userId !== user?.id}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(plan.id)}
                            className={`block w-full text-left px-4 py-2 text-sm text-red-500 ${theme === "dark" ? "hover:bg-gray-600" : "hover:bg-gray-100"} flex items-center gap-2`}
                            disabled={plan.userId !== user?.id}
                          >
                            Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className={`text-lg font-medium ${theme === "dark" ? "text-white" : "text-gray-900"} truncate`}>{plan.title}</h3>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>E-Learning</p>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    {plan.status === "NOT_STARTED" ? "Not Started" : plan.status === "IN_PROGRESS" ? "In Progress" : "Completed"}
                  </p>
                  {plan.duration && (
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Duration: {plan.duration} minutes</p>
                  )}
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Created by User ID: {plan.userId}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleLaunch(plan)}
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    variants={cardVariants}
                    animate={plan.status === "IN_PROGRESS" ? "launch" : "visible"}
                    disabled={plan.userId !== user?.id}
                  >
                    <PlayIcon className="h-5 w-5" />
                    Launch
                  </motion.button>
                </div>
              </motion.div>
            ))}
        </motion.div>
      )}

      <AnimatePresence>
        {showForm && (
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
              className={`w-full max-w-md p-8 rounded-2xl shadow-2xl ${theme === "dark" ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"}`}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{editingPlan ? "Edit Learning Plan" : "Create Learning Plan"}</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => {
                    setShowForm(false);
                    setThumbnailPreview("");
                  }}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </motion.button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Plan Title"
                  className={`w-full p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  whileFocus={{ scale: 1.02 }}
                  required
                />
                <motion.textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Plan Description"
                  className={`w-full p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  rows={4}
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="Duration (minutes)"
                  className={`w-full p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  whileFocus={{ scale: 1.02 }}
                  min="1"
                />
                <motion.input
                  type="text"
                  value={formData.thumbnailUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, thumbnailUrl: e.target.value, thumbnailFile: null });
                    setThumbnailPreview(e.target.value);
                  }}
                  placeholder="Thumbnail URL (optional, e.g., ending with .jpg, .png)"
                  className={`w-full p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                  className={`w-full p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  whileFocus={{ scale: 1.02 }}
                />
                {thumbnailPreview && (
                  <div className="mt-2">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail Preview"
                      className="w-32 h-32 object-cover rounded-lg"
                      onError={() => setThumbnailPreview(defaultThumbnail)}
                    />
                  </div>
                )}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg shadow-md"
                >
                  {editingPlan ? "Update Plan" : "Create Plan"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAllPlansModal && (
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
              className={`w-full max-w-4xl p-8 rounded-2xl shadow-2xl ${theme === "dark" ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"}`}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">In-Progress Learning Plans</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setShowAllPlansModal(false)}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </motion.button>
              </div>
              {allLearningPlans.length === 0 ? (
                <p className="text-lg">No in-progress learning plans available.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto">
                  {allLearningPlans.map((plan) => (
                    <motion.div
                      key={plan.id}
                      variants={cardVariants}
                      whileHover="hover"
                      className={`relative rounded-lg shadow-md overflow-hidden ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} cursor-pointer`}
                      onClick={() => navigate(`/learning-plan/${plan.id}`)}
                    >
                      <div className="relative h-40">
                        <img
                          src={plan.thumbnailUrl || defaultThumbnail}
                          alt={plan.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className={`text-lg font-medium ${theme === "dark" ? "text-white" : "text-gray-900"} truncate`}>{plan.title}</h3>
                        <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>E-Learning</p>
                        <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          {plan.status === "NOT_STARTED" ? "Not Started" : plan.status === "IN_PROGRESS" ? "In Progress" : "Completed"}
                        </p>
                        {plan.duration && (
                          <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Duration: {plan.duration} minutes</p>
                        )}
                        <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Created by User ID: {plan.userId}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}