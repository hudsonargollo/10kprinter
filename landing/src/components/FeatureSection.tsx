import { FadeIn } from "@/components/FadeIn";

export function FeatureSection({
  title,
  body,
  image,
  imageAlt,
  reverse = false,
}: {
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  reverse?: boolean;
}) {
  return (
    <section className="py-24 px-6">
      <div
        className={`mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center ${
          reverse ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        <FadeIn>
          <h3 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h3>
          <p className="mt-4 text-lg text-white/60 leading-relaxed max-w-md">{body}</p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div
            className="rounded-xl overflow-hidden border border-white/10 shadow-2xl"
            style={{ transform: reverse ? "perspective(1200px) rotateY(4deg) rotateX(1deg)" : "perspective(1200px) rotateY(-4deg) rotateX(1deg)" }}
          >
            <img src={image} alt={imageAlt} className="w-full block" loading="lazy" />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
