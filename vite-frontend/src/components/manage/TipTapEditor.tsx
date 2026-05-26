import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export default function TipTapEditor({ value, onChange, maxLength = 2000 }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false })],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const htmlLen = editor?.getHTML().length ?? 0;
  const counterClass = htmlLen > maxLength
    ? 'tiptap-editor__counter--error'
    : htmlLen > maxLength * 0.9
    ? 'tiptap-editor__counter--warn'
    : '';

  if (!editor) return null;

  return (
    <div className="tiptap-editor">
      <div className="tiptap-editor__toolbar">
        {[
          { label: 'G', title: 'Gras', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
          { label: 'I', title: 'Italique', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
          { label: '• Liste', title: 'Liste à puces', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
          { label: '1. Liste', title: 'Liste numérotée', action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
        ].map(btn => (
          <button
            key={btn.title}
            type="button"
            title={btn.title}
            className={`tiptap-editor__btn${btn.active ? ' tiptap-editor__btn--active' : ''}`}
            onClick={btn.action}
          >
            {btn.label}
          </button>
        ))}
        <button
          type="button"
          title="Lien"
          className={`tiptap-editor__btn${editor.isActive('link') ? ' tiptap-editor__btn--active' : ''}`}
          onClick={() => {
            const url = window.prompt('URL', editor.getAttributes('link').href ?? '');
            if (url === null) return;
            if (url === '') { editor.chain().focus().unsetLink().run(); return; }
            editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          🔗
        </button>
      </div>
      <EditorContent editor={editor} />
      <div className={`tiptap-editor__counter ${counterClass}`}>
        {htmlLen} / {maxLength} {htmlLen > maxLength && '— trop long, raccourcir avant d\'enregistrer'}
      </div>
    </div>
  );
}
