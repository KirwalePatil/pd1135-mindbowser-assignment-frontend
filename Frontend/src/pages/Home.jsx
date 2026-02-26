import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/axios';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchArticles = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Public endpoint: GET /api/articles (no JWT required)
        const response = await api.get('/articles');
        if (!isMounted) return;
        setArticles(
          Array.isArray(response.data) ? response.data : response.data?.data || []
        );
      } catch (err) {
        if (!isMounted) return;
        setError(err.response?.data?.message || 'Failed to load articles.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchArticles();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight sm:text-5xl">
            Share knowledge, grow together
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            A place to write, read, and discover articles. Create an account to start sharing.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-slate-800 px-6 py-3 text-base font-medium text-white hover:bg-slate-700 transition-colors"
            >
              Get started
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
        <div className="mt-20">
          {isLoading ? (
            <div className="text-center text-slate-600">Loading articles…</div>
          ) : error ? (
            <div className="text-center text-sm text-red-600">{error}</div>
          ) : articles.length === 0 ? (
            <div className="text-center text-slate-600">
              No articles yet. Be the first to publish.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <article
                  key={article.id}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h2 className="text-lg font-semibold text-slate-900">
                    {article.title}
                  </h2>
                  <p className="mt-2 text-slate-600 text-sm line-clamp-2">
                    {article.excerpt || article.summary || article.content}
                  </p>
                  <Link
                    to={`/articles/${article.id}`}
                    className="mt-4 inline-block text-sm font-medium text-slate-800 hover:text-slate-600"
                  >
                    Read more →
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
