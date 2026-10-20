import leftIcon from "../assets/icons/format-align-left.svg";
import centerIcon from "../assets/icons/format-align-center.svg";
import rightIcon from "../assets/icons/format-align-right.svg";
import { ImageAlignment } from "./image-style.util";

const imageAlignmentControls: { type: ImageAlignment; icon: string }[] = [
  { type: "left", icon: leftIcon },
  { type: "center", icon: centerIcon },
  { type: "right", icon: rightIcon },
];

export const createImageAlignmentControls = (
  styles: Record<string, string>,
  onAlign: (alignment: ImageAlignment) => void
): HTMLElement => {
  const imageAlignmentContainer = document.createElement("div");
  imageAlignmentContainer.setAttribute(
    "class",
    styles["image-alignment-container"]
  );

  imageAlignmentControls.forEach((imageControl) => {
    const imageAlignmentControl = document.createElement("img");
    imageAlignmentControl.src = imageControl.icon;
    imageAlignmentControl.draggable = false;
    imageAlignmentControl.setAttribute(
      "class",
      styles["image-alignment-control"]
    );
    imageAlignmentControl.addEventListener("mousedown", (event) =>
      event.preventDefault()
    );
    imageAlignmentControl.addEventListener("click", (event) => {
      event.preventDefault();
      onAlign(imageControl.type);
    });

    imageAlignmentContainer.appendChild(imageAlignmentControl);
  });

  return imageAlignmentContainer;
};
