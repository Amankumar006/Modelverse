"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

interface FallbackImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
}

export default function FallbackImage({ 
  src, 
  fallbackSrc = "/images/news/news_featured.jpg", 
  alt, 
  ...rest 
}: FallbackImageProps) {
  const [hasError, setHasError] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setHasError(false);
  }

  const currentSrc = hasError ? fallbackSrc : (src || fallbackSrc);

  return (
    <Image
      {...rest}
      src={currentSrc}
      alt={alt || "Image"}
      onError={() => {
        setHasError(true);
      }}
    />
  );
}
