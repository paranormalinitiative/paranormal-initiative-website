import { useEffect, useState } from "react";
import { Ellipse, Group, Image as KonvaImage, Layer, Line, Rect, Stage, Text, Transformer } from "react-konva";
import type Konva from "konva";
import type { Presentation, Slide, SlideElement } from "./model";

interface Props {
  presentation: Presentation;
  slide: Slide;
  scale: number;
  onUpdateElement: (elementId: string, patch: Partial<SlideElement>) => void;
  onSelectElement?: (elementId: string | null) => void;
  interactive?: boolean;
  presenter?: boolean;
}

export function SlideCanvas({ presentation, slide, scale, onUpdateElement, onSelectElement, interactive = true, presenter = false }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [transformerNode, setTransformerNode] = useState<Konva.Node | null>(null);
  const [fadeIn, setFadeIn] = useState(!presenter || slide.transition !== "fade");

  useEffect(() => {
    if (!presenter || slide.transition !== "fade") {
      setFadeIn(true);
      return;
    }
    setFadeIn(false);
    const timer = window.setTimeout(() => setFadeIn(true), 30);
    return () => window.clearTimeout(timer);
  }, [presenter, slide.id, slide.transition]);

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
      <Layer opacity={fadeIn ? 1 : 0}>
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
            return <Text key={element.id} {...common} text={displayText} fontFamily={element.fontFamily} fontStyle={element.fontStyle} fontSize={isLongCoverTitle ? Math.min(element.fontSize, 34) : element.fontSize} fontWeight={element.fontWeight} align={element.align} fill={element.fill} width={element.width} height={displayHeight} padding={8} verticalAlign="middle" wrap="word" />;
          }
          if (element.kind === "rect") {
            if (element.shape === "ellipse") {
              return <Ellipse key={element.id} {...common} radiusX={element.width / 2} radiusY={element.height / 2} fill={element.fill} />;
            }
            return <Rect key={element.id} {...common} width={element.width} height={element.height} fill={element.fill} cornerRadius={element.shape === "roundRect" ? 18 : 8} />;
          }
          if (element.kind === "line") {
            return <Line key={element.id} {...common} points={[0, 0, element.width, element.height]} stroke={element.stroke} strokeWidth={element.strokeWidth} lineCap="round" />;
          }
          if (element.kind === "table") {
            const rowCount = element.rows.length;
            const columnCount = Math.max(1, ...element.rows.map(row => row.length));
            const cellWidth = element.width / columnCount;
            const cellHeight = element.height / rowCount;
            return <Group key={element.id} {...common}>
              <Rect width={element.width} height={element.height} fill={element.cellFill || "#f4f7f2"} stroke={element.stroke || "#9bb6a5"} strokeWidth={2} />
              {element.rows.map((row, rowIndex) => row.map((value, columnIndex) => <Group key={`${rowIndex}-${columnIndex}`} x={columnIndex * cellWidth} y={rowIndex * cellHeight}>
                {rowIndex === 0 ? <Rect width={cellWidth} height={cellHeight} fill={element.headerFill || "#2f5f48"} /> : null}
                <Text text={value} width={cellWidth} height={cellHeight} padding={7} fontSize={16} fill={rowIndex === 0 ? "#ffffff" : "#1d281f"} verticalAlign="middle" wrap="word" />
              </Group>))}
              {Array.from({ length: columnCount - 1 }, (_, columnIndex) => <Line key={`column-${columnIndex}`} points={[(columnIndex + 1) * cellWidth, 0, (columnIndex + 1) * cellWidth, element.height]} stroke={element.stroke || "#9bb6a5"} strokeWidth={1} />)}
              {Array.from({ length: rowCount - 1 }, (_, rowIndex) => <Line key={`row-${rowIndex}`} points={[0, (rowIndex + 1) * cellHeight, element.width, (rowIndex + 1) * cellHeight]} stroke={element.stroke || "#9bb6a5"} strokeWidth={1} />)}
            </Group>;
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
