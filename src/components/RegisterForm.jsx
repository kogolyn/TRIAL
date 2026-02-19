import { useState } from 'react';



function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [hospital, setHospital] = useState('');
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
    console.log({ name, email, password, role });
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div>
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div>
        <label className="block text-sm font-medium text-blue-600 mb-2">
          Role
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-4 py-3 border border-blue-600 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        >
        
          <option value="">Select your role</option>
          <option value="dispatcher">Dispatcher</option>
          <option value="ambulance">Ambulance Staff</option>
          <option value="medical">Medical Personnel</option>
        </select>
      </div>

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

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

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
