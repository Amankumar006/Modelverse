"use client";

import Image, { ImageProps } from "next/image";
import { useState, useEffect } from "react";

interface FallbackImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
}

export default function FallbackImage({ 
  src, 
  fallbackSrc = "/images/news/news_featured.jpg", 
  alt, 
  ...rest 
}: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  // If the src prop changes (e.g. during client navigation), reset to the new src
  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <Image
      {...rest}
      src={imgSrc || fallbackSrc}
      alt={alt || "Image"}
      onError={() => {
        setImgSrc(fallbackSrc);
      }}
    />
  );
}
