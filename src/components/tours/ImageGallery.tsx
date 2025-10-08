"use client";

// Static desktop-only image gallery: show the main image and non-interactive thumbnails
import React from 'react';

interface ImageGalleryProps {
  images: string[];
  mainImage?: string | null;
}

export default function ImageGallery({ images, mainImage }: ImageGalleryProps) {
  const allImages = mainImage ? [mainImage, ...images] : images;

  // Desktop-only static gallery: always show the first image and non-interactive thumbnails
  const main = allImages && allImages.length > 0 ? allImages[0] : null;

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-lg bg-gray-100">
        <div className="aspect-video h-[420px] overflow-hidden">
          {main && main.startsWith('/api/placeholder') ? (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <span className="text-white text-xl font-semibold">Tour Image</span>
            </div>
          ) : (
            <img src={main || '/placeholder-tour.svg'} alt="Tour main image" className="w-full h-full object-cover" />
          )}
        </div>
      </div>

      {/* Non-interactive Thumbnails */}
      {allImages && allImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {allImages.slice(0, 5).map((image, index) => (
            <div key={index} className="relative h-24 overflow-hidden rounded-md border-2 border-gray-200">
              {image.startsWith('/api/placeholder') ? (
                <div className="w-full h-full bg-gradient-to-br from-blue-300 to-purple-400 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">{index + 1}</span>
                </div>
              ) : (
                <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
              )}
              {index === 4 && allImages.length > 5 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-semibold">+{allImages.length - 5}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
