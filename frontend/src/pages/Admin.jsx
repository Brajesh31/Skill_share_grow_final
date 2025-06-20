// src/pages/Admin.jsx
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";

export default function Admin() {
  const { user, theme } = useContext(AuthContext);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newPlan, setNewPlan] = useState({ name: "", description: "", price: "" });
  const [editingPlan, setEditingPlan] = useState(null);

  const fetchSubscriptionPlans = async () => {
    if (!user || !user.isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:8080/api/admin/subscription-plans", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSubscriptionPlans(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load subscription plans");
      console.error("Fetch plans error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionPlans();
  }, [user]);

  const validateDescription = (description) => {
    if (!description.trim()) return false;
    const features = description.split(",").map((f) => f.trim());
    return features.length > 0 && features.every((f) => f.length > 0);
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!user || !user.isAdmin) return;
    if (!newPlan.name.trim()) {
      setError("Plan name is required");
      return;
    }
    if (!validateDescription(newPlan.description)) {
      setError("Description must contain at least one valid feature (comma-separated)");
      return;
    }
    if (!newPlan.price || isNaN(newPlan.price) || parseFloat(newPlan.price) <= 0) {
      setError("Valid price is required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "http://localhost:8080/api/admin/subscription-plans",
        {
          name: newPlan.name,
          description: newPlan.description,
          price: parseFloat(newPlan.price),
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setSubscriptionPlans([...subscriptionPlans, response.data]);
      setNewPlan({ name: "", description: "", price: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create subscription plan");
      console.error("Create plan error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async (plan) => {
    if (!user || !user.isAdmin) return;
    if (!plan) {
      setError("No plan selected for update");
      return;
    }
    if (!plan.name.trim()) {
      setError("Plan name is required");
      return;
    }
    if (!validateDescription(plan.description)) {
      setError("Description must contain at least one valid feature (comma-separated)");
      return;
    }
    if (!plan.price || isNaN(plan.price) || parseFloat(plan.price) <= 0) {
      setError("Valid price is required");
      return;
    }
    setLoading(true);
    setError(null);
    const payload = {
      name: plan.name,
      description: plan.description,
      price: parseFloat(plan.price),
    };
    console.log("Updating plan with payload:", payload); // Debug log
    try {
      const response = await axios.put(
        `http://localhost:8080/api/admin/subscription-plans/${plan.id}`,
        payload,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setSubscriptionPlans(subscriptionPlans.map((p) => (p.id === plan.id ? response.data : p)));
      setEditingPlan(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to update subscription plan";
      setError(errorMessage);
      console.error("Update plan error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (id) => {
    if (!user || !user.isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`http://localhost:8080/api/admin/subscription-plans/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSubscriptionPlans(subscriptionPlans.filter((plan) => plan.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete subscription plan");
      console.error("Delete plan error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <div className={`min-h-screen py-12 px-6 ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}>
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-4xl font-bold mb-12 text-center ${theme === "dark" ? "text-white" : "text-gray-900"}`}
      >
        Admin - Manage Subscription Plans
      </motion.h1>

      <div className="max-w-4xl mx-auto">
        {loading && <p className={`text-center ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Loading...</p>}
        {error && <p className="text-center text-red-500 mb-6">{error}</p>}

        {/* Create Subscription Plan Form */}
        <form onSubmit={handleCreatePlan} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              value={newPlan.name}
              onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
              placeholder="Plan Name"
              className={`p-2 rounded ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"}`}
            />
            <input
              type="text"
              value={newPlan.description}
              onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
              placeholder="Description (comma-separated features)"
              className={`p-2 rounded ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"}`}
            />
            <input
              type="number"
              value={newPlan.price}
              onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
              placeholder="Price"
              step="0.01"
              className={`p-2 rounded ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"}`}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              disabled={loading}
            >
              Create
            </button>
          </div>
        </form>

        {/* Subscription Plans List */}
        <div className="space-y-4">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"} shadow-md`}
            >
              {editingPlan && editingPlan.id === plan.id ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    className={`p-2 rounded ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"}`}
                  />
                  <input
                    type="text"
                    value={editingPlan.description}
                    onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                    className={`p-2 rounded ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"}`}
                  />
                  <input
                    type="number"
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: e.target.value })}
                    step="0.01"
                    className={`p-2 rounded ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"}`}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdatePlan(editingPlan)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingPlan(null)}
                      className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <p className={`${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      Name: {plan.name} | Price: ${plan.price}
                    </p>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                      Description: {plan.features.join(", ")}
                    </p>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                      Created: {new Date(plan.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setEditingPlan({
                          id: plan.id,
                          name: plan.name,
                          description: plan.features.join(", "), // Join features for editing
                          price: plan.price,
                        })
                      }
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}