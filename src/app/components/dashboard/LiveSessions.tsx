"use client";
import { useSession } from "next-auth/react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Calendar, Clock, Video, User, Users, MapPin } from "lucide-react";
import { useAllLiveSessions, useAllLiveSessionsByUser } from "@/hooks/liveSessions.ts/useGetLiveSessions";
import CreateSessionDialog from "./CreateLiveSessions";
import { useGetMostPopularPosts } from "@/hooks/posts/useGetAllPosts";

interface LiveSession {
  id: string;
  hostId: string;
  title: string;
  description: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink: string;
  isActive: boolean;
  createdAt?: string;
}

const TimelineSession = ({ session, isOwned = false, isNearest = false }: { session: LiveSession; isOwned?: boolean; isNearest?: boolean }) => {
  const scheduledDate = new Date(session.scheduledAt);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative flex gap-6 pb-8">
      <div className="relative flex flex-col items-center">
        <div className={`w-7 h-7 rounded-full z-10 ${isNearest ? 'bg-emerald-500 ring-4 ring-emerald-100 animate-bounce' : 'bg-slate-400'}`} />
        <div className="w-0.5 h-full bg-gradient-to-b from-slate-300 to-transparent absolute top-4" />
      </div>

      <div className="flex-1 -mt-1">
        <div className={`rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border overflow-hidden ${
          isNearest 
            ? 'bg-emerald-50 border-emerald-200 animate-pulse' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
                  {isOwned && (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                      Your Session
                    </span>
                  )}
                  {isNearest && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">
                      Next Session
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded">
                    Upcoming
                  </span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2">{session.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span className="font-medium">{formatDate(scheduledDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{formatTime(scheduledDate)} • {session.durationMinutes} min</span>
              </div>
            </div>

            <a
              href={session.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-slate-600 hover:bg-slate-700 text-white transition-colors"
            >
              <Video className="w-4 h-4" />
              Join Meeting
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const TimelineSkeleton = () => (
  <div className="relative flex gap-6 pb-8">
    <div className="relative flex flex-col items-center">
      <Skeleton circle width={16} height={16} />
      <div className="w-0.5 h-full bg-gray-200 absolute top-4" />
    </div>
    <div className="flex-1 -mt-1">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <Skeleton width="60%" height={24} className="mb-2" />
        <Skeleton count={2} height={14} className="mb-4" />
        <Skeleton width="50%" height={18} className="mb-2" />
        <Skeleton width="45%" height={18} className="mb-4" />
        <Skeleton width={120} height={36} />
      </div>
    </div>
  </div>
);

export default function LiveSessions() {
  const { data: allSessionsData, isPending: isAllPending } = useAllLiveSessions();
  const { data: userSessionsData, isPending: isUserPending } = useAllLiveSessionsByUser();
  const { popularPosts, isPending: isPopularPostsPending } = useGetMostPopularPosts(); // Add this hook
  const { data: session } = useSession();
  const userType = session?.user?.userType;
  const role = session?.user.role;
  let isAuthorized;
  if(userType == "investor" || role == "Admin"){
    isAuthorized = true;
  }

  const allSessions = Array.isArray(allSessionsData) 
    ? allSessionsData 
    : Array.isArray(allSessionsData?.data) 
    ? allSessionsData.data 
    : [];

  const userSessions = Array.isArray(userSessionsData) 
    ? userSessionsData 
    : Array.isArray(userSessionsData?.data) 
    ? userSessionsData.data 
    : [];

  const isInvestor = userType === "investor";

  const now = new Date();
  const upcomingSessions = allSessions
    .filter((session: LiveSession) => new Date(session.scheduledAt) > now)
    .sort((a: LiveSession, b: LiveSession) => 
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );

  const upcomingUserSessions = userSessions
    .filter((session: LiveSession) => new Date(session.scheduledAt) > now)
    .sort((a: LiveSession, b: LiveSession) => 
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );

  const nearestSession = upcomingSessions.length > 0 ? upcomingSessions[0] : null;

  return (
    <div className="space-y-6 max-w-4xl pt-10 pl-8">
        <div className="flex justify-between">
            <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-7 h-7 text-emerald-600" />
            Upcoming Sessions Timeline
            </h1>
            <p className="text-sm text-gray-600 mt-1">
            {isInvestor
                ? "Your upcoming sessions and other opportunities"
                : "Join upcoming live sessions and connect with investors"}
            </p>
            </div>
            {isAuthorized && (
                <CreateSessionDialog popularPosts={popularPosts} isLoadingPosts={isPopularPostsPending} />
            )}

        </div>


      {(isAllPending || (isInvestor && isUserPending)) ? (
        <div className="space-y-6">
          {isInvestor && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-700" />
                Your Sessions
              </h2>
              <div className="relative">
                {[1, 2, 3].map((i) => (
                  <TimelineSkeleton key={i} />
                ))}
              </div>
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-700" />
              {isInvestor ? "All Sessions" : "Available Sessions"}
            </h2>
            <div className="relative">
              {[1, 2, 3].map((i) => (
                <TimelineSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {isInvestor && upcomingUserSessions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-700" />
                Your Sessions
                <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                  {upcomingUserSessions.length}
                </span>
              </h2>
              <div className="relative">
                {upcomingUserSessions.map((sess: LiveSession) => (
                  <TimelineSession 
                    key={sess.id} 
                    session={sess} 
                    isOwned={true}
                    isNearest={nearestSession?.id === sess.id}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-700" />
              {isInvestor ? "All Sessions" : "Available Sessions"}
              {upcomingSessions.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                  {upcomingSessions.length}
                </span>
              )}
            </h2>
            {upcomingSessions.length > 0 ? (
              <div className="relative">
                {upcomingSessions.map((sess: LiveSession) => (
                  <TimelineSession 
                    key={sess.id} 
                    session={sess}
                    isNearest={nearestSession?.id === sess.id}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Upcoming Sessions</h3>
                <p className="text-sm text-gray-600">
                  {isInvestor
                    ? "There are no upcoming sessions scheduled at the moment."
                    : "Check back later for upcoming live sessions."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}