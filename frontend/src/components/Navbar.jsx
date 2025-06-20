import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaUserCircle, FaSun, FaMoon } from "react-icons/fa";
import { motion } from "framer-motion";

function Navbar() {
  const { user, logout, theme, toggleTheme, setShowAuthForm, setIsLogin } =
    useContext(AuthContext);

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.nav
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className={`sticky top-0 z-50 w-full shadow-lg backdrop-blur-md ${
        theme === "dark" ? "bg-gray-900/80" : "bg-white/80"
      } border-b ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link
          to="/"
          className="text-3xl font-extrabold text-purple-600 dark:text-purple-300"
        >
          SkillSphere
        </Link>
        <div className="flex items-center space-x-8">
          <Link
            to="/"
            className={`text-lg ${
              theme === "dark"
                ? "text-gray-300 hover:text-purple-300"
                : "text-gray-700 hover:text-purple-600"
            } transition-colors`}
          >
            Home
          </Link>
          <Link
            to="/share-skills"
            className={`text-lg ${
              theme === "dark"
                ? "text-gray-300 hover:text-purple-300"
                : "text-gray-700 hover:text-purple-600"
            } transition-colors`}
          >
            Share Skills
          </Link>
          <Link
            to="/learning-plan"
            className={`text-lg ${
              theme === "dark"
                ? "text-gray-300 hover:text-purple-300"
                : "text-gray-700 hover:text-purple-600"
            } transition-colors`}
          >
            Learning Plans
          </Link>
          <Link
            to="/subscriptions"
            className={`text-lg ${
              theme === "dark"
                ? "text-gray-300 hover:text-purple-300"
                : "text-gray-700 hover:text-purple-600"
            } transition-colors`}
          >
            Subscriptions
          </Link>
          {user?.isAdmin && (
            <Link
              to="/admin"
              className={`text-lg ${
                theme === "dark"
                  ? "text-gray-300 hover:text-purple-300"
                  : "text-gray-700 hover:text-purple-600"
              } transition-colors`}
            >
              Admin
            </Link>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={toggleTheme}
            className={`p-2 rounded-full ${
              theme === "dark" ? "text-yellow-400" : "text-gray-800"
            }`}
          >
            {theme === "light" ? <FaMoon size={24} /> : <FaSun size={24} />}
          </motion.button>
          {user ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-4"
            >
              <Link
                to={`/profile/${user.id}`}
                className={`flex items-center space-x-2 ${
                  theme === "dark"
                    ? "text-gray-300 hover:text-purple-300"
                    : "text-gray-700 hover:text-purple-600"
                }`}
              >
                <FaUserCircle size={28} />
                <span className="text-lg">{user.username}</span>
              </Link>
              <motion.button
                onClick={logout}
                whileHover={{ scale: 1.05 }}
                className="bg-purple-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-purple-700 transition-colors"
              >
                Logout
              </motion.button>
            </motion.div>
          ) : (
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => {
                  setShowAuthForm(true);
                  setIsLogin(true);
                }}
                whileHover={{ scale: 1.05 }}
                className="bg-purple-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-purple-700 transition-colors"
              >
                Login
              </motion.button>
              <motion.button
                onClick={() => {
                  setShowAuthForm(true);
                  setIsLogin(false);
                }}
                whileHover={{ scale: 1.05 }}
                className={`${
                  theme === "dark"
                    ? "text-gray-300 hover:text-purple-300"
                    : "text-gray-700 hover:text-purple-600"
                } text-lg`}
              >
                Register
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;