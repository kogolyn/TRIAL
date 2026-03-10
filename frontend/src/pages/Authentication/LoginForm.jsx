import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginForm({ setUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // added error state
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed. Check your credentials.");
      const loggedInUser = data.user;
      const token = data.token;
      console.log(`Login successful:`, loggedInUser);
 
      setError("");
      setSuccess("Login successful");
      setTimeout(() => setSuccess(""), 3000);

      // // 1. Save user to App state and LocalStorage
      setUser(loggedInUser);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      localStorage.setItem("token", token);

      // // 2. Navigate based on role
      const target =
        loggedInUser.role === "admin"
          ? "/admin"
          : loggedInUser.role === "dispatcher"
          ? "/dispatcher"
          : loggedInUser.role === "ambulance"
          ? "/ambulance"
          : "/dashboard";

      setTimeout(() => navigate(target), 800);
    } catch (err) {
      setSuccess("");
      setError(err.message || "Login failed. Check your credentials.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>} {/* display error */}

      <button
        type="submit"
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg cursor-pointer transition duration-200"
      >
        Sign In
      </button>

      {success && (
        <p className="text-green-600 text-sm mt-3 text-center">
          {success}
        </p>
      )}
    </form>
  );
}

export default LoginForm;
