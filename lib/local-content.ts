import type { Project } from "./content-schema";
import artwork from "../public/works/manifest.json";

export const localSettings = {
  headline: "Clarity in thought.\nImpact by design.",
  introduction: "DAAT brings brand identity, web development, and motion together. Distinctive by design. Connected by purpose.",
  about: "DAAT is a design-led studio working at the intersection of identity and technology. We connect the way a brand looks, moves, and works into one coherent experience.",
};

export const localServices = [
  {
    title: "Brand identity",
    description: "A clear point of view. A distinctive visual language. A system that feels like you at every touchpoint.",
    items: ["Visual identity", "Art direction", "Brand systems", "Brand guidelines"],
  },
  {
    title: "Web development",
    description: "Your identity, made interactive. Thoughtfully designed websites that balance expression with effortless usability.",
    items: ["Web design", "User experience", "Creative development", "CMS integration"],
  },
  {
    title: "Motion design",
    description: "Give your brand a sense of movement. From the smallest interaction to the story that brings it all together.",
    items: ["Motion identity", "Brand animation", "Digital interactions", "Motion guidelines"],
  },
];

type Artwork = { url: string; width: number; height: number };

function gallery(assets: Artwork[], captions: string[]): Project["gallery"] {
  if (assets.length !== captions.length) throw new Error("Portfolio artwork and captions do not match. Update local-content after preparing assets.");
  return assets.map((asset, index) => ({ kind: "image", ...asset, alt: captions[index] }));
}

const aero = gallery(artwork.aero, [
  "AeroGrain identity over a sunlit grain field",
  "AeroGrain grain-inspired mark and green mobile interface",
  "AeroGrain Urban Farming Reimagined outdoor campaign",
  "AeroGrain hoodie and reusable shopping bag",
  "AeroGrain urban farming presentation",
  "AeroGrain campaign display in a plant-filled interior",
  "AeroGrain green modular exhibition wall",
  "AeroGrain exterior signage and hoodie application",
]);
const apex = gallery(artwork.apex.filter((_, index) => index !== 3), [
  "Apex red symbol on apparel and a mobile app icon",
  "Apex identity across signage, packaging, digital screens, and a graphic pattern",
  "Apex social profile and red-and-yellow campaign graphics",
  "Apex red-and-black wordmark and transparent business card",
]);
const pulse = gallery(artwork.pulse, [
  "PulseDock white identity over a purple virtual-reality portrait",
  "PulseDock wave-mark construction and branded shopping bag",
  "PulseDock branded tote in a black-and-white interior",
  "PulseDock identity on a smartwatch",
  "PulseDock Stay Charged Stay Moving outdoor campaign",
]);
const solvanta = gallery(artwork.solvanta, [
  "Solvanta Labs identity over a black-and-white technology image",
  "Solvanta Labs exterior signage and orange stationery",
  "Solvanta Labs advanced energy systems poster series",
  "Solvanta Labs identity on a presentation-stage screen",
  "Solvanta Labs website and social profile applications",
  "Solvanta Labs branded tote and T-shirt",
  "Solvanta Labs Powering Smarter Tomorrows billboard",
  "Solvanta Labs large-format interior brand wall",
]);
solvanta.push(...gallery([artwork.apex[3]], ["Solvanta Labs black-and-yellow social post series"]));
const posters = gallery(artwork.poster, [
  "Meri security campaign with two uniformed team members",
  "Smart Ethio education campaign with students in a classroom",
  "Holistic Speciality Dental Clinic blue dental-care campaign",
  "Holistic Speciality Dental Clinic smile campaign",
  "Holistic Speciality Dental Clinic orthodontic campaign",
  "Holistic Speciality Dental Clinic treatment explainer",
  "Holistic Speciality Dental Clinic toothbrush campaign",
  "Smart Ethio orange mobile-learning campaign",
  "Holistic Speciality Dental Clinic orthodontic treatment graphic",
  "Three Stars landscape and yellow-flower campaign",
  "Moon Fitness Center green-and-yellow campaign",
  "Holistic Speciality Dental Clinic green seasonal campaign",
  "Three Stars rehabilitation equipment campaign with crutches",
  "Meri security team campaign in blue",
  "Three Stars rehabilitation campaign with a stethoscope",
  "Meri security services campaign with two team members",
  "Tropical Padel racket and court campaign",
  "Bloom warm-toned seating and lifestyle campaign",
  "Qeero mobile-conversation campaign",
  "Qeero agency green mobile-conversation campaign",
  "Qeero agency communication campaign with a laptop",
  "Qeero agency creative strategy campaign",
  "Qeero agency campaign shown on an outdoor billboard",
  "Tropical Padel blue-court team campaign",
  "Financial partnership campaign in warm neutral tones",
  "Property campaign with a house and pale-blue typography",
]);

