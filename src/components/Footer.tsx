
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full py-12 border-t border-white/10">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-gradient-custom w-8 h-8 flex items-center justify-center">
                <span className="font-bold text-white text-sm">IV</span>
              </div>
              <span className="font-bold text-lg">IdeaValidator</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              AI-powered startup validation and development platform.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Product</h3>
            <ul className="space-y-2 text-gray-500 dark:text-gray-400">
              <li>
                <Link to="/features" className="hover:text-primary">Features</Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-primary">Pricing</Link>
              </li>
              <li>
                <Link to="/testimonials" className="hover:text-primary">Testimonials</Link>
              </li>
              <li>
                <Link to="/roadmap" className="hover:text-primary">Roadmap</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-500 dark:text-gray-400">
              <li>
                <Link to="/blog" className="hover:text-primary">Blog</Link>
              </li>
              <li>
                <Link to="/guides" className="hover:text-primary">Startup Guides</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-primary">FAQ</Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-primary">Support</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Company</h3>
            <ul className="space-y-2 text-gray-500 dark:text-gray-400">
              <li>
                <Link to="/about" className="hover:text-primary">About Us</Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-primary">Careers</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © 2025 IdeaValidator. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-500 hover:text-primary">
              <span className="sr-only">Twitter</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </a>
            <a href="#" className="text-gray-500 hover:text-primary">
              <span className="sr-only">GitHub</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </a>
            <a href="#" className="text-gray-500 hover:text-primary">
              <span className="sr-only">LinkedIn</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
