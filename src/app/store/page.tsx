"use client";

import { useState, useEffect } from "react";
import { Product, productService } from "@/services/productService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { FiltersModal } from "./components/FiltersModal";

export default function PublicStorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current filters and sort from URL
  const search = searchParams.get("search") || "";
  const artist = searchParams.get("artist") || "";
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : 0;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : 1000;
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

  useEffect(() => {
    loadProducts();
  }, [search, artist, minPrice, maxPrice, sortBy, sortOrder, page]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(artist && { artist }),
        ...(minPrice && { minPrice: minPrice.toString() }),
        ...(maxPrice && { maxPrice: maxPrice.toString() }),
        sortBy,
        sortOrder,
      });

      const response = await productService.getAllProducts(params);
      setProducts(response.products);
      setTotalPages(response.pagination.totalPages);
      setCurrentPage(response.pagination.page);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilters = (updates: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    params.set("page", "1");
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Music Store</h1>
            <p className="text-gray-400">Discover and purchase products from favourite artists</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(true)}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Active Filters */}
        {(search || artist || minPrice > 0 || maxPrice < 1000) && (
          <div className="flex flex-wrap gap-2 mb-8">
            {search && (
              <div className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm flex items-center">
                Search: {search}
                <button
                  onClick={() => updateFilters({ search: "" })}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            )}
            {artist && (
              <div className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm flex items-center">
                Artist: {artist}
                <button
                  onClick={() => updateFilters({ artist: "" })}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            )}
            {(minPrice > 0 || maxPrice < 1000) && (
              <div className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm flex items-center">
                Price: ${minPrice} - ${maxPrice}
                <button
                  onClick={() => {
                    updateFilters({ minPrice: 0, maxPrice: 1000 });
                  }}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d9b535]"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No products found</p>
            <p className="text-gray-500 mt-2">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <Card key={product.id} className="bg-[#141414] border-gray-800 overflow-hidden hover:border-[#d9b535] transition-colors group">
                  <CardHeader className="p-0">
                    <div className="relative w-full aspect-square rounded-t-lg overflow-hidden">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="text-xl font-bold text-white mb-2 line-clamp-1">
                      {product.name}
                    </CardTitle>
                    <p className="text-gray-400 mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-[#d9b535] font-bold text-xl">${product.price}</p>
                      <Button
                        className="bg-[#d9b535] hover:bg-[#c4a430] text-gray-900 font-medium transition-colors"
                      >
                        Buy Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 space-x-4">
                <Button
                  variant="outline"
                  onClick={() => updateFilters({ page: currentPage - 1 })}
                  disabled={currentPage === 1}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      onClick={() => updateFilters({ page: pageNum })}
                      className={pageNum === currentPage 
                        ? "bg-[#d9b535] hover:bg-[#c4a430] text-gray-900" 
                        : "border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                      }
                    >
                      {pageNum}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => updateFilters({ page: currentPage + 1 })}
                  disabled={currentPage === totalPages}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Filters Modal */}
        <FiltersModal isOpen={showFilters} onClose={() => setShowFilters(false)} />
      </div>
    </div>
  );
} 