type ImageAlignmentControlType = "left" | "center" | "right";

interface ImageAlignmentControls {
  type: ImageAlignmentControlType;
  icon: string;
  styleToApply: string;
}

import leftIcon from "../assets/icons/format-align-left.svg";
import centerIcon from "../assets/icons/format-align-center.svg";
import rightIcon from "../assets/icons/format-align-right.svg";

const imageAlignmentControls: ImageAlignmentControls[] = [
  {
    type: "left",
    icon: leftIcon,
    styleToApply: "display: block; margin-right: auto; margin: 0 auto 0 0;",
  },
  {
    type: "center",
    icon: centerIcon,
    styleToApply: "display: block; margin-left: auto; margin-right: auto; margin: 0 auto;",
  },
  {
    type: "right",
    icon: rightIcon,
    styleToApply: "display: block; margin-left: auto; margin: 0 0 0 auto;",
  },
];

export const addImageAlignmentControls = (
  wrapperElement: HTMLElement,
  imageElement: HTMLImageElement,
  styles: Record<string, string>,
  onAlign: () => void
) => {
  const imageAlignmentContainer = document.createElement("div");

  imageAlignmentContainer.setAttribute("contenteditable", "false");
  imageAlignmentContainer.setAttribute(
    "class",
    styles["image-alignment-container"]
  );

  imageAlignmentControls.forEach((imageControl) => {
    const imageAlignmentControl = document.createElement("img");
    imageAlignmentControl.src = imageControl.icon;
    imageAlignmentControl.setAttribute(
      "class",
      styles["image-alignment-control"]
    );
    imageAlignmentControl.addEventListener("click", (event) => {
      event.stopPropagation();
      imageElement.style.cssText = `${imageElement.style.cssText} ${imageControl.styleToApply}`;
      onAlign();
    });

    imageAlignmentContainer.appendChild(imageAlignmentControl);
  });

  wrapperElement.appendChild(imageAlignmentContainer);
};
