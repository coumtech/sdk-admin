"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductModal } from "./components/ProductModal";
import { useState, useEffect } from "react";
import { Product, productService } from "@/services/productService";
import Image from "next/image";

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(undefined);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productService.deleteProduct(productId);
        await loadProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleProductSubmit = async (product: Product) => {
    await loadProducts();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Store</h1>
        <Button
          onClick={handleAddProduct}
          className="bg-[#d9b535] hover:bg-[#c4a430] text-gray-900 font-medium"
        >
          Add Product
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-400">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-400">No products found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="bg-[#141414] border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">
                  {product.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-gray-300 mb-2">{product.description}</p>
                <p className="text-[#d9b535] font-bold">${product.price}</p>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleEditProduct(product)}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteProduct(product.id)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleProductSubmit}
        initialData={selectedProduct}
      />
    </div>
  );
} 