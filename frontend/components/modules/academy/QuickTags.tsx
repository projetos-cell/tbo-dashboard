"use client";

const TAGS = [
  "Branding Imobiliário",
  "Estratégia de Lançamento",
  "Visualização 3D",
  "Marketing Digital",
];

interface QuickTagsProps {
  onTagClick?: (tag: string) => void;
}

export function QuickTags({ onTagClick }: QuickTagsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {TAGS.map((tag) => (
        <button
          key={tag}
          onClick={() => onTagClick?.(tag)}
          className="cursor-pointer rounded-full border border-border/50 bg-secondary/30 px-4 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
