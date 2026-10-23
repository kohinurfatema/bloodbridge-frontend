import Image, { type StaticImageData } from "next/image";

import { cn } from "@/lib/utils";

interface BrandPhotoProps {
  src: StaticImageData;
  sizes: string;
  className?: string;
}

// Decorative photo tinted by the brand-surface behind it. A static import gives
// next/image the dimensions and a blur placeholder, so nothing shifts while it loads.
export function BrandPhoto({ src, sizes, className }: BrandPhotoProps) {
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes={sizes}
      placeholder="blur"
      className={cn("pointer-events-none object-cover opacity-20 mix-blend-luminosity dark:opacity-10", className)}
    />
  );
}
