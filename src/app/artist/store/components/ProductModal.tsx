"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import Image from "next/image";
import { Product, productService } from "@/services/productService";

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().min(1, "Price is required"),
  image: z.instanceof(File).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Product) => void;
  initialData?: Product;
}

export function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: ProductModalProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(initialData?.imageUrl || null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price || "",
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      form.setError("image", { message: "Invalid file type" });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      form.setError("image", { message: "File size must be less than 5MB" });
      return;
    }

    form.setValue("image", file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (data: ProductFormValues) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", data.price);
      if (data.image) {
        formData.append("image", data.image);
      }

      let response;
      if (initialData) {
        response = await productService.updateProduct(initialData.id, formData);
      } else {
        response = await productService.createProduct(formData);
      }
      
      onSubmit(response);
      onClose();
    } catch (error) {
      console.error("Error submitting product:", error);
      form.setError("root", { message: "Error submitting product" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {initialData ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Product name" 
                      {...field}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-[#d9b535]"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Product description" 
                      {...field}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-[#d9b535]"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Price</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      {...field}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-[#d9b535]"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Product Image</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="bg-gray-800 border-gray-700 text-white file:bg-[#d9b535] file:text-gray-900 file:border-0 file:mr-4 hover:file:bg-[#c4a430]"
                        {...field}
                      />
                      {previewImage && (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                          <Image
                            src={previewImage}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isUploading}
                className="bg-[#d9b535] hover:bg-[#c4a430] text-gray-900 font-medium"
              >
                {isUploading ? "Uploading..." : initialData ? "Update" : "Add"} Product
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 