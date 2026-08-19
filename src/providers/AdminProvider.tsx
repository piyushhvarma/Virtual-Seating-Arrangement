"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import type { AdminData, YearScopedData, ExamMeta } from "@/lib/adminTypes";
import { createEmptyAdminData, AVAILABLE_YEARS, migrateV1toV2 } from "@/lib/adminTypes";

interface AdminContextType {
  // ── Full data (for cross-year operations like publish) ──
  token: string;
  fullData: AdminData;

  // ── Year selection ──
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  yearLabel: string;

  // ── Year-scoped data (what tab pages use — identical shape to old AdminData) ──
  data: YearScopedData;
  setData: (data: YearScopedData) => void;
  saveData: (data?: YearScopedData) => Promise<void>;

  // ── Global meta ──
  examMeta: ExamMeta;
  setExamMeta: (meta: ExamMeta) => void;
  saveExamMeta: (meta: ExamMeta) => Promise<void>;

  // ── Status ──
  loading: boolean;
  lastSaved: string | null;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function useAdmin(): AdminContextType {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}

export function AdminProvider({
  token,
  children,
}: {
  token: string;
  children: ReactNode;
}) {
  const [fullData, setFullData] = useState<AdminData>(createEmptyAdminData());
  const [selectedYear, setSelectedYear] = useState("3"); // Default to 3rd year
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Load admin data on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/data", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success && json.data) {
          // Handle v1 → v2 migration
          let loaded = json.data as AdminData;
          if (!loaded.years || loaded.version < 2) {
            loaded = migrateV1toV2(loaded);
          }
          setFullData(loaded);
        }
      } catch {
        // Keep empty data
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  // ── Year-scoped view ─────────────────────────────
  const yearData = useMemo((): YearScopedData => {
    const yd = fullData.years[selectedYear];
    if (!yd) {
      return {
        examMeta: fullData.examMeta,
        published: false,
        students: {},
        electiveGroups: [],
        subjects: [],
        roomAssignments: [],
        lastModified: new Date().toISOString(),
      };
    }
    return {
      examMeta: fullData.examMeta,
      published: yd.published,
      students: yd.students,
      electiveGroups: yd.electiveGroups ?? [],
      subjects: yd.subjects,
      roomAssignments: yd.roomAssignments,
      lastModified: yd.lastModified,
    };
  }, [fullData, selectedYear]);

  const yearLabel = useMemo(() => {
    return AVAILABLE_YEARS.find((y) => y.key === selectedYear)?.label || `Year ${selectedYear}`;
  }, [selectedYear]);

  // ── Write to server ──────────────────────────────
  const persistToServer = useCallback(
    async (newFullData: AdminData) => {
      try {
        const res = await fetch("/api/admin/data", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ data: newFullData }),
        });

        if (res.status === 409) {
          alert("CRITICAL ERROR: Data has been modified by another admin concurrently.\nThe page will now reload to prevent overwriting their work.");
          window.location.reload();
          return;
        }

        const json = await res.json();
        if (json.success) {
          setLastSaved(new Date().toLocaleTimeString());
          if (json.newVersion) {
            setFullData((prev) => ({ ...prev, version: json.newVersion }));
          }
        }
      } catch {
        // Handle error silently
      }
    },
    [token]
  );

  // ── Set year-scoped data (merges back into fullData) ──
  const setData = useCallback(
    (scopedData: YearScopedData) => {
      setFullData((prev) => ({
        ...prev,
        years: {
          ...prev.years,
          [selectedYear]: {
            ...prev.years[selectedYear],
            published: scopedData.published,
            students: scopedData.students,
            electiveGroups: scopedData.electiveGroups ?? [],
            subjects: scopedData.subjects,
            roomAssignments: scopedData.roomAssignments,
            lastModified: new Date().toISOString(),
          },
        },
        lastModified: new Date().toISOString(),
      }));
    },
    [selectedYear]
  );

  // ── Save year-scoped data ────────────────────────
  const saveData = useCallback(
    async (newScopedData?: YearScopedData) => {
      const toUse = newScopedData || yearData;
      const newFull: AdminData = {
        ...fullData,
        years: {
          ...fullData.years,
          [selectedYear]: {
            ...fullData.years[selectedYear],
            published: toUse.published,
            students: toUse.students,
            electiveGroups: toUse.electiveGroups ?? [],
            subjects: toUse.subjects,
            roomAssignments: toUse.roomAssignments,
            lastModified: new Date().toISOString(),
          },
        },
        lastModified: new Date().toISOString(),
      };
      setFullData(newFull);
      await persistToServer(newFull);
    },
    [fullData, yearData, selectedYear, persistToServer]
  );

  // ── Global exam meta ─────────────────────────────
  const setExamMeta = useCallback((meta: ExamMeta) => {
    setFullData((prev) => ({ ...prev, examMeta: meta }));
  }, []);

  const saveExamMeta = useCallback(
    async (meta: ExamMeta) => {
      const newFull = { ...fullData, examMeta: meta, lastModified: new Date().toISOString() };
      setFullData(newFull);
      await persistToServer(newFull);
    },
    [fullData, persistToServer]
  );

  return (
    <AdminContext.Provider
      value={{
        token,
        fullData,
        selectedYear,
        setSelectedYear,
        yearLabel,
        data: yearData,
        setData,
        saveData,
        examMeta: fullData.examMeta,
        setExamMeta,
        saveExamMeta,
        loading,
        lastSaved,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
