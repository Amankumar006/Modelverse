import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Modelverse — Every AI Model, Every Release",
    short_name: "Modelverse",
    description:
      "From frontier closed-source releases to open-weight breakthroughs, Modelverse tracks every model as it ships.",
    start_url: "/",
    display: "standalone",
    background_color: "#211D18",
    theme_color: "#211D18",
    icons: [
      {
        src: "/logos/android-chrome-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logos/android-chrome-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/logos/android-chrome-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logos/android-chrome-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/logos/apple-touch-icon-180.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
