"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, ThumbsUp, MoreHorizontal, Reply } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CommentReply } from '@/services/posts/comments/getCommentReplies';
import { useCreateRepliesComment } from '@/hooks/posts/comments/useCreateReplies';
import { getInitials } from './PostItem';


interface CommentRepliesProps {
  courseId: string;
  postId: string;
  commentId: string;
  commentAuthorName: string;
  commentReplies: CommentReply[];
  initialRepliesCount?: number;
}

const CommentReplies: React.FC<CommentRepliesProps> = ({
  courseId,
  postId,
  commentId,
  commentAuthorName,
  commentReplies,
  initialRepliesCount = 0
}) => {
  const { data: session } = useSession();
  const [showReplies, setShowReplies] = useState(false);
  const [page, setPage] = useState(1);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const {
    formData: replyFormData,
    setformData: setReplyFormData,
    isPending: isReplyPending,
    errors: replyErrors,
    handleSubmit: handleReplySubmit,
    handleInputField: handleReplyInputField
  } = useCreateRepliesComment(courseId);

  const replies = commentReplies || [];
  const totalCount = commentReplies?.length || initialRepliesCount;

  useEffect(() => {
    if (replyingTo === commentId && !showReplies) {
      setShowReplies(true);
    }
  }, [replyingTo, commentId, showReplies]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const getUserAvatar = (reply: CommentReply) => {
    // Check if reply is anonymous
    if (reply.isAnonymous) {
      const anonymousName = reply.author.anonymousName || reply.author.anonymity_name || 'Anonymous';
      return (
        <div className="relative">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
            {getInitials(anonymousName)}
          </div>
        </div>
      );
    }

    if (reply.author.image) {
      return (
        <div className="relative">
          <img 
            src={reply.author.image} 
            alt={reply.author.fullName} 
            className="w-7 h-7 rounded-full object-cover ring-1 ring-white shadow-sm"
          />
        </div>
      );
    }
    const displayName = reply.author.fullName ||  'Anonymous';
    
    return (
      <div className="relative">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
          {getInitials(displayName)}
        </div>
      </div>
    );
  };

  const getCurrentUserAvatar = () => {
    const userFullName = session?.user?.fullName || 'Anonymous';
    
    if (replyFormData.isAnonymous) {
      return (
        <div className="relative">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
            {getInitials(userFullName)}
          </div>
        </div>
      );
    }

  
    return (
      <div className="relative">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
          {getInitials(userFullName)}
        </div>
      </div>
    );
  };

  const getUserDisplayName = (reply: CommentReply) => {
    if (session?.user?.fullName === reply.author.fullName) {
      return "You";
    }
    
    if (reply.isAnonymous) {
      return reply.author.anonymousName || reply.author.anonymity_name || 'Anonymous';
    }
    
    return reply.author.fullName || 'Anonymous';
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
    if (!showReplies) {
      setPage(1);
    }
  };

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyFormData.commentReplies?.trim()) return;

    try {
      await handleReplySubmit(courseId, postId, commentId);
      setReplyingTo(null);
      setReplyFormData({ commentReplies: '', isAnonymous: false });
    } catch (error) {
      console.error('Reply submission error:', error);
    }
  };

  const startReply = () => {
    setReplyingTo(commentId);
    setShowReplies(true);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyFormData({ commentReplies: '', isAnonymous: false });
  };

  if (totalCount === 0) {
    return (
      <div className="ml-3 mt-2">
        <button
          onClick={startReply}
          className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-500 transition-colors duration-200"
        >
          <Reply className="w-4 h-4 font-extrabold text-orange-500" />
          <span className="font-bold text-orange-500">Reply</span>
        </button>

        {replyingTo === commentId && (
          <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center space-x-2 p-2 border rounded-lg bg-gray-50 mb-2">
              <Label htmlFor="reply-anonymous-toggle" className="text-xs font-medium">
                Reply anonymously
              </Label>
              <Switch
                id="reply-anonymous-toggle"
                checked={replyFormData.isAnonymous ?? false}
                onCheckedChange={(checked) => handleReplyInputField({ 
                  target: { id: 'isAnonymous', value: checked } 
                } as any)}
              />
              <span className="text-xs text-gray-600">
                {replyFormData.isAnonymous ? 'Anonymous' : 'Show your name'}
              </span>
            </div>

            <form onSubmit={submitReply}>
              <div className="flex space-x-2">
                {getCurrentUserAvatar()}
                <div className="flex-1 relative">
                  <textarea
                    id="commentReplies"
                    name="commentReplies"
                    value={replyFormData.commentReplies || ''}
                    onChange={handleReplyInputField}
                    placeholder={
                      replyFormData.isAnonymous 
                        ? `Reply anonymously to ${commentAuthorName}...`
                        : `Reply to ${commentAuthorName}...`
                    }
                    className="w-full p-2 pr-8 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-xs bg-white"
                    rows={2}
                    autoFocus
                  />
                  {replyErrors.commentReplies && (
                    <p className="text-red-500 text-xs mt-1">{replyErrors.commentReplies}</p>
                  )}
                  <div className="flex items-center justify-end space-x-2 mt-2">
                    <button
                      type="button"
                      onClick={cancelReply}
                      className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!replyFormData.commentReplies?.trim() || isReplyPending}
                      className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {isReplyPending ? 'Replying...' : 'Reply'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="ml-3 mt-2">
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleReplies}
          className="flex items-center space-x-2 text-xs text-gray-600 hover:text-blue-600 transition-colors duration-200"
        >
          {showReplies ? (
            <ChevronUp className="w-3 h-3 text-orange-500" />
          ) : (
            <ChevronDown className="w-3 h-3 text-orange-500" />
          )}
          <span className="font-medium text-orange-500">
            {totalCount} {totalCount === 1 ? 'reply' : 'replies'}
          </span>
        </button>
        
        <button
          onClick={startReply}
          className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-500 transition-colors duration-200"
        >
          <Reply className="w-4 h-4 text-orange-500" />
          <span className="font-medium text-orange-500">Reply</span>
        </button>
      </div>

      {showReplies && (
        <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {replies.map((reply: any) => (
            <div key={reply.id} className="flex space-x-2">
              {getUserAvatar(reply)}
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-xs text-gray-900 truncate">
                      {getUserDisplayName(reply)}
                    </span>
                    <span className="text-xs text-blue-500 flex-shrink-0">
                      {formatDate(reply.createdAt)}
                    </span>
                    {reply.isAnonymous && (
                      <span className="text-xs bg-slate-500 text-white font-extrabold px-2 py-0.5 rounded">
                        Anonymous
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800 text-xs leading-relaxed break-words">
                    {reply.commentReplies}
                  </p>
                </div>

                <div className="flex items-center mt-1 ml-3 space-x-3">
                  <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-black transition-colors duration-200">
                    <ThumbsUp className="w-2.5 h-2.5" />
                    <span className="font-medium">{reply.likesCount || 0}</span>
                  </button>
                  <button className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-200">
                    <MoreHorizontal className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {replyingTo === commentId && (
            <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
              {/* Anonymous toggle for reply */}
              <div className="flex items-center space-x-2 p-2 border rounded-lg bg-gray-50 mb-2">
                <Label htmlFor="reply-anonymous-toggle" className="text-xs font-medium">
                  Reply anonymously
                </Label>
                <Switch
                  id="reply-anonymous-toggle"
                  checked={replyFormData.isAnonymous ?? false}
                  onCheckedChange={(checked) => handleReplyInputField({ 
                    target: { id: 'isAnonymous', value: checked } 
                  } as any)}
                />
                <span className="text-xs text-gray-600">
                  {replyFormData.isAnonymous ? 'Anonymous' : 'Show your name'}
                </span>
              </div>

              <form onSubmit={submitReply}>
                <div className="flex space-x-2">
                  {getCurrentUserAvatar()}
                  <div className="flex-1 relative">
                    <textarea
                      id="commentReplies"
                      name="commentReplies"
                      value={replyFormData.commentReplies || ''}
                      onChange={handleReplyInputField}
                      placeholder={
                        replyFormData.isAnonymous 
                          ? `Reply anonymously to ${commentAuthorName}...`
                          : `Reply to ${commentAuthorName}...`
                      }
                      className="w-full p-2 pr-8 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-xs bg-white"
                      rows={2}
                      autoFocus
                    />
                    {replyErrors.commentReplies && (
                      <p className="text-red-500 text-xs mt-1">{replyErrors.commentReplies}</p>
                    )}
                    <div className="flex items-center justify-end space-x-2 mt-2">
                      <button
                        type="button"
                        onClick={cancelReply}
                        className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!replyFormData.commentReplies?.trim() || isReplyPending}
                        className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {isReplyPending ? 'Replying...' : 'Reply'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentReplies;