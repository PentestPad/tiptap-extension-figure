import { isMobileScreen } from "./is-mobile-screen.util";

const minimumWidth = 48;

export const createImageResizeControls = (
  styles: Record<string, string>,
  {
    getStartWidth,
    getMaximumWidth,
    onResize,
    onResizeEnd,
  }: {
    getStartWidth: () => number;
    getMaximumWidth: () => number;
    onResize: (width: number) => void;
    onResizeEnd: (width: number, hasChanged: boolean) => void;
  }
): HTMLElement[] => {
  const isMobile = isMobileScreen();
  const dotPosition = isMobile ? "-8px" : "-4px";
  const dotSize = isMobile ? 16 : 9;
  const dotsPosition = [
    `top: ${dotPosition}; left: ${dotPosition}; cursor: nwse-resize;`,
    `top: ${dotPosition}; right: ${dotPosition}; cursor: nesw-resize;`,
    `bottom: ${dotPosition}; left: ${dotPosition}; cursor: nesw-resize;`,
    `bottom: ${dotPosition}; right: ${dotPosition}; cursor: nwse-resize;`,
  ];

  return dotsPosition.map((dotStyle, index) => {
    const dotElement = document.createElement("div");
    dotElement.setAttribute("class", styles["dot-element"]);
    dotElement.setAttribute(
      "style",
      `width: ${dotSize}px; height: ${dotSize}px; ${dotStyle}`
    );

    const startResizing = (startX: number) => {
      const startWidth = getStartWidth();
      const maximumWidth = getMaximumWidth();
      let currentWidth = startWidth;

      const resizeTo = (clientX: number) => {
        const deltaX = index % 2 === 0 ? startX - clientX : clientX - startX;
        currentWidth = Math.round(
          Math.min(maximumWidth, Math.max(minimumWidth, startWidth + deltaX))
        );
        onResize(currentWidth);
      };

      const finishResizing = () =>
        onResizeEnd(currentWidth, currentWidth !== startWidth);

      return { resizeTo, finishResizing };
    };

    dotElement.addEventListener("mousedown", (event) => {
      event.preventDefault();
      const { resizeTo, finishResizing } = startResizing(event.clientX);

      const onMouseMove = (moveEvent: MouseEvent) =>
        resizeTo(moveEvent.clientX);
      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        finishResizing();
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });

    dotElement.addEventListener(
      "touchstart",
      (event) => {
        event.cancelable && event.preventDefault();
        const { resizeTo, finishResizing } = startResizing(
          event.touches[0].clientX
        );

        const onTouchMove = (moveEvent: TouchEvent) =>
          resizeTo(moveEvent.touches[0].clientX);
        const onTouchEnd = () => {
          document.removeEventListener("touchmove", onTouchMove);
          document.removeEventListener("touchend", onTouchEnd);
          finishResizing();
        };

        document.addEventListener("touchmove", onTouchMove);
        document.addEventListener("touchend", onTouchEnd);
      },
      { passive: false }
    );

    return dotElement;
  });
};
