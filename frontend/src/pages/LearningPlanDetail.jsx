import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { getLearningPlans, updateLearningPlanStatus } from "../api";
import { motion } from "framer-motion";

const defaultThumbnail = "https://via.placeholder.com/150?text=No+Image";

export default function LearningPlanDetail() {
  const { id } = useParams();
  const { user, theme, logout, setShowAuthForm, setIsLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPlan = async () => {
    setLoading(true);
    try {
      if (!user?.token) {
        throw new Error("Please log in to view this learning plan");
      }
      const plans = await getLearningPlans(user.token);
      const selectedPlan = plans.find((p) => p.id === parseInt(id));
      if (!selectedPlan) {
        throw new Error("Learning plan not found");
      }
      setPlan(selectedPlan);
    } catch (err) {
      console.error("Failed to load learning plan:", err);
      if (err.response && err.response.status === 401) {
        logout();
        setShowAuthForm(true);
        setIsLogin(true);
        setError("Session expired. Please log in again.");
      } else {
        setError("Failed to load learning plan. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPlan();
    }
  }, [user, id]);

  const handleStatusUpdate = async (status) => {
    try {
      const updatedPlan = await updateLearningPlanStatus(plan.id, status, user.token);
      setPlan(updatedPlan);
    } catch (err) {
      console.error("Failed to update learning plan status:", err);
      if (err.response && err.response.status === 401) {
        logout();
        setShowAuthForm(true);
        setIsLogin(true);
        setError("Session expired. Please log in again.");
      } else {
        setError("Failed to update learning plan status. Please try again.");
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Loading...</p>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500">{error || "Learning plan not found."}</p>
        <button
          onClick={() => navigate("/learning-plan")}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Back to Learning Plans
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`max-w-2xl mx-auto p-6 rounded-lg shadow-md ${theme === "dark" ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"}`}
      >
        <button
          onClick={() => navigate("/learning-plan")}
          className="mb-4 bg-gray-500 text-white px-4 py-2 rounded-lg"
        >
          Back to Learning Plans
        </button>
        <div className="flex flex-col items-center">
          <img
            src={plan.thumbnailUrl || defaultThumbnail}
            alt={plan.title}
            className="w-full h-60 object-cover rounded-lg mb-4"
          />
          <h1 className="text-3xl font-bold mb-2">{plan.title}</h1>
          <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-2`}>E-Learning</p>
          <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-2`}>
            Status: {plan.status === "NOT_STARTED" ? "Not Started" : plan.status === "IN_PROGRESS" ? "In Progress" : "Completed"}
          </p>
          {plan.duration && (
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-2`}>
              Duration: {plan.duration} minutes
            </p>
          )}
          <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-4`}>
            Created by User ID: {plan.userId}
          </p>
          <div className="prose max-w-none mb-4">
            <p>{plan.description || "No description available."}</p>
          </div>
          <div className="flex gap-4">
            {plan.status === "NOT_STARTED" && (
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => handleStatusUpdate("IN_PROGRESS")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Start Studying
              </motion.button>
            )}
            {plan.status === "IN_PROGRESS" && (
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => handleStatusUpdate("COMPLETED")}
                className="bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Mark as Completed
              </motion.button>
            )}
            {plan.status === "COMPLETED" && (
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => handleStatusUpdate("NOT_STARTED")}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                Restart
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}