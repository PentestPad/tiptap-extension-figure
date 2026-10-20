import { mergeAttributes, nodeInputRule } from "@tiptap/core";
import ImageExtension, { ImageOptions } from "@tiptap/extension-image";
import { NodeSelection, TextSelection, Transaction } from "@tiptap/pm/state";
import { createImageAlignmentControls } from "../utils/add-image-alignment-controls.util";
import { createImageResizeControls } from "../utils/add-image-resize-controls.util";
import { createCaptionControls } from "../utils/add-caption-controls.util";
import { alignImageStyle, resizeImageStyle } from "../utils/image-style.util";

import styles from "../assets/styles/styles.css";

export const inputRegex = /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/;

const captionPlaceholder = "Write a caption…";

const imageAttributes = ["src", "alt", "title", "width", "height"];

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageFigure: {
      setImageFigure: (options: {
        src: string;
        alt?: string;
        title?: string;
      }) => ReturnType;
    };
  }
}

const setAttributeIfChanged = (
  element: HTMLElement,
  name: string,
  value: string | null
) => {
  if (value === null) {
    element.removeAttribute(name);

    return;
  }

  if (element.getAttribute(name) !== value) {
    element.setAttribute(name, value);
  }
};

const TiptapImageFigureExtension = ImageExtension.extend<ImageOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
    };
  },

  group: "block",

  draggable: true,

  isolating: true,

  content: "inline*",

  name: "imageFigure",

  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
        parseHTML: (element) => {
          if (element.tagName === "FIGURE") {
            const img = element.querySelector("img");
            return img?.getAttribute("src");
          }
          return element.getAttribute("src");
        },
      },
      alt: {
        default: null,
        parseHTML: (element) => {
          const img = element.querySelector("img");
          return img?.getAttribute("alt");
        },
      },
      title: {
        default: null,
        parseHTML: (element) => {
          const img = element.querySelector("img");
          return img?.getAttribute("title");
        },
      },
      style: {
        // This style is applied to the wrapper element
        default: "width: 100%; height: auto; cursor: pointer;",
        parseHTML: (element) => {
          const width = element.getAttribute("width");
          return width
            ? `width: ${width}px; height: auto; cursor: pointer;`
            : `${element.style.cssText}`;
        },
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),

      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },

      setImageFigure:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
            content: [],
          });
        },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure:has(figcaption)",
        contentElement: "figcaption",
      },
      {
        tag: "figure:not(:has(figcaption))",
      },
      {
        tag: this.options.allowBase64
          ? "img[src]"
          : 'img[src]:not([src^="data:"])',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const hasCaption = node.content.size > 0;

    if (hasCaption) {
      // We should ignore src, alt and title from html attributes if the wrapper element is a figure
      const { src, alt, title, ...figureHtmlAttributes } = HTMLAttributes;

      return [
        "figure",
        mergeAttributes(figureHtmlAttributes, {
          draggable: false,
          contenteditable: false,
        }),
        ["img", mergeAttributes(HTMLAttributes)],
        ["figcaption", 0],
      ];
    }

    return ["img", mergeAttributes(HTMLAttributes)];
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { $from } = editor.state.selection;

        if ($from.parent.type !== this.type) {
          return false;
        }

        return editor.commands.command(({ tr }) => {
          const position = $from.after();
          const blockType = $from
            .node(-1)
            .contentMatchAt($from.indexAfter(-1)).defaultType;

          if (!blockType) {
            return false;
          }

          tr.insert(position, blockType.create());
          tr.setSelection(TextSelection.create(tr.doc, position + 1));

          return true;
        });
      },
    };
  },

  addNodeView() {
    return ({ node: initialNode, editor, getPos }) => {
      let node = initialNode;
      let isResizing = false;

      const wrapperElement = document.createElement("figure");
      wrapperElement.setAttribute("class", styles["wrapper-element"]);
      wrapperElement.contentEditable = "false";

      const imageElement = document.createElement("img");
      wrapperElement.appendChild(imageElement);

      const captionElement = document.createElement("figcaption");
      captionElement.setAttribute("class", styles["caption-element"]);
      captionElement.contentEditable = "true";
      captionElement.dataset.placeholder = captionPlaceholder;
      wrapperElement.appendChild(captionElement);

      const isSelectionInCaption = () => {
        const position = getPos();
        const { selection } = editor.state;

        return (
          position !== undefined &&
          selection instanceof TextSelection &&
          selection.from > position &&
          selection.to < position + node.nodeSize
        );
      };

      const selectImage = (transaction: Transaction, position: number) =>
        transaction.setSelection(
          NodeSelection.create(transaction.doc, position)
        );

      const updateNodeStyle = (style: string) => {
        const position = getPos();

        if (position === undefined) {
          return;
        }

        const transaction = editor.state.tr.setNodeMarkup(position, undefined, {
          ...node.attrs,
          style,
        });
        editor.view.dispatch(selectImage(transaction, position));
      };

      const toggleCaption = () => {
        const position = getPos();

        if (position === undefined) {
          return;
        }

        if (node.content.size > 0) {
          const transaction = editor.state.tr.delete(
            position + 1,
            position + node.nodeSize - 1
          );
          editor.view.dispatch(selectImage(transaction, position));

          return;
        }

        captionElement.hidden = false;
        editor.view.dispatch(
          editor.state.tr.setSelection(
            TextSelection.create(editor.state.doc, position + 1)
          )
        );
        editor.view.focus();
      };

      const syncAttributes = () => {
        if (!isResizing) {
          setAttributeIfChanged(wrapperElement, "style", node.attrs.style);
          setAttributeIfChanged(imageElement, "style", node.attrs.style);
        }

        imageAttributes.forEach((attribute) => {
          const value = node.attrs[attribute];
          setAttributeIfChanged(
            imageElement,
            attribute,
            value === null || value === undefined ? null : String(value)
          );
        });
      };

      const captionControls = createCaptionControls(styles, toggleCaption);

      const syncCaption = () => {
        const hasCaption = node.content.size > 0;

        captionElement.hidden =
          !hasCaption && !(editor.isEditable && isSelectionInCaption());
        captionElement.classList.toggle(styles["caption-empty"], !hasCaption);
        captionControls.setHasCaption(hasCaption);
      };

      const controlsElement = document.createElement("div");
      controlsElement.setAttribute("class", styles["controls-element"]);
      controlsElement.append(
        createImageAlignmentControls(styles, (alignment) =>
          updateNodeStyle(alignImageStyle(node.attrs.style, alignment))
        ),
        captionControls.element,
        ...createImageResizeControls(styles, {
          getStartWidth: () => imageElement.offsetWidth,
          getMaximumWidth: () =>
            wrapperElement.parentElement?.clientWidth ?? Infinity,
          onResize: (width) => {
            isResizing = true;
            wrapperElement.style.width = `${width}px`;
            imageElement.style.width = `${width}px`;
          },
          onResizeEnd: (width, hasChanged) => {
            isResizing = false;

            if (hasChanged) {
              updateNodeStyle(resizeImageStyle(node.attrs.style, width));

              return;
            }

            syncAttributes();
          },
        })
      );
      wrapperElement.appendChild(controlsElement);

      imageElement.addEventListener("click", () => {
        const position = getPos();

        if (!editor.isEditable || position === undefined) {
          return;
        }

        editor.view.dispatch(selectImage(editor.state.tr, position));
        editor.view.focus();
      });

      editor.on("selectionUpdate", syncCaption);

      syncAttributes();
      syncCaption();

      return {
        dom: wrapperElement,
        contentDOM: captionElement,
        update: (updatedNode) => {
          if (updatedNode.type !== node.type) {
            return false;
          }

          node = updatedNode;
          syncAttributes();
          syncCaption();

          return true;
        },
        selectNode: () => {
          wrapperElement.classList.add("ProseMirror-selectednode");

          if (editor.isEditable) {
            wrapperElement.classList.add(styles["active"]);
          }
        },
        deselectNode: () => {
          wrapperElement.classList.remove(
            "ProseMirror-selectednode",
            styles["active"]
          );
        },
        stopEvent: (event) => controlsElement.contains(event.target as Node),
        ignoreMutation: (mutation) =>
          mutation.type === "attributes" ||
          !captionElement.contains(mutation.target),
        destroy: () => {
          editor.off("selectionUpdate", syncCaption);
        },
      };
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: (match) => {
          const [, alt, src, title] = match;
          return { src, alt, title };
        },
      }),
    ];
  },
});

export { TiptapImageFigureExtension };

export default TiptapImageFigureExtension;
