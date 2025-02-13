"use client"
import { useState } from 'react';
import CommentForm from './CommentForm';

export default function Comment({ comment, depth }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const maxDepth = 4;
  const indent = depth * 4; // 4rem per depth level
  
  return (
    <div 
      className={`ml-${indent} border-l-2 border-gray-200 pl-4`}
      style={{ marginLeft: `${indent}rem` }}
    >
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium text-gray-800">{comment.user}</span>
          <span className="text-sm text-gray-500">
            {new Date(comment.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        <p className="text-gray-700">{comment.text}</p>
        
        {depth < maxDepth && (
          <button
            className="text-blue-600 text-sm mt-2 hover:underline"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            Reply
          </button>
        )}

        {showReplyForm && (
          <div className="mt-4">
            <CommentForm
              parentId={comment.id}
              onCancel={() => setShowReplyForm(false)}
            />
          </div>
        )}

        {comment.replies && (
          <div className="mt-4 space-y-4">
            {comment.replies.map(reply => (
              <Comment 
                key={reply.id} 
                comment={reply} 
                depth={depth + 1} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
