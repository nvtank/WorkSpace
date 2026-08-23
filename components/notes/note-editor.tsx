"use client";

import React, { useState, useEffect } from "react";
import { NoteDTO } from "@/types";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { ImageUploader } from "@/components/shared/image-uploader";
import { X, Pin, Tag, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface NoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<NoteDTO>) => Promise<any>;
  initialData?: NoteDTO | null;
}

export function NoteEditor({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: NoteEditorProps) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setContent(initialData.content);
      setImages(initialData.images || []);
      setTags(initialData.tags || []);
      setIsPinned(initialData.isPinned || false);
    } else {
      setContent("");
      setImages([]);
      setTags([]);
      setIsPinned(false);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, "");
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((tag) => tag !== t));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        content,
        images,
        tags,
        isPinned,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-surface rounded-xl border border-hairline shadow-elevation2 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline bg-canvas-cream/30">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-ink">
              {initialData ? "Chỉnh sửa ghi chú" : "Viết ghi chú mới"}
            </h2>
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={cn(
                "inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-pill transition-colors",
                isPinned
                  ? "bg-primary text-white"
                  : "bg-canvas-lavender text-ink-mute hover:text-ink"
              )}
            >
              <Pin className="w-3.5 h-3.5" />
              <span>{isPinned ? "Đã ghim" : "Ghim lên đầu"}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-ink-mute hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Tiptap Editor */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Nội dung ghi chú
            </label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Ghi lại ý tưởng, tài liệu, checklist hoặc bài học hôm nay..."
              minHeight="180px"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5 flex items-center gap-1">
              <Tag className="w-4 h-4 text-ink-mute" />
              <span>Thẻ phân loại (Tags)</span>
            </label>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-canvas-lavender px-2.5 py-1 rounded-pill border border-hairline"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-semantic-error ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Nhập thẻ rồi bấm Enter (VD: hoc-tap, du-an, y-tuong)..."
                className="input-base text-xs py-1.5 flex-1"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn-secondary-compact text-xs px-3"
              >
                Thêm thẻ
              </button>
            </div>
          </div>

          {/* Images Uploader */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Hình ảnh đính kèm
            </label>
            <ImageUploader images={images} onChange={setImages} maxImages={6} />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-hairline">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline-compact"
              disabled={isSubmitting}
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="btn-primary-compact"
            >
              {isSubmitting ? "Đang lưu..." : initialData ? "Lưu thay đổi" : "Tạo ghi chú"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
