"use client";

import { useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

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

      <div className="flex flex-wrap gap-1 rounded-t-[var(--radius-control)] border border-border-strong border-b-0 bg-brand-tint p-2">
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
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
        >
          H
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
        <div className="w-px bg-border-strong" />
        <MenuButton onClick={() => fileInputRef.current?.click()}>
          📤 Imagen
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

      <EditorContent
        editor={editor}
        className="rounded-b-[var(--radius-control)] border border-border-strong px-3 py-2 text-sm text-foreground prose prose-sm max-w-none [&_img]:max-w-[100%] [&_img]:h-auto"
      />
    </div>
  );
}