export const studioStudyProject: Project = {
  slug: "daat-brand-system",
  title: "DAAT, by design.",
  category: "Brand identity",
  year: "2026",
  description: "An introduction to our own visual world. A directional mark, an expressive blue palette, and a digital-first identity.",
  challenge: "Bring identity, development, and motion into a single visual language for DAAT. Make it expressive enough to stand apart and clear enough to work across digital touchpoints.",
  approach: "The supplied DAAT identity pairs a directional mark with a blue-led palette and Aspekta typography. This website translates those elements into a responsive system of generous type, modular layouts, and purposeful movement.",
  deliverables: ["Identity application", "Responsive website", "Digital design system"],
  gallery: [],
  studioStudy: true,
  galleryLayout: "scroll",
};

export const localProjects: Project[] = [
  {
    slug: "aerograin", title: "AeroGrain", category: "Brand identity",
    description: "An urban-farming identity rooted in fresh greens, a grain-inspired mark, and a visual language that moves from screens to spaces.",
    approach: "The AeroGrain collection connects its flowing symbol and green palette across digital interfaces, apparel, campaign graphics, and an exhibition environment.",
    deliverables: ["Visual identity", "Brand applications", "Campaign visuals"],
    cover: aero[0], gallery: aero, studioStudy: false, galleryLayout: "scroll",
  },
  {
    slug: "pulsedock", title: "PulseDock", category: "Brand identity",
    description: "A wave-led technology identity. High-energy color meets a clean, adaptable system for digital and physical touchpoints.",
    approach: "The PulseDock work pairs an expressive wave symbol with a clear wordmark, then carries the identity into wearables, packaging, and outdoor applications.",
    deliverables: ["Visual identity", "Brand applications", "Outdoor campaign"],
    cover: pulse[0], gallery: pulse, studioStudy: false, galleryLayout: "scroll",
  },
  {
    slug: "solvanta-labs", title: "Solvanta Labs", category: "Brand identity",
    description: "A technology and energy identity with a warm accent, a distinctive linked symbol, and applications at every scale.",
    approach: "Black-and-white imagery, a connected symbol, and orange accents bring the Solvanta Labs collection together across print, digital layouts, apparel, and environmental graphics.",
    deliverables: ["Visual identity", "Digital applications", "Environmental graphics"],
    cover: solvanta[2], gallery: solvanta, studioStudy: false, galleryLayout: "scroll",
  },
  {
    slug: "apex", title: "Apex", category: "Brand identity",
    description: "A sharp red-and-black identity, expressed through a directional mark, bold patterns, and considered brand applications.",
    approach: "The Apex collection brings its red symbol into apparel, app icons, stationery, signage, and social layouts, supported by a contrasting graphic pattern.",
    deliverables: ["Visual identity", "Brand applications", "Social graphics"],
    cover: apex[3], gallery: apex, studioStudy: false, galleryLayout: "scroll",
  },
  {
    slug: "posters-and-campaigns", title: "Posters & campaigns", category: "Campaign design",
    description: "Twenty-six pieces across education, healthcare, security, sport, and everyday business. Different audiences. Distinctive visual voices.",
    deliverables: ["Campaign graphics", "Poster design", "Social artwork"],
    cover: posters[2], gallery: posters, studioStudy: false, galleryLayout: "grid",
  },
  studioStudyProject,
];
