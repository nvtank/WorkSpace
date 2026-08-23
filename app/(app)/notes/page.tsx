"use client";

import React, { useState } from "react";
import { useNotes } from "@/hooks/use-notes";
import { NotesTimeline } from "@/components/notes/notes-timeline";
import { NoteEditor } from "@/components/notes/note-editor";
import { NoteDTO } from "@/types";

export default function NotesPage() {
  const {
    notes,
    isLoading,
    createNote,
    updateNote,
    deleteNote,
  } = useNotes();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteDTO | null>(null);

  const handleOpenCreate = () => {
    setEditingNote(null);
    setEditorOpen(true);
  };

  const handleEditNote = (note: NoteDTO) => {
    setEditingNote(note);
    setEditorOpen(true);
  };

  const handleTogglePin = (note: NoteDTO) => {
    updateNote({ id: note.id, data: { isPinned: !note.isPinned } });
  };

  const handleFormSubmit = async (data: Partial<NoteDTO>) => {
    if (editingNote) {
      await updateNote({ id: editingNote.id, data });
    } else {
      await createNote(data);
    }
  };

  return (
    <div className="space-y-6">
      <NotesTimeline
        notes={notes}
        onOpenCreate={handleOpenCreate}
        onEditNote={handleEditNote}
        onDeleteNote={deleteNote}
        onTogglePin={handleTogglePin}
      />

      <NoteEditor
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingNote}
      />
    </div>
  );
}
