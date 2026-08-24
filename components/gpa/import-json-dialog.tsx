"use client";

import React, { useState } from "react";
import { X, Upload, FileJson } from "lucide-react";
import { toast } from "sonner";

interface ImportJSONDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportJSONDialog({ isOpen, onClose, onSuccess }: ImportJSONDialogProps) {
  const [jsonText, setJsonText] = useState("");
  const [replaceAll, setReplaceAll] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exampleJSON = {
    semesters: [
      {
        name: "Học kỳ 1 - 2023-2024",
        order: 1,
        courses: [
          { name: "Lập trình cơ bản", credits: 3, grade: 4.0, difficulty: "easy", status: "completed" },
          { name: "Giải tích 1", credits: 2, grade: 3.0, difficulty: "hard", status: "completed" },
        ],
      },
      {
        name: "Học kỳ 2 - 2023-2024",
        order: 2,
        courses: [
          { name: "Cấu trúc dữ liệu", credits: 3, grade: null, difficulty: "medium", status: "planned" },
        ],
      },
    ],
  };

  const handleImport = async () => {
    if (!jsonText.trim()) {
      toast.error("Vui lòng nhập dữ liệu JSON");
      return;
    }

    try {
      setIsImporting(true);
      const parsed = JSON.parse(jsonText);

      const res = await fetch("/api/gpa/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          semesters: parsed.semesters,
          replaceAll,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể import dữ liệu");
      }

      const result = await res.json();
      toast.success(result.message || "Import thành công!");
      setJsonText("");
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        toast.error("JSON không hợp lệ. Vui lòng kiểm tra lại cú pháp.");
      } else {
        toast.error(error.message || "Có lỗi xảy ra khi import");
      }
    } finally {
      setIsImporting(false);
    }
  };

  const fillExample = () => {
    setJsonText(JSON.stringify(exampleJSON, null, 2));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-ink/50 z-50 flex items-center justify-center p-4">
      <div className="bg-canvas rounded-lg shadow-elevation3 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-hairline">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-ink">Import học kỳ từ JSON</h2>
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
        <div className="p-4 space-y-4">
          {/* Instructions */}
          <div className="bg-canvas-lavender/50 rounded-md p-3 text-sm text-ink-mute">
            <p className="font-semibold text-ink mb-1">Hướng dẫn:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Dán JSON theo định dạng bên dưới</li>
              <li><code className="bg-ink/5 px-1 rounded">status</code>: "completed" (đã học) hoặc "planned" (kế hoạch)</li>
              <li><code className="bg-ink/5 px-1 rounded">grade</code>: điểm thang 4.0 (0-4.0), hoặc <code className="bg-ink/5 px-1 rounded">null</code> nếu chưa có</li>
              <li><code className="bg-ink/5 px-1 rounded">difficulty</code>: "easy", "medium", hoặc "hard"</li>
            </ul>
          </div>

          {/* Example button */}
          <button
            type="button"
            onClick={fillExample}
            className="text-sm text-link-blue hover:text-link-hover underline"
          >
            Điền ví dụ mẫu
          </button>

          {/* JSON textarea */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Dữ liệu JSON
            </label>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder={JSON.stringify(exampleJSON, null, 2)}
              rows={16}
              className="w-full px-3 py-2 border border-hairline rounded-md text-ink bg-canvas resize-none font-mono text-xs"
            />
          </div>

          {/* Replace all checkbox */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={replaceAll}
              onChange={(e) => setReplaceAll(e.target.checked)}
              className="rounded border-hairline"
            />
            <span className="text-ink">
              Xóa tất cả học kỳ hiện tại trước khi import{" "}
              <span className="text-semantic-error">(Cẩn thận!)</span>
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex gap-2 justify-end p-4 border-t border-hairline">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-ink-mute hover:text-ink transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={isImporting}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-pill hover:bg-primary-press transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {isImporting ? "Đang import..." : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
}
