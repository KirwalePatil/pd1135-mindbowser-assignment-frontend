import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/axios';

export default function CreateEditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;

    let isMounted = true;
    const fetchArticle = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Public endpoint: GET /api/articles/:id to prefill edit form (JWT not required to read)
        const response = await api.get(`/articles/${id}`);
        if (!isMounted) return;
        const data = response.data?.data || response.data;
        setTitle(data.title || '');
        setContent(data.content || '');
      } catch (err) {
        if (!isMounted) return;
        setError(err.response?.data?.message || 'Failed to load article for editing.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchArticle();

    return () => {
      isMounted = false;
    };
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const payload = {
        title,
        content,
        // Protected article endpoints expect full payload; category/tags can be extended in UI later.
        category: 'General',
        tags: [],
      };

      if (isEdit) {
        // Protected endpoint: PUT /api/articles/:id (JWT attached via Axios interceptor)
        await api.put(`/articles/${id}`, payload);
      } else {
        // Protected endpoint: POST /api/articles (JWT attached via Axios interceptor)
        await api.post('/articles', payload);
      }

      navigate(isEdit ? `/articles/${id}` : '/dashboard');
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        setError('You are not authorized to perform this action. Please sign in again.');
      } else {
        setError(err.response?.data?.message || 'Something went wrong.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to={isEdit ? `/articles/${id}` : '/dashboard'}
          className="text-slate-600 hover:text-slate-900 text-sm font-medium mb-6 inline-block"
        >
          ← {isEdit ? 'Back to article' : 'Back to Dashboard'}
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          {isEdit ? 'Edit article' : 'New article'}
        </h1>
        {isLoading ? (
          <div className="text-slate-600">Loading article…</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                placeholder="Article title"
              />
            </div>
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-slate-700"
              >
                Content
              </label>
              <textarea
                id="content"
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                placeholder="Write your article..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-slate-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Publish'}
              </button>
              <Link
                to={isEdit ? `/articles/${id}` : '/dashboard'}
                className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
