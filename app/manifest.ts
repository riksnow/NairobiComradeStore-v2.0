import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NairobiComradeStore",
    short_name: "NCS",
    description: "Real deals for the Nairobi comrade — fashion, electronics, home and more. Pay with M-Pesa or Cash on Delivery.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf9f5",
    theme_color: "#c96442",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
