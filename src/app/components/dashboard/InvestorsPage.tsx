import { useAllInvestors } from "@/hooks/posts/useGetAllInvestors";
import { Users, TrendingUp, Calendar, ChevronRight } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import showToast from "@/utils/showToast";

interface Investor {
  id: string;
  fullName: string;
  phoneNumber: string;
  profilePicUrl: string | null;
  bio: string | null;
  userType: string;
  createdAt: string;
}

const InvestorRowSkeleton = () => (
  <div className="bg-white border-b border-gray-100 p-6 hover:bg-gray-50 transition-colors">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <Skeleton circle width={56} height={56} />
        <div className="flex-1 max-w-md">
          <Skeleton width="40%" height={20} className="mb-2" />
          <Skeleton width="80%" height={16} />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <Skeleton width={100} height={16} />
        <Skeleton width={140} height={40} />
      </div>
    </div>
  </div>
);

const InvestorRow = ({ investor, index }: { investor: Investor; index: number }) => {
  const [isApplying, setIsApplying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { data: session} = useSession();
  const router = useRouter();

  const userType = session?.user?.userType


  const handleApplyForDonation = async () => {
    setIsApplying(true);
    try {
      console.log("Applying for donation from:", investor.fullName);
      
      if(!session){
        showToast("Please log in to apply for donations. Redirecting to login page...", "error")
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      if(userType === "investor"){
        showToast("You are not allowed to apply", "error")
        return;
      }

      router.push("/dashboard/apply")
      

    } finally {
      setIsApplying(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className="bg-white border-b border-gray-100 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-transparent transition-all duration-200 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-5 flex-1">
          <div className="relative">
            {investor.profilePicUrl ? (
              <img
                src={investor.profilePicUrl}
                alt={investor.fullName}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-200 group-hover:ring-emerald-300 transition-all"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-slate-600 flex items-center justify-center ring-2 ring-gray-200 group-hover:ring-emerald-300 transition-all">
                <span className="text-white font-bold text-lg">
                  {getInitials(investor.fullName)}
                </span>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {investor.fullName}
              </h3>
            </div>
            {investor.bio ? (
              <p className="text-sm text-gray-600 line-clamp-1 max-w-xl">
                {investor.bio}
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic">
                Available for agricultural investments
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">

          <Button
            onClick={handleApplyForDonation}
            disabled={isApplying}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            {isApplying ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Applying...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Apply for Donation
                <ChevronRight className={`w-4 h-4 transition-transform ${isHovered ? 'translate-x-1' : ''}`} />
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function InvestorsPage() {
  const { data, isPending } = useAllInvestors();

  const investors = Array.isArray(data?.data) ? data.data : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto py-16">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                Available Investors
              </h1>
              <p className="text-gray-600 ml-15">
                Connect with investors who can support your agricultural ventures
              </p>
            </div>
            
            {!isPending && investors.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{investors.length}</p>
                      <p className="text-xs text-gray-600">Active Investors</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {isPending ? (
            <div>
              {[1, 2, 3, 4, 5].map((i) => (
                <InvestorRowSkeleton key={i} />
              ))}
            </div>
          ) : investors.length > 0 ? (
            <div>
              {investors.map((investor: Investor, index: number) => (
                <InvestorRow key={investor.id} investor={investor} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Investors Available
              </h3>
              <p className="text-gray-600">
                Check back later for investment opportunities.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}