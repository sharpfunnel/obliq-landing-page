import Image from "next/image";
import { GALLERY_IMAGES } from "@/lib/content";

export default function Gallery() {
  return (
    <section id="gallery" className="bg-navy-950 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Project Renders &amp; Spaces</h2>
          <p className="mt-3 text-navy-400">
            A glimpse of the elevation, entrances and office spaces at {`Codename Tangent`}.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {GALLERY_IMAGES.map((img, i) => (
            <div
              key={img.src}
              className={`group relative aspect-square overflow-hidden rounded-xl ${
                i === 0 ? "col-span-2 row-span-2 aspect-square sm:aspect-auto" : ""
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover transition duration-500 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
