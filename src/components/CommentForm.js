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
        className="w-full p-3 border border-input-border rounded-lg mb-2 bg-input text-input-foreground focus:border-input-focus focus:outline-none focus:ring-1 focus:ring-input-focus"
        placeholder="Share your flight experience or ask a question..."
        rows="3"
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition"
        >
          Post Comment
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-secondary text-secondary-foreground px-6 py-2 rounded-lg hover:bg-secondary/90 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}