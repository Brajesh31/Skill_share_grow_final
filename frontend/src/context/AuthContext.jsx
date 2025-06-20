import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    checkAuthStatus();
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found, user is not authenticated");
      setUser(null);
      return;
    }
    try {
      console.log("Checking auth status with token");
      const response = await axios.get("http://localhost:8081/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({
        id: response.data.userId,
        username: response.data.username,
        token,
        isAdmin: response.data.isAdmin || false,
        theme,
      });
      console.log("Auth status check successful:", response.data.username);
    } catch (error) {
      console.error("Auth check failed:", error.response?.data || error.message);
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const login = async (username, password) => {
    try {
      console.log("Attempting login for username:", username);
      const response = await axios.post("http://localhost:8081/api/auth/login", {
        username,
        password,
      });
      const { token, userId, username: loggedInUsername, isAdmin } = response.data;
      localStorage.setItem("token", token);
      setUser({
        id: userId,
        username: loggedInUsername,
        token,
        isAdmin: isAdmin || false,
        theme,
      });
      addNotification("Logged in successfully");
      setShowAuthForm(false);
      navigate(isAdmin ? "/admin" : `/profile/${userId}`);
      console.log("Login successful for:", loggedInUsername);
    } catch (error) {
      console.error("Login error:", error.response?.data, error.message);
      const errorMessage = error.response?.data?.message || "Login failed. Please check your credentials.";
      addNotification(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (username, password) => {
    try {
      console.log("Attempting registration for username:", username);
      const response = await axios.post("http://localhost:8081/api/auth/register", {
        username,
        password,
      });
      const { token, userId, username: registeredUsername } = response.data;
      localStorage.setItem("token", token);
      setUser({
        id: userId,
        username: registeredUsername,
        token,
        isAdmin: false,
        theme,
      });
      addNotification("Registered successfully");
      setShowAuthForm(false);
      navigate(`/profile/${userId}`);
      console.log("Registration successful for:", registeredUsername);
    } catch (error) {
      console.error("Registration error:", error.response?.data, error.message);
      const errorMessage = error.response?.data?.message || "Registration failed";
      addNotification(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    addNotification("Logged out successfully");
    navigate("/", { replace: true });
    console.log("User logged out");
  };

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";
      if (user) {
        setUser({ ...user, theme: newTheme });
      }
      return newTheme;
    });
  };

  const addNotification = (message) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        theme,
        toggleTheme,
        notifications,
        addNotification,
        showAuthForm,
        setShowAuthForm,
        isLogin,
        setIsLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};