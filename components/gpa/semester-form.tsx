"use client";

import React, { useState } from "react";
import { SemesterDTO, CourseDTO, Difficulty, CourseStatus } from "@/types";
import { normalizeGrade10To4 } from "@/lib/gpa-calculator";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Edit2,
  Check,
  X,
  FileJson,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ImportJSONDialog } from "./import-json-dialog";

interface SemesterFormProps {
  semesters: SemesterDTO[];
  onCreateSemester: (data: Partial<SemesterDTO>) => Promise<any>;
  onUpdateSemester: (params: { id: string; data: Partial<SemesterDTO> }) => Promise<any>;
  onDeleteSemester: (id: string) => Promise<any>;
  onRefresh?: () => void;
}

export function SemesterForm({
  semesters,
  onCreateSemester,
  onUpdateSemester,
  onDeleteSemester,
  onRefresh,
}: SemesterFormProps) {
  const [openSemesters, setOpenSemesters] = useState<Record<string, boolean>>({});
  const [newSemesterName, setNewSemesterName] = useState("");
  const [isAddingSemester, setIsAddingSemester] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // New course inline form state
  const [addingCourseForSem, setAddingCourseForSem] = useState<string | null>(null);
  const [courseName, setCourseName] = useState("");
  const [courseCredits, setCourseCredits] = useState<number | "">(3);
  const [courseGrade, setCourseGrade] = useState<number | "">("");
  const [courseDifficulty, setCourseDifficulty] = useState<Difficulty>("medium");
  const [courseStatus, setCourseStatus] = useState<CourseStatus>("completed");

  const toggleSemester = (id: string) => {
    setOpenSemesters((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSemesterName.trim()) return;

    await onCreateSemester({
      name: newSemesterName.trim(),
      courses: [],
    });
    setNewSemesterName("");
    setIsAddingSemester(false);
  };

  const handleAddCourse = async (semester: SemesterDTO) => {
    if (!courseName.trim() || courseCredits === "" || courseCredits <= 0) return;

    const newCourse: CourseDTO = {
      id: Math.random().toString(36).substring(2, 9),
      name: courseName.trim(),
      credits: Number(courseCredits),
      grade: courseGrade !== "" ? Number(courseGrade) : undefined,
      difficulty: courseDifficulty,
      status: courseGrade !== "" ? "completed" : "planned",
    };

    const updatedCourses = [...(semester.courses || []), newCourse];
    await onUpdateSemester({
      id: semester.id,
      data: { courses: updatedCourses },
    });

    // Reset inline course form
    setCourseName("");
    setCourseCredits(3);
    setCourseGrade("");
    setCourseDifficulty("medium");
    setAddingCourseForSem(null);
  };

  const handleDeleteCourse = async (semester: SemesterDTO, courseIdx: number) => {
    const updatedCourses = semester.courses.filter((_, idx) => idx !== courseIdx);
    await onUpdateSemester({
      id: semester.id,
      data: { courses: updatedCourses },
    });
  };

  const handleUpdateCourseGrade = async (
    semester: SemesterDTO,
    courseIdx: number,
    gradeVal: number | null
  ) => {
    const updatedCourses = semester.courses.map((c, idx) => {
      if (idx === courseIdx) {
        return {
          ...c,
          grade: gradeVal !== null ? gradeVal : undefined,
          status: (gradeVal !== null ? "completed" : "planned") as CourseStatus,
        };
      }
      return c;
    });

    await onUpdateSemester({
      id: semester.id,
      data: { courses: updatedCourses },
    });
  };

  return (
    <div className="card-base bg-surface p-6 border border-hairline shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-hairline">
        <div>
          <h3 className="font-bold text-base text-ink">Danh Sách Học Kỳ & Môn Học</h3>
          <p className="text-xs text-ink-mute">
            Nhập điểm cho các môn đã học hoặc dự kiến môn cho các kỳ tương lai
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setImportDialogOpen(true)}
            className="btn-outline-aubergine inline-flex items-center gap-1.5 text-xs"
          >
            <FileJson className="w-4 h-4" />
            <span>Import JSON</span>
          </button>
          
          <button
            type="button"
            onClick={() => setIsAddingSemester(true)}
            className="btn-primary-compact inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm học kỳ</span>
          </button>
        </div>
      </div>

      {/* Add Semester Form */}
      {isAddingSemester && (
        <form
          onSubmit={handleCreateSemester}
          className="p-4 bg-canvas-cream/50 rounded-xl border border-hairline flex items-center gap-3 animate-in fade-in"
        >
          <input
            type="text"
            required
            autoFocus
            value={newSemesterName}
            onChange={(e) => setNewSemesterName(e.target.value)}
            placeholder="VD: Học kỳ 2 - 2024-2025"
            className="input-base text-sm flex-1"
          />
          <button type="submit" className="btn-primary-compact text-xs">
            Tạo
          </button>
          <button
            type="button"
            onClick={() => setIsAddingSemester(false)}
            className="btn-outline-compact text-xs"
          >
            Huỷ
          </button>
        </form>
      )}

      {/* Semesters List */}
      <div className="space-y-3">
        {semesters.length === 0 ? (
          <div className="text-center py-8 text-xs text-ink-mute bg-canvas-cream/30 rounded-xl">
            Chưa có học kỳ nào. Hãy thêm học kỳ đầu tiên!
          </div>
        ) : (
          semesters.map((sem) => {
            const isOpen = openSemesters[sem.id] ?? true;
            const completedCourses = sem.courses.filter(
              (c) => c.grade !== undefined && c.grade !== null
            );
            const semCredits = sem.courses.reduce((acc, c) => acc + c.credits, 0);
            const semQP = completedCourses.reduce(
              (acc, c) => acc + c.credits * normalizeGrade10To4(c.grade || 0),
              0
            );
            const completedCredits = completedCourses.reduce((acc, c) => acc + c.credits, 0);
            const semGPA = completedCredits > 0 ? (semQP / completedCredits).toFixed(2) : "—";

            return (
              <div
                key={sem.id}
                className="rounded-xl border border-hairline bg-canvas overflow-hidden shadow-xs"
              >
                {/* Semester Accordion Header */}
                <div
                  onClick={() => toggleSemester(sem.id)}
                  className="p-4 bg-canvas-cream/40 hover:bg-canvas-cream/60 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-ink-mute" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-ink-mute" />
                    )}
                    <h4 className="font-bold text-sm text-ink">{sem.name}</h4>
                    <span className="text-xs font-semibold text-ink-mute">
                      ({sem.courses.length} môn • {semCredits} tín chỉ)
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-primary bg-canvas-lavender px-2.5 py-1 rounded-pill">
                      GPA Kỳ: {semGPA}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Bạn có chắc muốn xoá học kỳ "${sem.name}"?`)) {
                          onDeleteSemester(sem.id);
                        }
                      }}
                      className="p-1 text-ink-mute hover:text-semantic-error"
                      title="Xoá học kỳ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Semester Content (Courses Table) */}
                {isOpen && (
                  <div className="p-4 space-y-3">
                    {sem.courses.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-hairline text-ink-mute font-bold">
                              <th className="pb-2">Tên môn học</th>
                              <th className="pb-2 text-center">Tín chỉ</th>
                              <th className="pb-2 text-center">Điểm (hệ 4)</th>
                              <th className="pb-2 text-center">Độ khó</th>
                              <th className="pb-2 text-center">Trạng thái</th>
                              <th className="pb-2 text-right">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-hairline/60">
                            {sem.courses.map((course, cIdx) => (
                              <tr key={cIdx} className="hover:bg-canvas-cream/20">
                                <td className="py-2.5 font-semibold text-ink">
                                  {course.name}
                                </td>
                                <td className="py-2.5 text-center font-semibold">
                                  {course.credits}
                                </td>
                                <td className="py-2.5 text-center">
                                  <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="4.0"
                                    value={
                                      course.grade !== undefined && course.grade !== null
                                        ? normalizeGrade10To4(course.grade)
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const val =
                                        e.target.value !== ""
                                          ? parseFloat(e.target.value)
                                          : null;
                                      handleUpdateCourseGrade(sem, cIdx, val);
                                    }}
                                    placeholder="Dự kiến"
                                    className="w-16 text-center input-base py-1 px-1 text-xs font-bold"
                                  />
                                </td>
                                <td className="py-2.5 text-center">
                                  <span
                                    className={cn(
                                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                      course.difficulty === "hard"
                                        ? "bg-semantic-error/15 text-semantic-error"
                                        : course.difficulty === "easy"
                                        ? "bg-semantic-success/15 text-semantic-success"
                                        : "bg-sand/20 text-ink"
                                    )}
                                  >
                                    {course.difficulty === "hard"
                                      ? "Khó"
                                      : course.difficulty === "easy"
                                      ? "Dễ"
                                      : "Vừa"}
                                  </span>
                                </td>
                                <td className="py-2.5 text-center">
                                  {course.grade !== undefined && course.grade !== null ? (
                                    <span className="text-semantic-success font-bold">
                                      Đã học
                                    </span>
                                  ) : (
                                    <span className="text-ink-mute font-semibold">
                                      Dự kiến
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCourse(sem, cIdx)}
                                    className="text-ink-mute hover:text-semantic-error p-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-3 text-center text-xs text-ink-mute">
                        Chưa có môn học trong kỳ này.
                      </div>
                    )}

                    {/* Add Course Button or Inline Form */}
                    {addingCourseForSem === sem.id ? (
                      <div className="p-3 rounded-lg bg-canvas-cream/50 border border-hairline space-y-2 animate-in fade-in">
                        <span className="text-xs font-bold text-ink">Thêm môn học mới</span>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                          <input
                            type="text"
                            placeholder="Tên môn học *"
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                            className="input-base text-xs py-1.5 sm:col-span-2"
                          />
                          <input
                            type="number"
                            min="1"
                            placeholder="Số tín chỉ *"
                            value={courseCredits}
                            onChange={(e) =>
                              setCourseCredits(
                                e.target.value ? parseInt(e.target.value, 10) : ""
                              )
                            }
                            className="input-base text-xs py-1.5"
                          />
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="4.0"
                            placeholder="Điểm (nếu có)"
                            value={courseGrade}
                            onChange={(e) =>
                              setCourseGrade(
                                e.target.value ? parseFloat(e.target.value) : ""
                              )
                            }
                            className="input-base text-xs py-1.5"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-ink-mute">Độ khó:</span>
                            <select
                              value={courseDifficulty}
                              onChange={(e) =>
                                setCourseDifficulty(e.target.value as Difficulty)
                              }
                              className="input-base text-xs py-1 px-2"
                            >
                              <option value="easy">Dễ</option>
                              <option value="medium">Vừa</option>
                              <option value="hard">Khó</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setAddingCourseForSem(null)}
                              className="btn-outline-compact text-xs py-1 px-3"
                            >
                              Huỷ
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddCourse(sem)}
                              disabled={!courseName.trim()}
                              className="btn-primary-compact text-xs py-1 px-3"
                            >
                              Thêm môn
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setAddingCourseForSem(sem.id);
                          setCourseName("");
                          setCourseCredits(3);
                          setCourseGrade("");
                        }}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1 pt-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Thêm môn học vào {sem.name}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Import JSON Dialog */}
      <ImportJSONDialog
        isOpen={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onSuccess={() => {
          onRefresh?.();
        }}
      />
    </div>
  );
}
