import { Button } from "@/components/ui/button";
import { useAllProductsByUser } from "@/hooks/products/useGetAllProducts";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function AllProducts() {
  const { data, isPending } = useAllProductsByUser();
  const products = data?.data || [];

  if (isPending) {
    return (
      <div className="space-y-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-6 p-6 bg-white border-b border-gray-100">
            <Skeleton circle width={64} height={64} />
            <div className="flex-1 space-y-3">
              <Skeleton width="30%" height={28} />
              <Skeleton width="70%" height={18} />
              <Skeleton width="50%" height={18} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
          <p className="text-sm text-gray-500 mt-1">{products.length} products available</p>
        </div>
        <Button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Product
        </Button>
      </div>

      <div className="divide-y divide-gray-100">
        {products.map((product: any, index: number) => (
          <div
            key={product.id}
            className="group relative flex items-center gap-6 px-8 py-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
          >
            <div className="flex-shrink-0 w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
              <span className="text-white text-xl font-bold">
                {product.cropName.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                  {product.cropName}
                </h3>
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                    product.isAvailable
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {product.isAvailable ? "Available" : "Unavailable"}
                </span>
              </div>

              <div className="flex items-center gap-8 text-sm mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-medium">Qty:</span>
                  <span className="font-semibold text-gray-700">
                    {product.quantity} {product.unit}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-medium">Price:</span>
                  <span className="font-bold text-emerald-600 text-base">
                    ${product.price}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-medium">Location:</span>
                  <span className="font-medium text-gray-700">
                    {product.location}
                  </span>
                </div>
              </div>

              <p className="text-gray-500 text-sm leading-relaxed line-clamp-1">
                {product.description}
              </p>
            </div>

            {/* Action Icons */}
            <div className="flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button className="p-2 hover:bg-white rounded-lg transition-colors" title="Edit">
                <svg className="w-5 h-5 text-gray-400 hover:text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-white rounded-lg transition-colors" title="Delete">
                <svg className="w-5 h-5 text-gray-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No products yet</h3>
          <p className="text-sm text-gray-500">Get started by creating your first product</p>
        </div>
      )}
    </div>
  );
}