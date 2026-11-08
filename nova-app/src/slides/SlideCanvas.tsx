import { useEffect, useState } from "react";
import { Group, Image as KonvaImage, Layer, Rect, Stage, Text, Transformer } from "react-konva";
import type Konva from "konva";
import type { Presentation, Slide, SlideElement } from "./model";

interface Props {
  presentation: Presentation;
  slide: Slide;
  scale: number;
  onUpdateElement: (elementId: string, patch: Partial<SlideElement>) => void;
  onSelectElement?: (elementId: string | null) => void;
  interactive?: boolean;
}

export function SlideCanvas({ presentation, slide, scale, onUpdateElement, onSelectElement, interactive = true }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [transformerNode, setTransformerNode] = useState<Konva.Node | null>(null);

  useEffect(() => {
    if (!slide.elements.some(element => element.id === selectedId)) {
      setSelectedId(null);
      setTransformerNode(null);
    }
  }, [slide.elements, selectedId]);

  const select = (id: string, node: Konva.Node | null) => {
    setSelectedId(id);
    setTransformerNode(node);
    onSelectElement?.(id || null);
  };

  return (
    <Stage
      width={presentation.width * scale}
      height={presentation.height * scale}
      scaleX={scale}
      scaleY={scale}
      onMouseDown={event => { if (event.target === event.target.getStage()) select("", null); }}
      data-testid="slide-canvas"
    >
      <Layer>
        <Rect x={0} y={0} width={presentation.width} height={presentation.height} fill={slide.background} listening={false} />
        {slide.elements.map(element => {
          const common = {
            id: element.id,
            x: element.x,
            y: element.y,
            draggable: interactive,
            onClick: interactive ? (event: Konva.KonvaEventObject<MouseEvent>) => select(element.id, event.target) : undefined,
            onTap: interactive ? (event: Konva.KonvaEventObject<Event>) => select(element.id, event.target) : undefined,
            onDragEnd: interactive ? (event: Konva.KonvaEventObject<DragEvent>) => onUpdateElement(element.id, { x: event.target.x(), y: event.target.y() }) : undefined,
            onTransformEnd: interactive ? (event: Konva.KonvaEventObject<Event>) => {
              const node = event.target;
              const width = Math.max(24, node.width() * node.scaleX());
              const height = Math.max(24, node.height() * node.scaleY());
              node.scaleX(1);
              node.scaleY(1);
              onUpdateElement(element.id, { x: node.x(), y: node.y(), width, height });
            } : undefined
          };
          if (element.kind === "text") {
            const isLongCoverTitle = slide.id === presentation.slides[0]?.id && element.x === 112 && element.y === 76 && element.text.length > 36;
            const displayText = isLongCoverTitle ? element.text.replace(": ", ":\n") : element.text;
            const displayHeight = isLongCoverTitle ? Math.max(element.height, 112) : element.height;
            return <Text key={element.id} {...common} text={displayText} fontSize={isLongCoverTitle ? Math.min(element.fontSize, 34) : element.fontSize} fill={element.fill} width={element.width} height={displayHeight} padding={8} verticalAlign="middle" wrap="word" />;
          }
          if (element.kind === "rect") {
            return <Rect key={element.id} {...common} width={element.width} height={element.height} fill={element.fill} cornerRadius={8} />;
          }
          return (
            <Group key={element.id} {...common}>
              {element.src ? <SlideImage src={element.src} width={element.width} height={element.height} /> : <>
                <Rect width={element.width} height={element.height} stroke="#53645a" dash={[8, 6]} strokeWidth={2} />
                <Text text={element.placeholder} width={element.width} height={element.height} align="center" verticalAlign="middle" fontSize={18} fill="#53645a" />
              </>}
            </Group>
          );
        })}
        {selectedId && transformerNode ? <Transformer nodes={[transformerNode]} rotateEnabled={false} keepRatio={false} /> : null}
      </Layer>
    </Stage>
  );
}

function SlideImage({ src, width, height }: { src: string; width: number; height: number }) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const next = new window.Image();
    next.onload = () => setImage(next);
    next.src = src;
    return () => { next.onload = null; };
  }, [src]);
  return image ? <KonvaImage image={image} width={width} height={height} cornerRadius={8} /> : <Rect width={width} height={height} stroke="#53645a" dash={[8, 6]} strokeWidth={2} />;
}
