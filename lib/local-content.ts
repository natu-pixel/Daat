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
  approach: "The supplied DAAT identity pairs a directional mark with a blue-led palette and Aspekta typography. This website translates those elements into a responsive system of generous type, modular layouts, and purposeful movement. The mark gives the studio a compact graphic signature, while the wordmark and typography establish a clear editorial voice. Blue is used as an accent across the pages, balancing expressive image-led sections with quieter areas for reading and navigation. The site brings brand identity, web development, and motion design into one visual language, then applies that language to service pages, project stories, and contact flows. The result is a studio study of how the identity can behave across a working digital experience rather than a set of disconnected brand mockups.",
  deliverables: ["Identity application", "Responsive website", "Digital design system"],
  gallery: [],
  studioStudy: true,
  galleryLayout: "scroll",
};

export const localProjects: Project[] = [
  {
    slug: "aerograin", title: "AeroGrain", category: "Brand identity",
    description: "An urban-farming identity rooted in fresh greens, a grain-inspired mark, and a visual language that moves from screens to spaces.",
    approach: "The AeroGrain collection connects its flowing symbol and green palette across digital interfaces, apparel, campaign graphics, and an exhibition environment. The identity uses a grain-inspired mark to link the urban-farming idea to the brand name, while the fresh green palette gives the applications a consistent visual cue. The project shows how one identity can move between a mobile interface, campaign artwork, clothing, signage, and a physical display without losing recognition. The image collection shifts between close-up brand details and wider scenes, making it possible to see the mark at different sizes and in different settings. Green provides continuity across the varied materials, while photography of plants and growing spaces reinforces the subject matter. Together, the applications present AeroGrain as a visual system with room to work across product, promotion, and environment.",
    deliverables: ["Visual identity", "Brand applications", "Campaign visuals"],
    cover: aero[0], gallery: aero, studioStudy: false, galleryLayout: "scroll",
  },
  {
    slug: "pulsedock", title: "PulseDock", category: "Brand identity",
    description: "A wave-led technology identity. High-energy color meets a clean, adaptable system for digital and physical touchpoints.",
    approach: "The PulseDock work pairs an expressive wave symbol with a clear wordmark, then carries the identity into wearables, packaging, and outdoor applications. The contrast between the energetic purple imagery and the simple white mark keeps the technology brand visible across different formats. The selected applications include a shopping bag, a smartwatch, and an outdoor campaign, showing how the same recognizable elements can support both product and promotional material. The wave shape gives the identity a natural link to movement and connectivity, while the restrained wordmark remains legible beside it. The gallery moves from the primary identity to practical objects and campaign use, so visitors can compare the mark in both close-up and in-context views. This range gives the technology-led concept a consistent presence across screens, accessories, and public-facing creative.",
    deliverables: ["Visual identity", "Brand applications", "Outdoor campaign"],
    cover: pulse[0], gallery: pulse, studioStudy: false, galleryLayout: "scroll",
  },
  {
    slug: "solvanta-labs", title: "Solvanta Labs", category: "Brand identity",
    description: "A technology and energy identity with a warm accent, a distinctive linked symbol, and applications at every scale.",
    approach: "Black-and-white imagery, a connected symbol, and orange accents bring the Solvanta Labs collection together across print, digital layouts, apparel, and environmental graphics. The system balances a restrained base with a warm accent color, giving the identity a consistent thread across presentation materials, posters, clothing, social graphics, and a large interior wall. The linked mark provides a repeatable graphic element that works at both small and large scales. The presentation combines identity views with examples of how the graphic system can be used, from stationery and apparel to a stage screen and interior display. Monochrome photography keeps the compositions grounded, while orange adds a focused point of emphasis. The result is a flexible set of applications that gives the energy and technology themes a shared visual frame without relying on one format alone.",
    deliverables: ["Visual identity", "Digital applications", "Environmental graphics"],
    cover: solvanta[2], gallery: solvanta, studioStudy: false, galleryLayout: "scroll",
  },
  {
    slug: "apex", title: "Apex", category: "Brand identity",
    description: "A sharp red-and-black identity, expressed through a directional mark, bold patterns, and considered brand applications.",
    approach: "The Apex collection brings its red symbol into apparel, app icons, stationery, signage, and social layouts, supported by a contrasting graphic pattern. Red and black create a strong visual contrast, while the directional shape gives the identity a distinctive mark that can stand alone or sit beside the wordmark. The applications show the system across both digital placements and physical brand materials, including an app icon, a business card, clothing, and campaign graphics. Across the gallery, the symbol shifts from a small interface icon to a larger graphic on printed and worn pieces. Pattern and color provide supporting elements, helping the identity feel connected when the main mark is used in different ways. These examples focus on the relationship between the core symbol and its applications, showing how a compact identity can carry through social content, stationery, and environmental use.",
    deliverables: ["Visual identity", "Brand applications", "Social graphics"],
    cover: apex[3], gallery: apex, studioStudy: false, galleryLayout: "scroll",
  },
  {
    slug: "posters-and-campaigns", title: "Posters & campaigns", category: "Campaign design",
    description: "Ten campaign pieces across sport, lifestyle, communication, finance, and property. Different audiences. Distinctive visual voices.",
    approach: "This collection brings together ten campaign designs for audiences in sport, lifestyle, communication, finance, and property. Each piece uses its own subject, palette, and composition to suit its message, from padel and furniture imagery to mobile communication, financial partnership, and real-estate promotion. Together, the posters show how art direction and graphic design can make separate campaign messages clear while giving each one a distinct visual character. The gallery is intentionally varied: some pieces use people and objects as the main focus, while others rely on typography, color, and simple graphic layouts. The sequence gives each campaign room to stand on its own and makes the differences between subject areas easy to see. It also shows the range of formats in which campaign design can appear, including social artwork and larger poster-style compositions. This is a selection of creative directions, not a single shared campaign identity.",
    deliverables: ["Campaign graphics", "Poster design", "Social artwork"],
    cover: posters[0], gallery: posters, studioStudy: false, galleryLayout: "grid",
  },
  studioStudyProject,
];
