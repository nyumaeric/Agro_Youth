"use client";

import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, ExternalLink, Send, MoreHorizontal, Bookmark, Eye, Play, X, ChevronDown, Reply, ThumbsUp, Flag } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import CommentReplies from './CommentReplies';

import { formatDistanceToNow } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useCreateComment } from '@/hooks/posts/comments/usePostComments';
import { useCommentLikes } from '@/hooks/posts/comments/usePostCommentsLikes';
import { usePostLikes } from '@/hooks/posts/usePostsLikes';


export const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

interface Comment {
  id: string | number;
  content: string;
  author: {
    id?: string;
    name: string;
    username?: string;
    image?: string;
    gender?: string;
    anonymousName?: string;
    anonymity_name?: string;
  };
  createdAt: string;
  likes?: number;
  likesCount?: number;
  isLiked?: boolean;
  repliesCount?: number;
  replies?: any[];
  isAnonymous?: boolean;
}

const PostModal: React.FC<{
  post: any;
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
  onCommentSubmit: (e: React.FormEvent) => void;
  formData: any;
  handleInputField: any;
  isPending: boolean;
  toggleCommentLike: (commentId: string | number) => void;
  isLikePending: boolean;
  getUserAvatar: () => React.JSX.Element;
  getUserDisplayName: () => string;
  getCurrentUserAvatar: () => React.JSX.Element;
  getCommentUserAvatar: (comment: Comment) => React.JSX.Element;
  getCommentUserDisplayName: (comment: Comment) => string;
  formatDate: (date: string) => string;
  renderPostContent: () => React.JSX.Element | null;
  formatCount: (count: number) => string;
  handlePostLike: () => void;
  isPostLikePending: boolean;
  toggleBookmark: () => void;
  bookmarked: boolean;
  showReportModal: boolean;
  setShowReportModal: (show: boolean) => void;
  courseId: string;
}> = ({
  post,
  isOpen,
  onClose,
  comments,
  onCommentSubmit,
  formData,
  handleInputField,
  isPending,
  toggleCommentLike,
  isLikePending,
  getUserAvatar,
  getUserDisplayName,
  getCurrentUserAvatar,
  getCommentUserAvatar,
  getCommentUserDisplayName,
  formatDate,
  renderPostContent,
  formatCount,
  handlePostLike,
  isPostLikePending,
  toggleBookmark,
  bookmarked,
  showReportModal,
  setShowReportModal,
  courseId
}) => {
  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 w-screen h-screen">        <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex relative z-10">
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getUserAvatar()}
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{getUserDisplayName()}</h4>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{formatDate(post.createdAt)}</span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <div className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      <span>{formatCount(post.views || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleBookmark}
                  className={`p-2 rounded-full hover:bg-yellow-50 transition-all duration-200 ${bookmarked ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:text-yellow-500'}`}
                >
                  <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="p-2 rounded-full hover:bg-gray-50 text-gray-400 hover:text-red-500 transition-all duration-200"
                >
                  <Flag className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {post.title && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight">{post.title}</h3>
                </div>
              )}


              
              {/* {post.textContent && (
                <div className="mb-4">
                  <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{post.textContent}</p>
                </div>
              )} */}

              {renderPostContent()}
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handlePostLike}
                  disabled={isPostLikePending}
                  className={`flex items-center space-x-2 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed ${
                    post.isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${
                    post.isLiked ? 'fill-current' : ''
                  } ${isPostLikePending ? 'animate-pulse' : ''}`} />
                  <span className="text-sm font-medium">{formatCount(post.likes || 0)} upvotes</span>
                </button>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{formatCount(comments.length)}</span>
                </div>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-all duration-200 group">
                  <Share2 className="w-4 h-4 transition-all duration-200 group-hover:scale-110" />
                  <span className="text-sm font-medium">{formatCount(post.shares || 0)}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right side - Comments */}
          <div className="w-96 bg-gray-50 border-l border-gray-200 flex flex-col">
            {/* Comments header */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 text-base">Comments</h3>
              <p className="text-xs text-gray-500">{comments.length} comments</p>
            </div>

            <div className="p-4 border-b border-gray-200">
              {/* Anonymous toggle */}
              <div className="flex items-center space-x-3 p-2 border rounded-lg bg-gray-50 mb-3">
                <Label htmlFor="comment-anonymous-toggle" className="text-sm font-medium">
                  Comment anonymously
                </Label>
                <Switch
                  id="comment-anonymous-toggle"
                  checked={formData.isAnonymous ?? false}
                  onCheckedChange={(checked) => handleInputField({ 
                    target: { id: 'isAnonymous', value: checked } 
                  } as any)}
                />
                <span className="text-sm text-gray-600">
                  {formData.isAnonymous ? 'Anonymous' : 'Show your name'}
                </span>
              </div>

              {/* Comment input */}
              <div className="flex space-x-3">
                {getCurrentUserAvatar()}
                <div className="flex-1 relative">
                  <textarea
                    value={formData.content || ''}
                    name="content"
                    id="content"
                    onChange={handleInputField}
                    placeholder={formData.isAnonymous ? "Add an anonymous comment..." : "Add a comment..."}
                    className="w-full p-3 pr-10 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all text-sm bg-white"
                    rows={2}
                  />
                  <button
                    onClick={onCommentSubmit}
                    disabled={!formData.content?.trim() || isPending}
                    className="absolute bottom-2 right-2 p-1.5 bg-amber-500 text-white rounded-full hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="p-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex space-x-3">
                    {getCommentUserAvatar(comment)}
                    <div className="flex-1 min-w-0">
                      <div className="bg-white rounded-xl px-3 py-2.5 hover:bg-gray-50 transition-colors duration-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm text-gray-900 truncate">
                            {getCommentUserDisplayName(comment)}
                          </span>
                          <span className="text-xs text-blue-700 flex-shrink-0">{formatDate(comment.createdAt)}</span>
                          {comment.isAnonymous && (
                            <Badge className="text-xs bg-slate-500 text-white font-extrabold px-2 py-0.5 rounded">
                              Anonymous
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-800 text-sm leading-relaxed break-words">{comment.content}</p>
                        
                      </div>

                      <div className="flex items-center mt-2 ml-3 space-x-4">
                        <button
                          onClick={() => toggleCommentLike(comment.id)}
                          disabled={isLikePending}
                          className={`flex items-center space-x-1 text-xs transition-all duration-200 disabled:opacity-50 px-2 py-1 rounded-full ${
                            comment.isLiked 
                              ? 'text-white bg-black hover:bg-gray-800' 
                              : 'text-gray-500 hover:text-black hover:bg-gray-100'
                          }`}
                        >
                          <ThumbsUp className={`w-3 h-3 ${comment.isLiked ? 'fill-current' : ''} ${isLikePending ? 'animate-pulse' : ''}`} />
                          <span className="font-medium">{comment.likesCount || comment.likes || 0}</span>
                        </button>
                      </div>

                      <CommentReplies
                        courseId={courseId}
                        postId={post.id}
                        commentReplies={comment.replies || []} 
                        commentId={comment.id.toString()}
                        commentAuthorName={getCommentUserDisplayName(comment)}
                        initialRepliesCount={comment.repliesCount || (comment.replies?.length || 0)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    
    </>
  );
};

const PostItem: React.FC<{ post: any }> = ({ post }) => {
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const params = useParams();
  const courseId = params?.id as string;

  const {
    formData,
    setFormData,
    isPending,
    handleSubmit,
    handleInputField
  } = useCreateComment(courseId);

  const { toggleCommentLike, isPending: isLikePending } = useCommentLikes();
  const { togglePostLike, isPending: isPostLikePending } = usePostLikes();

  useEffect(() => {
    if (post.comments && Array.isArray(post.comments)) {
      const formattedComments: Comment[] = post.comments.map((comment: any) => ({
        id: comment.id,
        content: comment.content,
        author: {
          id: comment.author?.id,
          name: comment.author?.name || 'Anonymous',
          username: comment.author?.username,
          image: comment.author?.image,
          gender: comment.author?.gender || 'other',
          anonymousName: comment.author?.anonymousName,
          anonymity_name: comment.author?.anonymity_name // Add fallback
        },
        createdAt: comment.createdAt,
        likes: comment.likes || 0,
        likesCount: comment.likesCount || comment.likes || 0,
        isLiked: comment.isLiked || false,
        repliesCount: comment.repliesCount || 0,
        replies: comment.replies || [],
        isAnonymous: comment.isAnonymous || false
      }));
  
      setComments(formattedComments);
    }
  }, [post.comments]);

  const getUserAvatar = () => {
    if (post.isAnonymous) {
      const anonymityName = post.author?.anonymity_name || 'Anonymous';
      return (
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
            {getInitials(anonymityName)}
          </div>
        </div>
      );
    }
  
    if (post.author?.image) {
      return (
        <div className="relative">
          <img 
            src={post.author.image}
            alt={post.author?.fullName || post.author?.name || 'User'} 
            className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-lg"
          />
        </div>
      );
    }
  
    const realName = post.author?.fullName || post.author?.name || 'User';
    return (
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
          {getInitials(realName)}
        </div>
      </div>
    );
  };

  const getUserDisplayName = () => {
    if (session?.user?.fullName === post.author?.name) {
      return "You";
    }
    
    if (post.isAnonymous) {
      return post.author?.anonymity_name || 'Anonymous';
    }
    
    return post.author?.fullName || post.author?.name || 'Anonymous User';
  };

  const getCurrentUserAvatar = () => {
    return (
      <div className="relative">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
          {getInitials(session?.user?.fullName)}
        </div>
      </div>
    );
  };

  const getCommentUserAvatar = (comment: Comment) => {
    if (comment.isAnonymous) {
      const anonymousName = comment.author.anonymousName || comment.author.anonymity_name || session?.user?.fullName;
      return (
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
            {getInitials(anonymousName)}
          </div>
        </div>
      );
    }
  
    if (comment.author.image) {
      return (
        <div className="relative">
          <img 
            src={comment.author.image} 
            alt={comment.author.name} 
            className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
          />
        </div>
      );
    }
    
    return (
      <div className="relative">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
          {getInitials(comment.author.name)}
        </div>
      </div>
    );
  };

  const getCommentUserDisplayName = (comment: Comment): string => {
    if (session?.user?.fullName === comment.author.name) {
      return "You";
    }
  
    if (comment.isAnonymous) {
      return comment?.author?.anonymousName || comment?.author?.anonymity_name || 'You'; 
    }
    
    return comment.author.name || 'Anonymous User'; 
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);
    if (diffInSeconds < 60) {
      return 'now';
    }
    return formatDistanceToNow(commentDate, { addSuffix: true })
      .replace('about ', '')
      .replace('less than ', '');
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content?.trim()) return;
  
    try {
      await handleSubmit(post.id, courseId);
      
      const newComment: Comment = {
        id: Date.now(),
        content: formData.content,
        author: {
          name: session?.user?.fullName || session?.user?.fullName || "You",
        },
        createdAt: new Date().toISOString(),
        likes: 0,
        likesCount: 0,
        isLiked: false,
        repliesCount: 0,
        replies: [],
        isAnonymous: formData.isAnonymous 
      };

      
      setComments(prev => [newComment, ...prev]);
      setFormData({ content: '', isAnonymous: false }); 
    } catch (error) {
      return error;
    }
  };

  const handlePostLike = () => {
    if (isPostLikePending) return;
    togglePostLike(courseId, post.id);
  };

  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  const handleCommentLike = (commentId: string | number) => {
    const commentIdStr = commentId.toString();
    toggleCommentLike(commentIdStr, courseId, post.id);
  };

  const renderPostContent = () => {
    switch (post.contentType) {
      case 'image':
        return (
          <div className="mt-3 group relative overflow-hidden rounded-xl">
            <img 
              src={post.mediaUrl || '/api/placeholder/600/300'} 
              alt={post.mediaAlt || 'Post image'} 
              className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        );
        
      case 'video':
        return (
          <div className="mt-3 relative group rounded-xl overflow-hidden">
            <video 
              src={post.mediaUrl} 
              controls 
              className="w-full h-52 object-cover"
              poster="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=300&fit=crop"
            />
            <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1.5 rounded-full text-xs flex items-center font-medium shadow-lg">
              <Play className="w-3 h-3 mr-1.5" />
              Video
            </div>
          </div>
        );
        
      case 'link':
        return (
          <div className="mt-3">
            <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-lg transition-all duration-300">
              <a 
                href={post.linkUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block"
              >
                <div className="flex">
                  {post.linkPreviewImage && (
                    <div className="w-24 h-24 flex-shrink-0">
                      <img 
                        src={post.linkPreviewImage} 
                        alt="Link preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-4">
                    <div className="flex items-center text-blue-600 text-xs font-semibold mb-2">
                      {post.linkUrl?.replace(/^https?:\/\//, '').split('/')[0]}
                      <ExternalLink className="ml-1.5 w-3 h-3" />
                    </div>
                    {post.linkDescription && (
                      <p className="text-gray-700 text-sm line-clamp-2 leading-relaxed">{post.linkDescription}</p>
                    )}
                  </div>
                </div>
              </a>
            </div>
            {post.textContent && (
              <p className="text-gray-800 mt-3 text-sm leading-relaxed line-clamp-3">{post.textContent}</p>
            )}
          </div>
        );
        
      case 'text':
        return (
          <div className="mt-3">
            <p className="text-gray-800 text-sm leading-relaxed line-clamp-6 whitespace-pre-wrap">{post.textContent}</p>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <>
      <div className="w-full max-w-7xl">
        <article className="rounded-2xl shadow-md border overflow-hidden hover:shadow-lg transition-all duration-300 w-full cursor-pointer"
                 onClick={() => setShowModal(true)}>
          <div className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getUserAvatar()}
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{getUserDisplayName()}</h4>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{formatDate(post.createdAt)}</span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <div className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      <span>{formatCount(post.views || 0)}</span>
                    </div>
                  </div>
                </div>
                {post.isAnonymous && (
                  <Badge className="text-xs bg-slate-500 text-white font-extrabold px-2 py-0.5 rounded">
                    Anonymous
                  </Badge>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReportModal(true);
                }}
                className="p-2 rounded-full hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-all duration-200"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {post.title && (
            <div className="px-5 pb-2">
              <h3 className="font-semibold text-gray-900 text-base leading-tight">{post.title}</h3>
            </div>
          )}

          <div className="px-5 pb-3">
            {renderPostContent()}
          </div>

          <div className="px-5 py-3 border-t transition-all duration-300">
            <div className="flex items-center space-x-6">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePostLike();
                }}
                disabled={isPostLikePending}
                className={`flex items-center space-x-2 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed ${
                  post.isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${
                  post.isLiked ? 'fill-current' : ''
                } ${isPostLikePending ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-medium">{formatCount(post.likes || 0)} upvotes</span>
              </button>
              <div className="flex items-center space-x-2 text-gray-600">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{formatCount(comments.length)}</span>
              </div>
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-all duration-200 group"
              >
                <Share2 className="w-4 h-4 transition-all duration-200 group-hover:scale-110" />
                <span className="text-sm font-medium">{formatCount(post.shares || 0)}</span>
              </button>
            </div>
          </div>
        </article>
      </div>

      <PostModal
        post={post}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        comments={comments}
        onCommentSubmit={submitComment}
        formData={formData}
        handleInputField={handleInputField}
        isPending={isPending}
        toggleCommentLike={handleCommentLike}
        isLikePending={isLikePending}
        getUserAvatar={getUserAvatar}
        getUserDisplayName={getUserDisplayName}
        getCurrentUserAvatar={getCurrentUserAvatar}
        getCommentUserAvatar={getCommentUserAvatar}
        getCommentUserDisplayName={getCommentUserDisplayName}
        formatDate={formatDate}
        renderPostContent={renderPostContent}
        formatCount={formatCount}
        handlePostLike={handlePostLike}
        isPostLikePending={isPostLikePending}
        toggleBookmark={toggleBookmark}
        bookmarked={bookmarked}
        showReportModal={showReportModal}
        setShowReportModal={setShowReportModal}
        courseId={courseId}
      />
    </>
  );
};

export default PostItem;