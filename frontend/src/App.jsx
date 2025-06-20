// src/App.jsx
import { Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Profile from "./pages/Profile.jsx";
import LearningPlan from "./pages/LearningPlan.jsx";
import PostDetails from "./pages/PostDetails.jsx";
import Subscriptions from "./pages/Subscriptions.jsx";
import Admin from "./pages/Admin.jsx";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext.jsx";
import ShareSkills from "./pages/ShareSkills";
import LearningPlanDetail from "./pages/LearningPlanDetail.jsx"; 

const Quiz = () => <div className="p-4">Quiz Page (To Be Implemented)</div>;
const Timeline = () => <div className="p-4">Timeline Page (To Be Implemented)</div>;

function App() {
  const { notifications } = useContext(AuthContext);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-lightBg to-gray-200 dark:from-darkBg dark:to-gray-800">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/share-skills" element={<ShareSkills />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/post/:postId" element={<PostDetails />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/learning-plan" element={<LearningPlan />} />
          <Route path="/learning-plan/:id" element={<LearningPlanDetail />} />
        </Routes>
      </main>
      <Footer />
      <div className="fixed bottom-4 right-4 space-y-2">
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-accent text-white p-3 rounded-lg shadow-lg"
          >
            {notif.message}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default App;