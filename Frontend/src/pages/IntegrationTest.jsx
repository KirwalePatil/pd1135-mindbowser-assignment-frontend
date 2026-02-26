import { useState } from 'react';
import { api } from '../api/axios';
import { useAuth } from '../context/AuthContext';

/*
  IntegrationTest page instructions for developers:
  - Network requests hit backend:
      Open DevTools → Network tab, click each test button, and verify
      requests go to VITE_API_BASE_URL endpoints (e.g. http://localhost:8080/api/...).
  - JWT stored in localStorage:
      After a successful Login Test, open DevTools → Application →
      Local Storage and confirm the `knowledge_platform_jwt` key exists.
  - Protected routes require auth:
      From the main app, try visiting /dashboard while logged out,
      confirm you are redirected to /login; log in, then /dashboard loads.
  - Public routes work without JWT:
      Run Public API Test both logged in and logged out; it should succeed
      without requiring a token if the backend endpoint is public.
  - 401 triggers logout:
      If the backend returns 401 for any protected call, the shared Axios
      interceptor clears auth, dispatches the `auth:logout` event, and you
      should lose access to protected routes in the main app.
*/

export default function IntegrationTest() {
  const { login, logout } = useAuth();

  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isProtectedLoading, setIsProtectedLoading] = useState(false);
  const [isPublicLoading, setIsPublicLoading] = useState(false);

  const [result, setResult] = useState(null);

  const setResultFromResponse = (source, label, response) => {
    setResult({
      source,
      ok: true,
      status: response.status,
      label,
      data: response.data,
      error: null,
    });
  };

  const setResultFromError = (source, label, error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      (status === 401 ? 'Unauthorized (401) from backend.' : 'Request failed.');

    setResult({
      source,
      ok: false,
      status,
      label,
      data: error.response?.data ?? null,
      error: message,
    });
  };

  // Login Test: calls /auth/login with hardcoded credentials and stores JWT via AuthContext.
  const handleLoginTest = async () => {
    setIsLoginLoading(true);
    setResult(null);
    try {
      const email = 'test@example.com';
      const password = 'password123';
      const response = await api.post('/auth/login', { email, password });
      const token = response.data?.data;
      const userData = { email };
      login(token, userData);
      setResultFromResponse('login', 'Login Test', response);
    } catch (error) {
      setResultFromError('login', 'Login Test', error);
    } finally {
      setIsLoginLoading(false);
    }
  };

  // Protected API Test: calls a JWT-protected endpoint with current token.
  const handleProtectedTest = async () => {
    setIsProtectedLoading(true);
    setResult(null);
    try {
      const response = await api.get('/articles/my');
      setResultFromResponse('protected', 'Protected API Test (/articles/my)', response);
    } catch (error) {
      setResultFromError('protected', 'Protected API Test (/articles/my)', error);
    } finally {
      setIsProtectedLoading(false);
    }
  };

  // Public API Test: calls a public endpoint that should work without JWT.
  const handlePublicTest = async () => {
    setIsPublicLoading(true);
    setResult(null);
    try {
      const response = await api.get('/articles');
      setResultFromResponse('public', 'Public API Test (/articles)', response);
    } catch (error) {
      setResultFromError('public', 'Public API Test (/articles)', error);
    } finally {
      setIsPublicLoading(false);
    }
  };

  // Logout: clears AuthContext and localStorage via existing logout logic.
  const handleLogout = () => {
    logout();
    setResult({
      source: 'logout',
      ok: true,
      status: null,
      label: 'Logout',
      data: { message: 'Logout invoked via AuthContext.' },
      error: null,
    });
  };

  const renderSpinner = () => (
    <span className="ml-2 inline-flex h-4 w-4 items-center justify-center">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
    </span>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Integration Test: Frontend ↔ Backend
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Use this page in development to manually verify JWT-based auth and API
              integration with the Spring Boot backend.
            </p>
          </div>

          <div className="space-y-3">
            {/* Login Test: verifies /auth/login works and JWT is stored via AuthContext. */}
            <button
              type="button"
              onClick={handleLoginTest}
              disabled={isLoginLoading}
              className="w-full rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <span>Login Test (POST /auth/login)</span>
              {isLoginLoading && renderSpinner()}
            </button>

            {/* Protected API Test: verifies current JWT allows access to protected resources. */}
            <button
              type="button"
              onClick={handleProtectedTest}
              disabled={isProtectedLoading}
              className="w-full rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <span>Protected API Test (GET /articles/my)</span>
              {isProtectedLoading && renderSpinner()}
            </button>

            {/* Public API Test: verifies public endpoints work regardless of auth state. */}
            <button
              type="button"
              onClick={handlePublicTest}
              disabled={isPublicLoading}
              className="w-full rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <span>Public API Test (GET /articles)</span>
              {isPublicLoading && renderSpinner()}
            </button>

            {/* Logout: verifies clearing JWT and AuthContext works as expected. */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 flex items-center justify-center"
            >
              Logout (clear AuthContext + storage)
            </button>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h2 className="text-sm font-semibold text-slate-900 pb-2">
              Latest result
            </h2>
            <div className="rounded-lg bg-slate-950 text-slate-50 text-xs p-3 font-mono overflow-x-auto max-h-64 overflow-y-auto">
              {result ? (
                <pre className="whitespace-pre-wrap break-words">
                  {JSON.stringify(result, null, 2)}
                </pre>
              ) : (
                <span className="text-slate-400">
                  Run one of the tests above to see the response payload and status.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

