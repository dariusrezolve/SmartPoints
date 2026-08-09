import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SmartPoints",
    short_name: "SmartPoints",
    description: "A simple family points tracker.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7fdf9",
    theme_color: "#059669",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
