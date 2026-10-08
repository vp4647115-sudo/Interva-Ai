import Image from "next/image";

const candidatePhotos: Record<string, string> = {
  "Priya Sharma": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=96&h=96&fit=crop&crop=faces",
  "James Lee": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces",
  "Ana Costa": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=faces",
  "Omar Haddad": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&crop=faces",
};

export function AvatarStack({ names }: { names: string[] }) {
  return (
    <div className="flex -space-x-2">
      {names.map((n) => {
        const src = candidatePhotos[n];
        return src ? (
          <Image
            key={n}
            src={src}
            alt={n}
            title={n}
            width={36}
            height={36}
            className="h-9 w-9 rounded-full border-2 border-white object-cover"
          />
        ) : (
          <div
            key={n}
            title={n}
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-primary-soft text-xs font-bold text-primary"
          >
            {n
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
        );
      })}
    </div>
  );
}

export function TestimonialRow({
  quote,
  author,
  rating = 5,
}: {
  quote: string;
  author: string;
  rating?: number;
}) {
  return (
    <figure className="flex items-center gap-3">
      <div className="flex" aria-label={`Rated ${rating} out of 5`}>
        {Array.from({ length: rating }).map((_, i) => (
          <svg key={i} viewBox="0 0 20 20" fill="#F59E0B" className="h-4 w-4" aria-hidden>
            <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.29 3.96a1 1 0 00.95.69h4.16c.97 0 1.37 1.24.59 1.81l-3.37 2.45a1 1 0 00-.36 1.12l1.28 3.95c.3.93-.75 1.7-1.54 1.13l-3.36-2.44a1 1 0 00-1.18 0l-3.36 2.44c-.78.57-1.84-.2-1.54-1.13l1.29-3.95a1 1 0 00-.37-1.12L2.07 9.39c-.78-.57-.38-1.81.6-1.81h4.15a1 1 0 00.95-.69l1.28-3.96z" />
          </svg>
        ))}
      </div>
      <figcaption className="text-sm text-ink-secondary">
        “{quote}” — <span className="font-semibold text-ink-primary">{author}</span>
      </figcaption>
    </figure>
  );
}
