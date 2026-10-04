import Image from "next/image";
import type { Project } from "@/lib/content-schema";
import { Reveal } from "./reveal";

export function MasonryGallery({ media }: { media: Project["gallery"] }) {
  return (
    <div className="masonry-gallery">
      {media.map((asset, index) => <figure key={`${asset.url}-${index}`}><Reveal kind="image" delay={index % 3 * .06}>
        {asset.kind === "image"
          ? <Image src={asset.url} alt={asset.alt} width={asset.width || 1280} height={asset.height || 960} sizes="(max-width: 600px) 100vw, (max-width: 1050px) 50vw, 33vw" />
          : <video controls preload="none" poster={asset.poster} aria-label={asset.alt}><source src={asset.url} />Your browser does not support this video.</video>}
        <figcaption><span>#{String(index + 1).padStart(3, "0")}</span><span>{asset.alt}</span></figcaption>
      </Reveal>
      </figure>)}
    </div>
  );
}
