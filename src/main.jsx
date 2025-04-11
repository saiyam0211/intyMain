import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import "./index.css";
import App from "./App.jsx";

const clerk_key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerk_key) {
  throw new Error("Clerk Publishable Key was not found.");
}

// Determine if in development environment
const isDevelopment = window.location.hostname === 'localhost';

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ClerkProvider 
      publishableKey={clerk_key}
      routing="path"
      signInUrl="/login"
      signUpUrl="/signup"
      // Use Clerk's default frontend API configuration without domain overrides
      // This will use api.clerk.dev instead of clerk.inty.in
    >
      <App />
    </ClerkProvider>
  </BrowserRouter>
);