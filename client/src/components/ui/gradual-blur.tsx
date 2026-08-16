import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const LAYERS = [
  { blur: 0.247, mask: "transparent 0%, black 10%, black 20%, transparent 30%" },
  { blur: 0.326, mask: "transparent 10%, black 20%, black 30%, transparent 40%" },
  { blur: 0.431, mask: "transparent 20%, black 30%, black 40%, transparent 50%" },
  { blur: 0.568, mask: "transparent 30%, black 40%, black 50%, transparent 60%" },
  { blur: 0.75, mask: "transparent 40%, black 50%, black 60%, transparent 70%" },
  { blur: 0.99, mask: "transparent 50%, black 60%, black 70%, transparent 80%" },
  { blur: 1.306, mask: "transparent 60%, black 70%, black 80%, transparent 90%" },
  { blur: 1.723, mask: "transparent 70%, black 80%, black 90%, transparent 100%" },
  { blur: 2.274, mask: "transparent 80%, black 90%, black 100%" },
  { blur: 3, mask: "transparent 90%, black 100%" },
] as const;

export function GradualBlur({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none", className)} {...props}>
      <div className="relative h-full w-full">
        {LAYERS.map((layer, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              opacity: 1,
              maskImage: `linear-gradient(to bottom, ${layer.mask})`,
              WebkitMaskImage: `linear-gradient(to bottom, ${layer.mask})`,
              backdropFilter: `blur(${layer.blur}rem)`,
              WebkitBackdropFilter: `blur(${layer.blur}rem)`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
