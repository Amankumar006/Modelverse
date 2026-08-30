import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Modelverse",
    short_name: "Modelverse",
    description: "The Open Foundation Model Catalog and Intelligence Platform",
    start_url: "/",
    display: "standalone",
    background_color: "#141414",
    theme_color: "#D97757",
    icons: [
      {
        src: "/logos/android-chrome-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logos/android-chrome-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/logos/apple-touch-icon-180.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
