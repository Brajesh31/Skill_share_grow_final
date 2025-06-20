// src/pages/Subscriptions.jsx
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { motion } from "framer-motion";

export default function Subscriptions() {
  const { user, theme } = useContext(AuthContext);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubscriptionPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:8080/api/subscriptions/plans");
      setPlans(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load subscription plans");
      console.error("Fetch plans error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planName) => {
    if (!user) {
      alert("Please log in to select a plan.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "http://localhost:8080/api/subscriptions",
        { plan: planName },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert(`Successfully subscribed to ${planName}!`);
      console.log("Subscription response:", response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to subscribe to plan");
      console.error("Subscribe error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  return (
    <div className={`min-h-screen py-12 px-6 ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}>
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-4xl font-bold mb-4 text-center ${theme === "dark" ? "text-white" : "text-gray-900"}`}
      >
        Subscription Plans
      </motion.h1>
      <p className={`text-center mb-12 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
        Use hassle-free with our plans to enable unlimited, enhanced controls, and more features.
      </p>

      {loading && <p className={`text-center ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Loading...</p>}
      {error && <p className="text-center text-red-500 mb-6">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-lg shadow-lg ${
              theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            } border ${plan.name.toLowerCase() === "standard" ? "border-purple-500" : "border-gray-200"}`}
          >
            <h2 className="text-2xl font-semibold mb-2">{plan.name}</h2>
            <p className="text-3xl font-bold mb-4">
              ${plan.price} <span className="text-sm font-normal">Per Year</span>
            </p>
            <ul className="mb-6 space-y-2">
              {(plan.features || ["No features available"]).map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {feature.trim()}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSelectPlan(plan.name)}
              className={`w-full py-2 rounded-lg text-white ${
                plan.name.toLowerCase() === "standard"
                  ? "bg-gradient-to-r from-purple-500 to-blue-500"
                  : "bg-purple-600"
              } hover:bg-purple-700 transition-colors`}
              disabled={loading}
            >
              Select Plan
            </button>
          </motion.div>
        ))}
      </div>

      <p className={`text-center mt-12 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
        100% secure payment method with money-back guarantee.
      </p>
    </div>
  );
}