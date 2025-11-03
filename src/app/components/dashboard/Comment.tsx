import React from 'react';
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import { useCommentLikes } from '@/hooks/posts/comments/usePostCommentsLikes';

interface CommentProps {
  comment: {
    id: string;
    content: string;
    author: {
      id: string;
      name: string;
      avatar?: string;
    };
    createdAt: string;
    isLiked?: boolean;
    likesCount?: number;
  };
  postId: string;
}

const CommentComponent: React.FC<CommentProps> = ({
  comment,
  postId
}) => {
  const { toggleCommentLike, isPending } = useCommentLikes();

  console.log("Comment data:", comment);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCommentLike(comment.id, postId, String(comment.isLiked));
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <div className="flex space-x-3 py-3 px-4 hover:bg-gray-50 transition-colors duration-150">
      <div className="flex-shrink-0">
        <Image
          src={comment.author.avatar || `/api/placeholder/32/32?seed=${comment.author.id}`}
          alt={comment.author.name}
          width={32}
          height={32}
          className="rounded-full"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-medium text-gray-900 text-sm">
            {comment.author.name}
          </span>
          <span className="text-gray-500 text-xs">
            {formatTimeAgo(comment.createdAt)}
          </span>
        </div>

        <p className="text-gray-800 text-sm mb-2 break-words">
          {comment.content}
        </p>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleLikeClick}
            disabled={isPending}
            className={`
              flex items-center space-x-1 text-xs transition-all duration-200
              ${comment.isLiked
                ? 'text-red-600 hover:text-red-700'
                : 'text-gray-500 hover:text-red-600'
              }
              ${isPending ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
            `}
          >
            <Heart
              className={`w-4 h-4 transition-all duration-200 ${
                comment.isLiked ? 'fill-current' : ''
              }`}
            />
            <span className="font-medium">
              {comment.likesCount || 0}
            </span>
          </button>

          <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-600 transition-colors duration-200">
            <MessageCircle className="w-4 h-4" />
            <span>Reply</span>
          </button>

          <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentComponent;