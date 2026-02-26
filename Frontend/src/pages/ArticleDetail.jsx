import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/axios';

export default function ArticleDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchArticle = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Public endpoint: GET /api/articles/:id (reading a single article, no JWT required)
        const response = await api.get(`/articles/${id}`);
        if (!isMounted) return;
        const data = response.data?.data || response.data;
        setArticle(data);
      } catch (err) {
        if (!isMounted) return;
        if (err.response?.status === 404) {
          setError('Article not found.');
        } else {
          setError(err.response?.data?.message || 'Failed to load article.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchArticle();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/"
          className="text-slate-600 hover:text-slate-900 text-sm font-medium mb-6 inline-block"
        >
          ← Back to Home
        </Link>
        {isLoading ? (
          <div className="text-slate-600">Loading article…</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : !article ? (
          <div className="text-slate-600">No article to display.</div>
        ) : (
          <>
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {article.title}
              </h1>
              <p className="mt-2 text-slate-600 text-sm">
                by {article.author || 'Unknown author'} ·
                {article.createdAt
                  ? ` ${new Date(article.createdAt).toLocaleDateString()}`
                  : ''}
              </p>
            </header>
            <div className="prose prose-slate max-w-none text-slate-700">
              {article.content}
            </div>
            <div className="mt-8 pt-6 border-t border-slate-200">
              <Link
                to={`/articles/${id}/edit`}
                className="text-slate-800 font-medium hover:text-slate-600"
              >
                Edit article
              </Link>
            </div>
          </>
        )}
      </article>
    </div>
  );
}
