import React, { useState } from 'react';

const BACKEND_URL = 'http://localhost:5000';

const AdminPanel: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('general');
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);
    try {
      const res = await fetch(`${BACKEND_URL}/teach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer, category })
      });
      const data = await res.json();
      if (data?.success) {
        setStatus('Saved successfully.');
        setQuestion('');
        setAnswer('');
        setCategory('general');
      } else {
        setStatus(data?.message || 'Failed to save.');
      }
    } catch (err) {
      setStatus('Could not reach backend. Is it running on localhost:5000?');
    }
  };

  return (
    <div className="container mx-auto max-w-xl">
      <h1 className="text-3xl font-bold mb-6">Admin: Teach the Assistant</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="question">Question</label>
          <input
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="e.g. what is phishing"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="answer">Answer</label>
          <textarea
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Your answer"
            rows={4}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="category">Category</label>
          <input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="e.g. cybersecurity"
          />
        </div>
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md">Save</button>
        {status && (
          <div className="text-sm mt-2">{status}</div>
        )}
      </form>
    </div>
  );
};

export default AdminPanel;


