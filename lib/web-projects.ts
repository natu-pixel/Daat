export type WebProject = {
  name: string;
  domain: string;
  url?: string;
  status: "live" | "in-development";
  image?: { url: string; alt: string };
};

export const webProjects: WebProject[] = [
  {
    name: "Qeero",
    domain: "qeero.fr",
    url: "https://www.qeero.fr",
    status: "live",
    image: { url: "/web/qeero-home.jpg", alt: "Qeero website homepage with the headline “Votre expert en communication visuelle.”" },
  },
  {
    name: "NAT Entertainment",
    domain: "natentertainment.org",
    url: "https://natentertainment.org",
    status: "live",
    image: { url: "/web/natentertainment.jpg", alt: "NAT Entertainment website homepage with the headline “Life deserves a better scene.”" },
  },
  {
    name: "Bren Store",
    domain: "brenstore-pxzh.vercel.app",
    url: "https://brenstore-pxzh.vercel.app/",
    status: "in-development",
    image: { url: "/web/brenstore.jpg", alt: "Bren Store online shop homepage, currently in development" },
  },
];
