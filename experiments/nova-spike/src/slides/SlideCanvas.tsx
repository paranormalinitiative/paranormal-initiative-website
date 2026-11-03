import { useEffect, useState } from "react";
import { Stage, Layer, Rect, Text, Transformer, Group } from "react-konva";
import type Konva from "konva";
import type { Slide, SlideElement, Presentation } from "./model";

interface SlideCanvasProps {
  presentation: Presentation;
  slide: Slide;
  slideIndex: number;
  scale: number;
  onUpdateElement: (elementId: string, patch: Partial<SlideElement>) => void;
}

// Adapter only: reads model elements, emits model patches. It owns selection
// (view state) and never stores geometry anywhere but the model.
export function SlideCanvas({ presentation, slide, scale, onUpdateElement }: SlideCanvasProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [transformerNode, setTransformerNode] = useState<Konva.Node | null>(null);

  useEffect(() => {
    window.__novaSpike = { ...window.__novaSpike, selection: () => selectedId };
  }, [selectedId]);

  const selectNode = (id: string, node: Konva.Node | null) => {
    setSelectedId(id);
    setTransformerNode(node);
  };

  return (
    <Stage
      width={presentation.width * scale}
      height={presentation.height * scale}
      scaleX={scale}
      scaleY={scale}
      onMouseDown={(e) => {
        if (e.target === e.target.getStage()) selectNode("", null);
      }}
    >
      <Layer>
        <Rect
          x={0}
          y={0}
          width={presentation.width}
          height={presentation.height}
          fill={slide.background}
          listening={false}
        />
        {slide.elements.map((el) => {
          const common = {
            id: el.id,
            x: el.x,
            y: el.y,
            draggable: true,
            onClick: (e: Konva.KonvaEventObject<MouseEvent>) => selectNode(el.id, e.target),
            onTap: (e: Konva.KonvaEventObject<Event>) => selectNode(el.id, e.target),
            onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) =>
              onUpdateElement(el.id, { x: e.target.x(), y: e.target.y() }),
            onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
              const node = e.target;
              const width = Math.max(10, node.width() * node.scaleX());
              const height = Math.max(10, node.height() * node.scaleY());
              node.scaleX(1);
              node.scaleY(1);
              onUpdateElement(el.id, { x: node.x(), y: node.y(), width, height });
            },
          };
          if (el.kind === "text") {
            return (
              <Text
                key={el.id}
                {...common}
                text={el.text}
                fontSize={el.fontSize}
                fill={el.fill}
                width={el.width}
                height={el.height}
              />
            );
          }
          if (el.kind === "rect") {
            return (
              <Rect
                key={el.id}
                {...common}
                width={el.width}
                height={el.height}
                fill={el.fill}
              />
            );
          }
          return (
            <Group key={el.id} {...common}>
              <Rect width={el.width} height={el.height} stroke="#555" dash={[6, 4]} />
              <Text
                text={el.placeholder}
                width={el.width}
                height={el.height}
                align="center"
                verticalAlign="middle"
                fontSize={16}
              />
            </Group>
          );
        })}
        {selectedId && transformerNode && (
          <Transformer nodes={[transformerNode]} rotateEnabled={false} />
        )}
      </Layer>
    </Stage>
  );
}
