"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Search,
  Plus,
  Trash2,
  Edit3,
  Users,
  FileSpreadsheet,
  CheckCircle2,
  X,
  Download,
  Filter,
} from "lucide-react";
import { useAdmin } from "@/providers/AdminProvider";
import type { MasterStudent } from "@/lib/adminTypes";
import { getYearFromRegNo } from "@/lib/adminTypes";

export default function StudentsPage() {
  const { data, setData, saveData, yearLabel } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSection, setFilterSection] = useState<string>("ALL");
  const [filterYear, setFilterYear] = useState<string>("ALL");
  const [showUpload, setShowUpload] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReg, setEditingReg] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Derived Data ─────────────────────────────────
  const students = useMemo(() => Object.entries(data.students), [data.students]);
  const sections = useMemo(() => {
    const s = new Set<string>();
    students.forEach(([, st]) => s.add(st.section));
    return [...s].sort();
  }, [students]);
  const years = useMemo(() => {
    const y = new Set<number>();
    students.forEach(([, st]) => y.add(st.year));
    return [...y].sort();
  }, [students]);

  const filtered = useMemo(() => {
    return students.filter(([regNo, st]) => {
      if (filterSection !== "ALL" && st.section !== filterSection) return false;
      if (filterYear !== "ALL" && String(st.year) !== filterYear) return false;
      if (searchQuery) {
        const q = searchQuery.toUpperCase();
        return (
          regNo.toUpperCase().includes(q) ||
          st.name.toUpperCase().includes(q)
        );
      }
      return true;
    });
  }, [students, filterSection, filterYear, searchQuery]);

  // ── File Upload Handler ──────────────────────────
  const handleFileUpload = useCallback(
    async (file: File) => {
      setUploadStatus("Parsing file...");
      try {
        const XLSX = await import("xlsx");
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });

        const newStudents: Record<string, MasterStudent> = {
          ...data.students,
        };
        let addedCount = 0;

        // Known registration number column aliases (case-insensitive lookup done below)
        const REG_ALIASES = [
          "Registration No",
          "Reg No",
          "RegNo",
          "Registration Number",
          "Enrollment No",
          "Enroll No",
          "EnrollmentNo",
          "Student Reg No",
          "StudentRegNo",
          "StudentRegtNo",
          "Regd No",
          "RegdNo",
          "Roll No",
          "RollNo",
          "registration_no",
          "reg_no",
          "enrollment_no",
          "roll_no",
        ];

        const NAME_ALIASES = [
          "Student Name",
          "Name",
          "Full Name",
          "FullName",
          "StudentName",
          "student_name",
          "name",
          "full_name",
        ];

        const SECTION_ALIASES = [
          "Core Section",
          "Section",
          "Sec",
          "core_section",
          "section",
          "sec",
        ];

        // Helper: find a value in a row by trying a list of aliases
        function pickField(row: Record<string, any>, aliases: string[]): string {
          // 1. Exact match
          for (const alias of aliases) {
            if (alias in row) return String(row[alias] ?? "");
          }
          // 2. Case-insensitive match
          const keys = Object.keys(row);
          for (const alias of aliases) {
            const match = keys.find(
              (k) => k.trim().toLowerCase() === alias.toLowerCase()
            );
            if (match) return String(row[match] ?? "");
          }
          return "";
        }

        // Helper: detect if a string looks like a MUJ reg number
        // Flexible: starts with 2 digits + FE, followed by any alphanumerics
        function looksLikeMujRegNo(val: string): boolean {
          return /^\d{2}FE\d{2}[A-Z0-9]{2,6}\d{3,6}$/i.test(val.trim());
        }

        // Helper: auto-detect which column holds reg numbers by scanning first rows
        function detectRegNoColumn(
          rows: Record<string, any>[]
        ): string | null {
          const sample = rows.slice(0, 10);
          for (const row of sample) {
            for (const key of Object.keys(row)) {
              const val = String(row[key] ?? "").trim();
              if (looksLikeMujRegNo(val)) return key;
            }
          }
          return null;
        }

        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
            defval: "",
          });

          if (rows.length === 0) continue;

          // Detect column names — prefer alias match, fall back to auto-detect
          const allKeys = Object.keys(rows[0]);
          const detectedRegCol =
            REG_ALIASES.find((a) =>
              allKeys.some((k) => k.trim().toLowerCase() === a.toLowerCase())
            ) || detectRegNoColumn(rows);

          if (!detectedRegCol) {
            setUploadStatus(
              `⚠️ Sheet "${sheetName}": Couldn't find a reg-no column. Columns found: ${allKeys.join(", ")}`
            );
            continue;
          }

          for (const row of rows) {
            const regNoRaw = pickField(row, [detectedRegCol, ...REG_ALIASES])
              .trim()
              .toUpperCase();

            if (!regNoRaw || !looksLikeMujRegNo(regNoRaw)) continue;
            const regNo = regNoRaw;

            const nameFull = pickField(row, NAME_ALIASES).trim();
            const name =
              !nameFull || nameFull === "nan" || nameFull === "NaN"
                ? "Unknown"
                : nameFull.toUpperCase();

            const sectionFull = pickField(row, SECTION_ALIASES).trim();
            const section =
              sectionFull === "nan" || sectionFull === "NaN" ? "" : sectionFull;

            const year = getYearFromRegNo(regNo);

            if (!newStudents[regNo]) addedCount++;
            newStudents[regNo] = { regNo, name, section, year };
          }
        }

        const newData = { ...data, students: newStudents };
        setData(newData);
        await saveData(newData);
        setUploadStatus(
          `✅ Done! Added ${addedCount} new students. Total: ${Object.keys(newStudents).length}`
        );
        setTimeout(() => {
          setUploadStatus(null);
          setShowUpload(false);
        }, 3000);
      } catch (err) {
        setUploadStatus(
          `❌ Error: ${err instanceof Error ? err.message : "Failed to parse file"}`
        );
      }
    },
    [data, setData, saveData]
  );

  // ── Add/Edit Student ─────────────────────────────
  const [formReg, setFormReg] = useState("");
  const [formName, setFormName] = useState("");
  const [formSection, setFormSection] = useState("");
  const [formPeSection, setFormPeSection] = useState("");

  const startEdit = (regNo: string) => {
    const st = data.students[regNo];
    setFormReg(regNo);
    setFormName(st.name);
    setFormSection(st.section);
    setFormPeSection(st.peSection || "");
    setEditingReg(regNo);
    setShowAddForm(true);
  };

  const saveStudent = async () => {
    const regNo = formReg.trim().toUpperCase();
    if (!regNo) return;

    const newStudents = { ...data.students };
    const pe = formPeSection.trim();
    newStudents[regNo] = {
      regNo,
      name: formName.trim() || "Unknown",
      section: formSection.trim(),
      ...(pe ? { peSection: pe } : {}),
      year: getYearFromRegNo(regNo),
    };

    const newData = { ...data, students: newStudents };
    setData(newData);
    await saveData(newData);
    setShowAddForm(false);
    setEditingReg(null);
    setFormReg("");
    setFormName("");
    setFormSection("");
    setFormPeSection("");
  };

  const deleteStudent = async (regNo: string) => {
    const newStudents = { ...data.students };
    delete newStudents[regNo];
    const newData = { ...data, students: newStudents };
    setData(newData);
    await saveData(newData);
  };

  // ── Download as CSV ──────────────────────────────
  const downloadCSV = () => {
    const header = "Registration No,Student Name,Section,PE Section,Year\n";
    const rows = students
      .map(([reg, st]) => `${reg},${st.name},${st.section},${st.peSection || ""},${st.year}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students_master_list.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between flex-wrap gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1
            className="text-2xl font-black tracking-tight"
            style={{
              color: "var(--text-1)",
              fontFamily: "var(--font-head, sans-serif)",
            }}
          >
            Student Registry — {yearLabel}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-3)" }}>
            {students.length.toLocaleString()} students loaded
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            className="pill-btn text-xs px-4 py-2"
            style={{
              background: "var(--card-bg)",
              color: "var(--text-1)",
              border: "2px solid var(--card-border)",
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={downloadCSV}
          >
            <Download size={14} /> Export CSV
          </motion.button>
          <motion.button
            className="pill-btn text-xs px-4 py-2"
            style={{
              background: "var(--card-bg)",
              color: "var(--text-1)",
              border: "2px solid var(--card-border)",
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setShowAddForm(true);
              setEditingReg(null);
              setFormReg("");
              setFormName("");
              setFormSection("");
              setFormPeSection("");
            }}
          >
            <Plus size={14} /> Add Student
          </motion.button>
          <motion.button
            className="pill-btn text-xs px-4 py-2"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowUpload(true)}
          >
            <Upload size={14} /> Upload Excel
          </motion.button>
        </div>
      </motion.div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !uploadStatus && setShowUpload(false)}
          >
            <motion.div
              className="card p-8 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-lg font-black"
                  style={{
                    color: "var(--text-1)",
                    fontFamily: "var(--font-head, sans-serif)",
                  }}
                >
                  Upload {yearLabel} Master List
                </h2>
                <button
                  onClick={() => setShowUpload(false)}
                  style={{ color: "var(--text-3)" }}
                >
                  <X size={18} />
                </button>
              </div>

              <div
                className="border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all hover:opacity-70"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--input-bg)",
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handleFileUpload(file);
                }}
              >
                <FileSpreadsheet
                  size={36}
                  className="mx-auto mb-3"
                  style={{ color: "var(--text-3)" }}
                />
                <p
                  className="text-sm font-bold mb-1"
                  style={{ color: "var(--text-1)" }}
                >
                  Drop Excel/CSV here or click to browse
                </p>
                <p
                  className="text-[11px]"
                  style={{ color: "var(--text-3)" }}
                >
                  Supports .xlsx, .xls, .csv files
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
              </div>

              {uploadStatus && (
                <p
                  className="text-sm font-semibold mt-4 text-center"
                  style={{ color: "var(--text-2)" }}
                >
                  {uploadStatus}
                </p>
              )}

              <div
                className="mt-4 p-3 rounded-xl text-[11px]"
                style={{
                  background: "var(--input-bg)",
                  border: "1.5px solid var(--border)",
                  color: "var(--text-3)",
                }}
              >
                <p className="font-bold mb-1" style={{ color: "var(--text-2)" }}>
                  Expected Columns:
                </p>
                <p>
                  Registration No, Student Name, Core Section
                </p>
                <p className="mt-1">
                  Column names are auto-detected. Existing students will be
                  updated, new ones added.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              className="card p-6 w-full max-w-sm"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                className="text-lg font-black mb-4"
                style={{
                  color: "var(--text-1)",
                  fontFamily: "var(--font-head, sans-serif)",
                }}
              >
                {editingReg ? "Edit Student" : "Add Student"}
              </h2>
              <div className="space-y-3">
                <input
                  placeholder="Registration No (e.g. 23FE10CAI00001)"
                  value={formReg}
                  onChange={(e) => setFormReg(e.target.value.toUpperCase())}
                  disabled={!!editingReg}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none"
                  style={{
                    border: "2px solid var(--card-border)",
                    background: editingReg
                      ? "var(--badge-light-bg)"
                      : "var(--input-bg)",
                    color: "var(--text-1)",
                    fontFamily: "var(--font-mono)",
                  }}
                />
                <input
                  placeholder="Student Name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value.toUpperCase())}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none"
                  style={{
                    border: "2px solid var(--card-border)",
                    background: "var(--input-bg)",
                    color: "var(--text-1)",
                  }}
                />
                <div className="flex gap-2">
                  <input
                    placeholder="Core Sec (e.g. A)"
                    value={formSection}
                    onChange={(e) =>
                      setFormSection(e.target.value.toUpperCase())
                    }
                    className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none"
                    style={{
                      border: "2px solid var(--card-border)",
                      background: "var(--input-bg)",
                      color: "var(--text-1)",
                    }}
                  />
                  <input
                    placeholder="PE Sec (e.g. B)"
                    value={formPeSection}
                    onChange={(e) =>
                      setFormPeSection(e.target.value.toUpperCase())
                    }
                    className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none"
                    style={{
                      border: "2px solid var(--card-border)",
                      background: "var(--input-bg)",
                      color: "var(--text-1)",
                    }}
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="pill-btn flex-1 text-xs py-2.5"
                    style={{
                      background: "var(--card-bg)",
                      color: "var(--text-1)",
                      border: "2px solid var(--card-border)",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveStudent}
                    disabled={!formReg.trim()}
                    className="pill-btn flex-1 text-xs py-2.5"
                  >
                    <CheckCircle2 size={14} />{" "}
                    {editingReg ? "Update" : "Add"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <motion.div
        className="card p-4 flex flex-wrap items-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex-1 min-w-[200px] relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-3)" }}
          />
          <input
            placeholder="Search by name or reg no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none"
            style={{
              border: "1.5px solid var(--border)",
              background: "var(--input-bg)",
              color: "var(--text-1)",
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: "var(--text-3)" }} />
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
            style={{
              border: "1.5px solid var(--border)",
              background: "var(--input-bg)",
              color: "var(--text-1)",
            }}
          >
            <option value="ALL">All Sections</option>
            {sections.map((s) => (
              <option key={s} value={s}>
                Section {s}
              </option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
            style={{
              border: "1.5px solid var(--border)",
              background: "var(--input-bg)",
              color: "var(--text-1)",
            }}
          >
            <option value="ALL">All Years</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                Year {y}
              </option>
            ))}
          </select>
        </div>
        <span
          className="text-[11px] font-bold"
          style={{ color: "var(--text-3)" }}
        >
          Showing {filtered.length} of {students.length}
        </span>
      </motion.div>

      {/* Student Table */}
      <motion.div
        className="card overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  background: "var(--pill-bg)",
                  color: "var(--pill-text)",
                }}
              >
                <th
                  className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-head, sans-serif)" }}
                >
                  Reg No
                </th>
                <th
                  className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-head, sans-serif)" }}
                >
                  Name
                </th>
                <th
                  className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-head, sans-serif)" }}
                >
                  Core Sec
                </th>
                <th
                  className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-head, sans-serif)" }}
                >
                  PE Sec
                </th>
                <th
                  className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-head, sans-serif)" }}
                >
                  Year
                </th>
                <th
                  className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-head, sans-serif)" }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map(([regNo, st], i) => (
                <tr
                  key={regNo}
                  className="transition-colors"
                  style={{
                    borderBottom: "1.5px solid var(--border)",
                    background:
                      i % 2 === 0 ? "transparent" : "var(--input-bg)",
                  }}
                >
                  <td
                    className="px-4 py-2.5 font-bold text-xs"
                    style={{
                      color: "var(--text-1)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {regNo}
                  </td>
                  <td
                    className="px-4 py-2.5 font-semibold text-xs"
                    style={{ color: "var(--text-1)" }}
                  >
                    {st.name}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="badge-dark text-[10px]">
                      {st.section || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {st.peSection ? (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                        style={{
                          background: "rgba(139,92,246,0.1)",
                          color: "#8b5cf6",
                          border: "1px solid rgba(139,92,246,0.25)",
                        }}
                      >
                        {st.peSection}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-3)", fontSize: "10px" }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="badge-light text-[10px]">
                      Year {st.year}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => startEdit(regNo)}
                        className="p-1.5 rounded-lg transition-all hover:opacity-70"
                        style={{
                          color: "var(--text-2)",
                          background: "var(--input-bg)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => deleteStudent(regNo)}
                        className="p-1.5 rounded-lg transition-all hover:opacity-70"
                        style={{
                          color: "#ef4444",
                          background: "rgba(239,68,68,0.06)",
                          border: "1px solid rgba(239,68,68,0.2)",
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 100 && (
          <div
            className="px-4 py-3 text-center text-xs font-semibold"
            style={{
              color: "var(--text-3)",
              borderTop: "1.5px solid var(--border)",
            }}
          >
            Showing first 100 of {filtered.length} results. Use search to
            narrow down.
          </div>
        )}
        {filtered.length === 0 && (
          <div className="px-4 py-10 text-center">
            <Users
              size={28}
              className="mx-auto mb-2"
              style={{ color: "var(--text-3)" }}
            />
            <p
              className="text-sm font-bold"
              style={{ color: "var(--text-3)" }}
            >
              {students.length === 0
                ? "No students yet. Upload an Excel file to get started."
                : "No students match your filters."}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
