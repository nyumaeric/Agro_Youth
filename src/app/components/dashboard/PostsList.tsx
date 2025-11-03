"use client";
import React from 'react';
import PostItem from './PostItem';
import { useGetPosts } from '@/hooks/posts/useGetAllPosts';

interface PostsListProps {
  courseId: string;
  onCreatePost: () => void;
}

const PostsList: React.FC<PostsListProps> = ({ courseId, onCreatePost }) => {
  const { posts, isPending, error } = useGetPosts(courseId);


  if (isPending) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="ml-3 flex-1">
                <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-4/5"></div>
              <div className="h-4 bg-gray-300 rounded w-3/5"></div>
            </div>
            
            <div className="flex items-center space-x-6 pt-4 border-t border-gray-100">
              <div className="h-8 bg-gray-200 rounded w-16"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        Failed to load posts. Please try again later.
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <h3 className="text-xl font-medium text-gray-600 mb-2">No posts yet</h3>
        <p className="text-gray-500 mb-4">Be the first to start a discussion in this group</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post: any) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostsList;