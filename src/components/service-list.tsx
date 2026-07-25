import { ServiceRow } from "@/components/service-row";
import type { PublicService } from "@/lib/types";

export function ServiceList({ services }: { services: PublicService[] }) {
  return (
    <section aria-labelledby="services-heading">
      <h2 id="services-heading" className="sr-only">
        Public services
      </h2>
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="hidden grid-cols-[minmax(13rem,1fr)_minmax(18rem,1.45fr)_10rem] gap-4 border-b px-6 py-3 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground lg:grid">
          <span>Service</span>
          <span>Recent checks</span>
          <span className="text-right">Status</span>
        </div>
        <ul className="divide-y">{services.map((service) => (
          <ServiceRow key={service.key} service={service} />
        ))}</ul>
      </div>
    </section>
  );
}

