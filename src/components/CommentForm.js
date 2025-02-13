'use client';
import { useState } from 'react';

export default function CommentForm({ flightId, parentId = null, onCancel = () => {} }) {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    // TODO: Implement actual API submission
    console.log('New comment:', {
      text: commentText,
      parentId: parentId || null,
      flightId
    });
    setCommentText('');
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <textarea
        className="w-full p-3 border rounded-lg mb-2"
        placeholder="Share your flight experience or ask a question..."
        rows="3"
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Post Comment
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}