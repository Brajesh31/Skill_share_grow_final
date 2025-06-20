import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
//
function Footer() {
  const footerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.footer
      variants={footerVariants}
      initial="hidden"
      animate="visible"
      className="w-full bg-white dark:bg-gray-900 py-10 shadow-lg"
    >
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-6 md:mb-0 text-center md:text-left">
          <Link
            to="/"
            className="text-2xl font-bold text-purple-600 dark:text-purple-300"
          >
            SkillSphere
          </Link>
          <div className="flex space-x-6 mt-4 justify-center md:justify-start">
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link
                to="/"
                className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
              >
                Home
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link
                to="/learning-plan"
                className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
              >
                Learning Plans
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link
                to="/profile/user1"
                className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
              >
                Profile
              </Link>
            </motion.div>
          </div>
        </div>
        <div className="text-center md:text-right">
          <div className="flex justify-center md:justify-end space-x-6 mb-4">
            <motion.a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2 }}
              className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
            >
              <FaGithub size={24} />
            </motion.a>
            <motion.a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2 }}
              className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
            >
              <FaTwitter size={24} />
            </motion.a>
            <motion.a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2 }}
              className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
            >
              <FaLinkedin size={24} />
            </motion.a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} SkillSphere. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;