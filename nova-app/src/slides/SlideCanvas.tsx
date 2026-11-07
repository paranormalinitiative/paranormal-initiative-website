import { useEffect, useState } from "react";
import { Group, Layer, Rect, Stage, Text, Transformer } from "react-konva";
import type Konva from "konva";
import type { Presentation, Slide, SlideElement } from "./model";

interface Props {
  presentation: Presentation;
  slide: Slide;
  scale: number;
  onUpdateElement: (elementId: string, patch: Partial<SlideElement>) => void;
}

export function SlideCanvas({ presentation, slide, scale, onUpdateElement }: Props) {
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
            draggable: true,
            onClick: (event: Konva.KonvaEventObject<MouseEvent>) => select(element.id, event.target),
            onTap: (event: Konva.KonvaEventObject<Event>) => select(element.id, event.target),
            onDragEnd: (event: Konva.KonvaEventObject<DragEvent>) => onUpdateElement(element.id, { x: event.target.x(), y: event.target.y() }),
            onTransformEnd: (event: Konva.KonvaEventObject<Event>) => {
              const node = event.target;
              const width = Math.max(24, node.width() * node.scaleX());
              const height = Math.max(24, node.height() * node.scaleY());
              node.scaleX(1);
              node.scaleY(1);
              onUpdateElement(element.id, { x: node.x(), y: node.y(), width, height });
            }
          };
          if (element.kind === "text") {
            return <Text key={element.id} {...common} text={element.text} fontSize={element.fontSize} fill={element.fill} width={element.width} height={element.height} padding={8} verticalAlign="middle" />;
          }
          if (element.kind === "rect") {
            return <Rect key={element.id} {...common} width={element.width} height={element.height} fill={element.fill} cornerRadius={8} />;
          }
          return (
            <Group key={element.id} {...common}>
              <Rect width={element.width} height={element.height} stroke="#53645a" dash={[8, 6]} strokeWidth={2} />
              <Text text={element.placeholder} width={element.width} height={element.height} align="center" verticalAlign="middle" fontSize={18} fill="#53645a" />
            </Group>
          );
        })}
        {selectedId && transformerNode ? <Transformer nodes={[transformerNode]} rotateEnabled={false} keepRatio={false} /> : null}
      </Layer>
    </Stage>
  );
}
