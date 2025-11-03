import { toast } from 'react-hot-toast';
import { HiMiniCheckCircle } from "react-icons/hi2";
import { GoXCircleFill } from "react-icons/go";

type ToastType = "success" | "error";

  const showToast = (message: string, type: ToastType) => {
    toast.custom((t) => (
      <div 
        className={`
          ${t.visible ? "animate-enter" : "animate-leave"}
          max-w-md w-full bg-white shadow-2xl rounded-xl pointer-events-auto 
          flex overflow-hidden border-l-4 
          ${type === "success" ? "border-green-500" : "border-red-500"}
          transform transition-all duration-300 ease-in-out
        `}
      >
        <div className="flex items-center p-4 space-x-4 w-full">
          <div className="flex-shrink-0">
            {type === "success" ? (
              <HiMiniCheckCircle className="h-8 w-8 text-green-500 animate-bounce" />
            ) : (
              <GoXCircleFill className="h-8 w-8 text-red-500 animate-pulse" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-md font-semibold text-gray-800">{message}</p>
          </div>
          <div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors duration-200"
            >
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    ), {
      duration: 2000, 
      position: 'top-center',
    });
  }
  export default showToast;