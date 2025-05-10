"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState } from "react";

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FiltersModal({ isOpen, onClose }: FiltersModalProps) {
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

  // Local state for form values
  const [localSearch, setLocalSearch] = useState(search);
  const [localArtist, setLocalArtist] = useState(artist);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [localSortBy, setLocalSortBy] = useState(sortBy);
  const [localSortOrder, setLocalSortOrder] = useState(sortOrder);

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

  const handleApplyFilters = () => {
    updateFilters({
      search: localSearch,
      artist: localArtist,
      minPrice: localMinPrice,
      maxPrice: localMaxPrice,
      sortBy: localSortBy,
      sortOrder: localSortOrder,
    });
    onClose();
  };

  const handleReset = () => {
    setLocalSearch("");
    setLocalArtist("");
    setLocalMinPrice(0);
    setLocalMaxPrice(1000);
    setLocalSortBy("createdAt");
    setLocalSortOrder("desc");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#141414] border-gray-800 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Filters
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="search" className="text-gray-200">Search</Label>
            <Input
              id="search"
              placeholder="Search products..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white focus:border-[#d9b535] focus:ring-[#d9b535]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="artist" className="text-gray-200">Artist</Label>
            <Input
              id="artist"
              placeholder="Filter by artist..."
              value={localArtist}
              onChange={(e) => setLocalArtist(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white focus:border-[#d9b535] focus:ring-[#d9b535]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort" className="text-gray-200">Sort By</Label>
            <Select 
              value={`${localSortBy}-${localSortOrder}`} 
              onValueChange={(value) => {
                const [field, order] = value.split("-");
                setLocalSortBy(field);
                setLocalSortOrder(order);
              }}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-[#d9b535] focus:ring-[#d9b535]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-[#141414] border-gray-800">
                <SelectItem value="createdAt-desc">Newest</SelectItem>
                <SelectItem value="createdAt-asc">Oldest</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
                <SelectItem value="name-desc">Name: Z to A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-200">Price Range</Label>
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(Number(e.target.value))}
                className="w-24 bg-gray-800 border-gray-700 text-white focus:border-[#d9b535] focus:ring-[#d9b535]"
                min="0"
              />
              <span className="text-gray-400">to</span>
              <Input
                type="number"
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(Number(e.target.value))}
                className="w-24 bg-gray-800 border-gray-700 text-white focus:border-[#d9b535] focus:ring-[#d9b535]"
                min="0"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-between pt-4 border-t border-gray-800">
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Reset
          </Button>
          <Button
            onClick={handleApplyFilters}
            className="bg-[#d9b535] hover:bg-[#c4a430] text-gray-900 font-medium"
          >
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 