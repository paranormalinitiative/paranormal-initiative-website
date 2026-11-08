import { SlideCanvas } from "./SlideCanvas";
import type { Presentation, Slide } from "./model";

interface Props {
  presentation: Presentation;
  slide: Slide;
  width: number;
  className?: string;
}

/**
 * The thumbnail renders the real slide model in a read-only canvas.
 * Nova uses the same principle with its existing Konva canvas so thumbnails
 * cannot drift from the editing surface.
 */
export function PresentationThumbnail({ presentation, slide, width, className = "" }: Props) {
  return <div className={`nova-presentation-thumbnail ${className}`} aria-hidden="true"><SlideCanvas presentation={presentation} slide={slide} scale={width / presentation.width} interactive={false} onUpdateElement={() => undefined} /></div>;
}
