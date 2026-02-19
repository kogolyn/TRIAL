import { useState } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    // Fake API simulation
    setTimeout(() => {
      if (email === 'test@example.com' && password === '123456') {
        setSuccess(true);
        setError('');
      } else {
        setError('Invalid email or password');
        setSuccess(false);
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      {/* Remember Me + Forgot Password */}
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-blue-600">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
            className="accent-blue-600"
          />
          Remember Me
        </label>
        <button
          type="button"
          className="text-blue-600 hover:text-green-600 font-semibold"
          onClick={() => alert('Forgot Password clicked!')}
        >
          Forgot Password?
        </button>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Success */}
      {success && <p className="text-sm text-green-600">Login successful!</p>}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg font-semibold bg-blue-600 hover:bg-green-600 text-white transition disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

export default LoginForm;
