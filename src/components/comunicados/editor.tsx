"use client";

import { useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";

const MenuButton = ({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`rounded px-2 py-1 text-sm font-semibold ${
      active ? "bg-brand text-white" : "bg-border text-foreground hover:bg-brand-tint"
    }`}
  >
    {children}
  </button>
);

export function EditorComunicado({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: true }),
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        editor.chain().focus().setImage({ src: base64 }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <div className="space-y-2 rounded-t-[var(--radius-control)] border border-border-strong border-b-0 bg-brand-tint p-2">
        {/* Row 1: Formato básico */}
        <div className="flex flex-wrap gap-1">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
          >
            <strong>B</strong>
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
          >
            <em>I</em>
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
          >
            <u>U</u>
          </MenuButton>
          <div className="w-px bg-border-strong" />
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive("heading", { level: 1 })}
          >
            H1
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
          >
            H2
          </MenuButton>
          <div className="w-px bg-border-strong" />
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
          >
            •
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
          >
            1.
          </MenuButton>
        </div>

        {/* Row 2: Color y formato avanzado */}
        <div className="flex flex-wrap gap-1">
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Color:</span>
            <input
              type="color"
              value={editor.getAttributes("textStyle").color || "#000000"}
              onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
              className="h-6 w-10 cursor-pointer rounded border border-border-strong"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Fondo:</span>
            <input
              type="color"
              value={editor.getAttributes("highlight").color || "#ffffff"}
              onChange={(e) => editor.chain().focus().setHighlight({ color: e.target.value }).run()}
              className="h-6 w-10 cursor-pointer rounded border border-border-strong"
            />
          </div>
          <div className="w-px bg-border-strong" />
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
          >
            ⬅
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
          >
            ↔
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
          >
            ➡
          </MenuButton>
        </div>

        {/* Row 3: Media e inserciones */}
        <div className="flex flex-wrap gap-1">
          <MenuButton onClick={() => fileInputRef.current?.click()}>
            📤 Subir imagen
          </MenuButton>
          <MenuButton
            onClick={() => {
              const url = prompt("URL de la imagen:");
              if (url) {
                editor.chain().focus().setImage({ src: url }).run();
              }
            }}
          >
            🔗 Imagen URL
          </MenuButton>
          <MenuButton
            onClick={() => {
              const url = prompt("URL del enlace:");
              const text = prompt("Texto del enlace:");
              if (url && text) {
                editor.chain().focus().insertContent(`<a href="${url}">${text}</a>`).run();
              }
            }}
          >
            🔗 Enlace
          </MenuButton>
        </div>
      </div>

      <EditorContent
        editor={editor}
        className="rounded-b-[var(--radius-control)] border border-border-strong px-3 py-2 text-sm text-foreground prose prose-sm max-w-none [&_img]:max-w-[100%] [&_img]:h-auto"
      />
    </div>
  );
}
