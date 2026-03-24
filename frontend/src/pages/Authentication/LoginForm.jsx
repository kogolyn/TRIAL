import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../config/api";

function LoginForm({ setUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mustReset, setMustReset] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [pendingUser, setPendingUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await apiRequest("/users/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const loggedInUser = data.user;
      const token = data.token;

      setError("");
      setSuccess("Login successful");
      setTimeout(() => setSuccess(""), 3000);

      setUser(loggedInUser);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      if (token) {
        localStorage.setItem("token", token);
      }

      if (loggedInUser.mustResetPassword) {
        setPendingUser(loggedInUser);
        setMustReset(true);
        return;
      }

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

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    if (resetPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (resetPassword !== resetConfirm) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await apiRequest("/users/me/password", {
        method: "PATCH",
        body: JSON.stringify({ newPassword: resetPassword }),
      });

      const updatedUser = { ...(pendingUser || {}), mustResetPassword: false };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setMustReset(false);

      const target =
        updatedUser.role === "admin"
          ? "/admin"
          : updatedUser.role === "dispatcher"
          ? "/dispatcher"
          : updatedUser.role === "ambulance"
          ? "/ambulance"
          : "/dashboard";

      navigate(target);
    } catch (err) {
      setError(err.message || "Failed to update password.");
    }
  };

  return (
    <form onSubmit={mustReset ? handleReset : handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          disabled={mustReset}
          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {!mustReset && (
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
      )}

      {mustReset && (
        <div className="mb-6 space-y-4">
          <div className="text-sm font-semibold text-gray-700">
            You must set a new password before continuing.
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              placeholder="Create a new password"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              value={resetConfirm}
              onChange={(e) => setResetConfirm(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      )}

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <button
        type="submit"
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg cursor-pointer transition duration-200"
      >
        {mustReset ? "Update Password" : "Sign In"}
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
