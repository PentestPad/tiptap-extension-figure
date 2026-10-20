import closedCaptionAddIcon from "../assets/icons/closed-caption-add.svg";
import deleteIcon from "../assets/icons/delete.svg";

export const createCaptionControls = (
  styles: Record<string, string>,
  onToggle: () => void
): { element: HTMLElement; setHasCaption: (hasCaption: boolean) => void } => {
  const captionControlsContainer = document.createElement("div");
  captionControlsContainer.setAttribute(
    "class",
    styles["caption-controls-element"]
  );

  const captionButton = document.createElement("img");
  captionButton.draggable = false;
  captionButton.addEventListener("mousedown", (event) =>
    event.preventDefault()
  );
  captionButton.addEventListener("click", (event) => {
    event.preventDefault();
    onToggle();
  });
  captionControlsContainer.appendChild(captionButton);

  const setHasCaption = (hasCaption: boolean) => {
    captionButton.src = hasCaption ? deleteIcon : closedCaptionAddIcon;
    captionButton.title = hasCaption ? "Remove caption" : "Add caption";
    captionButton.setAttribute(
      "class",
      styles[hasCaption ? "remove-caption-button" : "add-caption-button"]
    );
  };

  return { element: captionControlsContainer, setHasCaption };
};
