import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  developer: string;
  family?: {
    slug: string;
    label: string;
  };
  model?: {
    slug: string;
    name: string;
  };
}

export default function Breadcrumb({ developer, family, model }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-gray-400">
      <Link href="/" className="hover:text-white transition-colors">
        Home
      </Link>
      <ChevronRight size={12} className="opacity-40 shrink-0" />
      <Link href="/models" className="hover:text-white transition-colors">
        Models
      </Link>
      <ChevronRight size={12} className="opacity-40 shrink-0" />
      
      {family || model ? (
        <Link
          href={`/models/developer/${encodeURIComponent(developer)}`}
          className="hover:text-white transition-colors truncate max-w-[120px]"
        >
          {developer}
        </Link>
      ) : (
        <span className="text-white truncate max-w-[150px] font-medium">{developer}</span>
      )}

      {family && (
        <>
          <ChevronRight size={12} className="opacity-40 shrink-0" />
          {model ? (
            <Link
              href={`/models/family/${family.slug}`}
              className="hover:text-white transition-colors truncate max-w-[120px]"
            >
              {family.label}
            </Link>
          ) : (
            <span className="text-white truncate max-w-[150px] font-medium">{family.label}</span>
          )}
        </>
      )}

      {model && (
        <>
          <ChevronRight size={12} className="opacity-40 shrink-0" />
          <span className="text-white truncate max-w-[150px] sm:max-w-xs font-medium">{model.name}</span>
        </>
      )}
    </nav>
  );
}
