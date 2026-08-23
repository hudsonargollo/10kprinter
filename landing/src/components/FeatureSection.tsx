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
    <section className="py-16 px-6">
      <div
        className={`mx-auto max-w-6xl grid md:grid-cols-2 gap-10 items-center ${
          reverse ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        <FadeIn>
          <h3 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">{title}</h3>
          <p className="mt-4 text-white/60 leading-relaxed max-w-md">{body}</p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-bg-inset p-2">
            <div className="rounded-xl overflow-hidden">
              <img src={image} alt={imageAlt} className="w-full block" loading="lazy" />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
