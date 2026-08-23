"use client";

import React, { useState } from "react";
import Image from "next/image";
import { NoteDTO } from "@/types";
import { formatZonedDate } from "@/lib/utils";
import {
  Pin,
  Search,
  Tag,
  Plus,
  Trash2,
  Edit2,
  X,
  FileText,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NotesTimelineProps {
  notes: NoteDTO[];
  onOpenCreate: () => void;
  onEditNote: (note: NoteDTO) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (note: NoteDTO) => void;
}

export function NotesTimeline({
  notes,
  onOpenCreate,
  onEditNote,
  onDeleteNote,
  onTogglePin,
}: NotesTimelineProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = React.useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => n.tags?.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [notes]);

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const matchesTag = selectedTag ? n.tags?.includes(selectedTag) : true;
    const matchesSearch = searchQuery
      ? n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesTag && matchesSearch;
  });

  // Quick stats
  const pinnedCount = notes.filter((n) => n.isPinned).length;
  const imageNotesCount = notes.filter((n) => n.images && n.images.length > 0).length;

  return (
    <div className="space-y-6 pb-20">
      {/* 4-Column Quick Numbers for Notes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="card-base bg-surface p-4 border border-hairline shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-ink-mute block">Tổng Ghi Chú</span>
            <span className="text-xl sm:text-2xl font-black text-ink">{notes.length}</span>
          </div>
        </div>

        <div className="card-base bg-surface p-4 border border-hairline shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sand/15 text-sand flex items-center justify-center font-bold">
            <Pin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-ink-mute block">Đã Ghim Quan Trọng</span>
            <span className="text-xl sm:text-2xl font-black text-sand">{pinnedCount}</span>
          </div>
        </div>

        <div className="card-base bg-surface p-4 border border-hairline shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-canvas-lavender text-primary flex items-center justify-center font-bold">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-ink-mute block">Chủ Đề / Tags</span>
            <span className="text-xl sm:text-2xl font-black text-primary">{allTags.length}</span>
          </div>
        </div>

        <div className="card-base bg-surface p-4 border border-hairline shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-semantic-success/15 text-semantic-success flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-ink-mute block">Có Hình Ảnh</span>
            <span className="text-xl sm:text-2xl font-black text-semantic-success">{imageNotesCount}</span>
          </div>
        </div>
      </div>

      {/* Top Banner / Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 rounded-2xl border border-hairline shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm nội dung hoặc thẻ..."
            className="input-base pl-9 text-xs py-2"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute hover:text-ink"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenCreate}
          className="btn-primary-compact inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Viết Ghi chú</span>
        </button>
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-ink-mute flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> Lọc theo thẻ:
          </span>

          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className={cn(
              "text-xs font-bold px-3 py-1 rounded-pill transition-all border",
              selectedTag === null
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-surface text-ink-mute border-hairline hover:bg-canvas-lavender"
            )}
          >
            Tất cả ({notes.length})
          </button>

          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={cn(
                "text-xs font-bold px-3 py-1 rounded-pill transition-all border",
                selectedTag === tag
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-surface text-ink-mute border-hairline hover:bg-canvas-lavender"
              )}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Timeline Feed */}
      {filteredNotes.length === 0 ? (
        <div className="card-cream text-center py-16 px-6 max-w-lg mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-canvas-lavender text-primary mx-auto flex items-center justify-center mb-4">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-ink">Chưa có ghi chú nào</h3>
          <p className="text-xs text-ink-mute mt-1.5 mb-6">
            Ghi lại những ý tưởng, liên kết hữu ích, hoặc kiến thức học tập vào đây.
          </p>
          <button
            type="button"
            onClick={onOpenCreate}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo ghi chú đầu tiên</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={cn(
                "card-base relative group transition-all duration-150 hover:shadow-elevation1",
                note.isPinned && "border-primary/40 bg-canvas-lavender/10"
              )}
            >
              {/* Header: Date & Actions */}
              <div className="flex items-center justify-between pb-3 border-b border-hairline mb-3">
                <div className="flex items-center gap-2">
                  {note.isPinned && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-canvas-lavender px-2.5 py-0.5 rounded-pill">
                      <Pin className="w-3 h-3 fill-primary" /> Đã ghim
                    </span>
                  )}
                  <span className="text-xs font-semibold text-ink-mute">
                    {formatZonedDate(note.createdAt, "dd/MM/yyyy HH:mm")}
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => onTogglePin(note)}
                    className="p-1.5 rounded hover:bg-canvas-lavender text-ink-mute hover:text-primary transition-colors"
                    title={note.isPinned ? "Bỏ ghim" : "Ghim lên đầu"}
                  >
                    <Pin className={cn("w-4 h-4", note.isPinned && "fill-primary text-primary")} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onEditNote(note)}
                    className="p-1.5 rounded hover:bg-canvas-lavender text-ink-mute hover:text-ink transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Bạn có chắc chắn muốn xoá ghi chú này?")) {
                        onDeleteNote(note.id);
                      }
                    }}
                    className="p-1.5 rounded hover:bg-semantic-error/10 text-ink-mute hover:text-semantic-error transition-colors"
                    title="Xoá"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Rich Text Content */}
              <div
                className="prose prose-sm max-w-none text-ink leading-relaxed"
                dangerouslySetInnerHTML={{ __html: note.content }}
              />

              {/* Attached Images */}
              {note.images && note.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-hairline">
                  {note.images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setLightboxImage(imgUrl)}
                      className="relative aspect-video rounded-lg overflow-hidden border border-hairline bg-canvas-cream/50 cursor-pointer group/img"
                    >
                      <Image
                        src={imgUrl}
                        alt="Attached image"
                        fill
                        className="object-cover transition-transform group-hover/img:scale-105"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Tags */}
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-hairline">
                  {note.tags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTag(t)}
                      className="text-[11px] font-bold text-primary bg-canvas-lavender hover:bg-canvas-lavender/80 px-2.5 py-0.5 rounded-pill border border-hairline transition-colors"
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <Image
              src={lightboxImage}
              alt="Fullscreen preview"
              width={1200}
              height={800}
              className="max-h-[85vh] w-auto object-contain rounded-lg"
              unoptimized
            />
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 text-white bg-black/60 p-2 rounded-full hover:bg-black"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
