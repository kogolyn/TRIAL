import { useState } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";

function RegisterForm() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [hospital, setHospital] = useState(''); // ✅ Added hospital state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hospitals = [
    "Kenyatta National Hospital",
    "Nakuru Level 5 Hospital",
    "Aga Khan Hospital",
    "MP Shah Hospital"
  ];

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  if (password !== confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  setLoading(true);

  try {
    await axios.post("http://localhost:5000/users/signup", {
      name,
      email,
      password,
      role,
    });
    alert("Registration successful! Please log in.");
    console.log("User registered successfully");
    navigate("/login");
  } catch (err) {
    setError(err.response?.data?.message || "Registration failed");
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

        {/* Hospital dropdown - smaller width
        {role === "medical" && (
          <div>
            <label className="block text-sm font-medium text-blue-600 mb-2">
              Hospital
            </label>
            <select
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              className="w-64 px-4 py-3 border border-blue-600 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            >
              <option value="">Select Hospital</option>
              {hospitals.map((h, index) => (
                <option key={index} value={h}>{h}</option>
              ))}
            </select>
          </div>
        )} */}

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
