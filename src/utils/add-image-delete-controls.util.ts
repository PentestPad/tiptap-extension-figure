import deleteIcon from "../assets/icons/delete.svg";

export const addImageDeleteControls = (
  wrapperElement: HTMLElement,
  styles: Record<string, string>,
  onDelete: () => void
) => {
  const deleteControlsElement = document.createElement("div");
  deleteControlsElement.setAttribute(
    "class",
    styles["delete-controls-element"]
  );

  const deleteButton = document.createElement("img");
  deleteButton.setAttribute("class", styles["delete-image-button"]);
  deleteButton.setAttribute("src", deleteIcon);
  deleteButton.setAttribute("title", "Delete image");

  deleteButton.addEventListener("click", (event) => {
    // Do not propagate click event to the wrapper element
    event.stopPropagation();
    event.preventDefault();
    onDelete();
  });

  deleteControlsElement.appendChild(deleteButton);
  wrapperElement.appendChild(deleteControlsElement);
};
