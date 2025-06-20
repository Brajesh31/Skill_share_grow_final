// api.js
import axios from "axios";

const API_URL = "http://localhost:8081/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.status || "No status", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

const getAuthHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

// ========== User API ==========
export const getUserProfile = async (userId) => {
  const response = await api.get(`/profile/${userId}`);
  return response.data || {};
};

export const followUser = async (userId, token) => {
  const response = await api.post(`/users/${userId}/follow`, {}, getAuthHeaders(token));
  return response.data;
};

export const unfollowUser = async (userId, token) => {
  const response = await api.post(`/users/${userId}/unfollow`, {}, getAuthHeaders(token));
  return response.data;
};

// ========== Post API ==========
export const getPosts = async (token) => {
  const response = await api.get("/posts", getAuthHeaders(token));
  return Array.isArray(response.data) ? response.data : [];
};

export const getPost = async (id) => {
  const response = await api.get(`/posts/${id}`);
  return response.data;
};

export const createPost = async (formData, token) => {
  const response = await api.post("/posts", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updatePost = async (postId, formData, token) => {
  const response = await api.put(`/posts/${postId}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deletePost = async (postId, token) => {
  await api.delete(`/posts/${postId}`, getAuthHeaders(token));
  return true;
};

export const commentOnPost = async (postId, text, token) => {
  const response = await api.post(`/posts/${postId}/comments`, { text }, getAuthHeaders(token));
  return response.data;
};

export const updateComment = async (postId, commentId, text, token) => {
  const response = await api.put(
    `/posts/${postId}/comments/${commentId}`,
    { text },
    getAuthHeaders(token)
  );
  return response.data;
};

export const deleteComment = async (commentId, token) => {
  await api.delete(`/comments/${commentId}`, getAuthHeaders(token));
  return true;
};

export const addReaction = async (postId, reactionType, token) => {
  const response = await api.post(
    `/posts/${postId}/reactions`,
    { reactionType },
    getAuthHeaders(token)
  );
  return response.data;
};

// ========== Learning Plan API ==========
export const createLearningPlan = async (data, token) => {
  const response = await api.post("/learning-plans", data, getAuthHeaders(token));
  return response.data.learningPlan;
};

export const getLearningPlans = async (token) => {
  const response = await api.get("/learning-plans", getAuthHeaders(token));
  return Array.isArray(response.data) ? response.data : [];
};

export const getAllLearningPlans = async (token, status = null) => {
  const params = status ? { status } : {};
  const response = await api.get("/learning-plans/all", {
    ...getAuthHeaders(token),
    params,
  });
  return Array.isArray(response.data) ? response.data : [];
};

export const updateLearningPlan = async (id, data, token) => {
  const response = await api.put(`/learning-plans/${id}`, data, getAuthHeaders(token));
  return response.data;
};

export const updateLearningPlanStatus = async (id, status, token) => {
  const response = await api.put(
    `/learning-plans/${id}/status`,
    { status },
    getAuthHeaders(token)
  );
  return response.data;
};

export const deleteLearningPlan = async (id, token) => {
  await api.delete(`/learning-plans/${id}`, getAuthHeaders(token));
  return true;
};

// ========== Upload API ==========
export const uploadImage = async (formData, token) => {
  const response = await api.post("/uploads", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
