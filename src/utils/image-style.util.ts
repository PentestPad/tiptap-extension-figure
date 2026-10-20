export type ImageAlignment = "left" | "center" | "right";

const alignmentMargins: Record<ImageAlignment, { left: string; right: string }> = {
  left: { left: "0px", right: "auto" },
  center: { left: "auto", right: "auto" },
  right: { left: "auto", right: "0px" },
};

const updateStyle = (
  style: string | null,
  apply: (declaration: CSSStyleDeclaration) => void
): string => {
  const element = document.createElement("div");
  element.style.cssText = style ?? "";
  apply(element.style);

  return element.style.cssText;
};

export const alignImageStyle = (
  style: string | null,
  alignment: ImageAlignment
): string =>
  updateStyle(style, (declaration) => {
    declaration.removeProperty("margin");
    declaration.display = "block";
    declaration.marginLeft = alignmentMargins[alignment].left;
    declaration.marginRight = alignmentMargins[alignment].right;
  });

export const resizeImageStyle = (style: string | null, width: number): string =>
  updateStyle(style, (declaration) => {
    declaration.width = `${width}px`;
  });
