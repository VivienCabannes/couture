interface Props {
  svgContent: string;
}

export function PatternPreview({ svgContent }: Props) {
  return (
    <div
      className="h-full w-full overflow-auto p-4"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
