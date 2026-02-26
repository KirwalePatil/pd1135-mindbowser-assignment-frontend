import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/axios';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const derivedUsername = (name || email)?.split('@')[0] || '';

  const handleCheckUsername = async () => {
    const username = derivedUsername.trim();
    setUsernameError('');
    if (!username) return;

    try {
      setIsCheckingUsername(true);
      // Public helper endpoint: GET /api/auth/check-username?username=...
      // Backend should return something like { data: { available: boolean } }.
      const response = await api.get('/auth/check-username', {
        params: { username },
      });
      const available =
        response.data?.available ?? response.data?.data?.available;
      if (available === false) {
        setUsernameError('This username is already taken. Please choose another.');
      }
    } catch (err) {
      // If backend signals conflict (409), treat as taken.
      if (err.response?.status === 409) {
        setUsernameError('This username is already taken. Please choose another.');
      }
      // For other errors, fail silently; signup will still catch duplicates.
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (usernameError) return;
    setIsSubmitting(true);
    try {
      // Public auth endpoint: POST /api/auth/signup (no JWT required)
      // Map frontend \"Name\" field to backend `username`.
      await api.post('/auth/signup', {
        email,
        password,
        username: derivedUsername,
      });

      // After successful signup, log the user in via POST /api/auth/login
      // and store JWT through AuthContext (Axios interceptor attaches it).
      const response = await api.post('/auth/login', { email, password });
      const token = response.data?.data;
      const userData = { email, name: name || email.split('@')[0] };
      login(token, userData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.response?.status === 409) {
        setUsernameError(
          err.response?.data?.message ||
            'This username or email is already in use. Please choose another.'
        );
      } else {
        setError(err.response?.data?.message || 'Sign up failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-2xl font-bold text-slate-900 text-center">Create account</h1>
          <p className="mt-2 text-slate-600 text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-slate-800 hover:underline">
              Sign in
            </Link>
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleCheckUsername}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                placeholder="Your name"
              />
              {usernameError && (
                <p className="mt-1 text-xs text-red-600">{usernameError}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                placeholder="At least 6 characters"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-slate-800 py-2.5 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Creating account…' : 'Sign up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
