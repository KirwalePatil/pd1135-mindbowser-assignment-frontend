import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/axios';

export default function Dashboard() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchMyArticles = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Protected endpoint: GET /api/articles/my (JWT attached via Axios interceptor)
        const response = await api.get('/articles/my');
        if (!isMounted) return;
        setArticles(
          Array.isArray(response.data) ? response.data : response.data?.data || []
        );
      } catch (err) {
        if (!isMounted) return;
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          setError(
            'Your session has expired or you are not authorized. Please sign in again.'
          );
        } else {
          setError(err.response?.data?.message || 'Failed to load your articles.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMyArticles();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Your articles</h1>
          <Link
            to="/articles/new"
            className="inline-flex items-center justify-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
          >
            New article
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-600">
              Loading your articles…
            </div>
          ) : error ? (
            <div className="p-12 text-center text-sm text-red-600">{error}</div>
          ) : articles.length === 0 ? (
            <div className="p-12 text-center text-slate-600">
              <p>You haven&apos;t written any articles yet.</p>
              <Link
                to="/articles/new"
                className="mt-4 inline-block text-slate-800 font-medium hover:underline"
              >
                Create your first article
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-200">
              {articles.map((article) => (
                <li key={article.id}>
                  <Link
                    to={`/articles/${article.id}`}
                    className="block px-6 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-medium text-slate-900">
                      {article.title}
                    </span>
                    <span className="block text-sm text-slate-500 mt-0.5">
                      {article.createdAt
                        ? new Date(article.createdAt).toLocaleDateString()
                        : ''}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
