import { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";

function Notification() {
  const { notifications, theme } = useContext(AuthContext);

  return (
    <div className="fixed top-4 right-4 z-50">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`p-4 rounded-lg shadow-lg mb-2 ${
              theme === "dark"
                ? "bg-gray-700 text-gray-200"
                : "bg-white text-gray-900"
            }`}
          >
            {notification.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default Notification;