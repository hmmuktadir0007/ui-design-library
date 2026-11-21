import { ImageOff } from "lucide-react";
import { useState } from "react";
import type { Style } from "../../types/style";

// All reference PNGs share this size (scripts/extract_styles.py CROP_RECT at 216 dpi).
export const IMAGE_WIDTH = 969;
export const IMAGE_HEIGHT = 777;

interface Props {
  style: Style;
  eager?: boolean;
  thumb?: boolean;
  className?: string;
}

function thumbPath(imagePath: string): string {
  return imagePath.replace(/\/images\/(style-\d+)\.png$/, "/images/thumbs/$1.webp");
}

export function StyleImage({ style, eager = false, thumb = false, className = "" }: Props) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        role="img"
        aria-label={`Reference image for ${style.name} failed to load`}
        className={`grid aspect-[969/777] w-full place-items-center bg-surface-2 text-center text-sm text-muted ${className}`}
      >
        <span className="flex flex-col items-center gap-2">
          <ImageOff className="size-6" aria-hidden />
          Image unavailable
        </span>
      </div>
    );
  }
  const img = (
    <img
      src={style.imagePath}
      alt={`Reference mockup for ${style.name}, from slide ${style.sourcePage}`}
      width={IMAGE_WIDTH}
      height={IMAGE_HEIGHT}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
      onError={() => setFailed(true)}
      className={`block aspect-[969/777] h-auto w-full bg-surface-2 object-contain ${className}`}
    />
  );
  if (!thumb) return img;
  return (
    <picture>
      <source srcSet={thumbPath(style.imagePath)} type="image/webp" />
      {img}
    </picture>
  );
}
