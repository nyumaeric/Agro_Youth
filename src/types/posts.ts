export interface createPostsInterface {
    title: string;
    contentType: "text" | "image" | "video" | "audio" | "link";
    textContent?: string;
    mediaUrl?: string;
    mediaAlt?: string;
    linkUrl?: string;
    linkDescription?: string;
    linkPreviewImage?: string;
    isAnonymous?: boolean
  }
  
  export interface Post {
    likes: number;
    id: string;
    userId: string;
    courseId: string;
    title: string;
    contentType: "text" | "image" | "video" | "audio" | "link";
    textContent: string | null;
    mediaUrl: string | null;
    author: {
      name: string;
      gender: string;
      image: string;
    }
    mediaAlt: string | null;
    linkUrl: string | null;
    linkDescription: string | null;
    linkPreviewImage: string | null;
    createdAt: string;
    updatedAt: string;
  }