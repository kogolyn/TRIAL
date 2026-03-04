import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../config/api";

function RegisterForm() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [ambulanceId, setAmbulanceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  if (password !== confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  setLoading(true);

  try {
    await apiRequest("/users/signup", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        ambulanceId: role === "ambulance" ? ambulanceId.trim() : undefined,
      }),
    });
    alert("Registration successful! Please log in.");
    console.log("User registered successfully");
    navigate("/login");
  } catch (err) {
    setError(err.message || "Registration failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-blue-600 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-blue-600 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Enter your name"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-blue-600 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-blue-600 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Enter your email"
            required
          />
        </div>

        {/* Role select - full width */}
        <div>
          <label className="block text-sm font-medium text-blue-600 mb-2">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)} // simple update
            className="w-full px-4 py-3 border border-blue-600 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          >
            <option value="">Select your role</option>
            <option value="dispatcher">Dispatcher</option>
            <option value="ambulance">Ambulance Staff</option>
            <option value="medical">Medical Personnel</option>
          </select>
        </div>

        {role === "ambulance" && (
          <div>
            <label className="block text-sm font-medium text-blue-600 mb-2">
              Ambulance ID
            </label>
            <input
              type="text"
              value={ambulanceId}
              onChange={(e) => setAmbulanceId(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border border-blue-600 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="e.g. AMB-04"
              required
            />
          </div>
        )}

                {/* Password */}
        <div>
          <label className="block text-sm font-medium text-blue-600 mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-blue-600 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Enter your password"
            required
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-blue-600 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 border border-blue-600 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Confirm your password"
            required
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg font-semibold bg-blue-600 hover:bg-green-600 text-white transition disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}

export default RegisterForm;

