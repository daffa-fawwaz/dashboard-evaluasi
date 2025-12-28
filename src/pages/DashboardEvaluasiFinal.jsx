import React, { useState, useMemo, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  Edit3,
  Trash2,
  Plus,
  X,
  Target,
  BarChart2,
  List,
  Layers,
  Zap,
  Clipboard,
  PieChart,
  Copy,
  Eye,
  EyeOff,
  Save,
  UserX,
  HelpCircle,
  Shield,
  User,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
} from "lucide-react";

// --- COMPONENTS ---

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-slate-100 p-4 ${className}`}
  >
    {children}
  </div>
);

const Badge = ({ children, type = "neutral", icon: Icon }) => {
  const colors = {
    neutral: "bg-slate-100 text-slate-600 border border-slate-200",
    success: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-100 text-amber-700 border border-amber-200",
    danger: "bg-rose-100 text-rose-700 border border-rose-200",
    blue: "bg-blue-100 text-blue-700 border border-blue-200",
    purple: "bg-purple-100 text-purple-700 border border-purple-200",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wide border flex items-center gap-1 w-fit ${
        colors[type] || colors.neutral
      }`}
    >
      {Icon && <Icon size={10} />}
      {children}
    </span>
  );
};

const MiniTrend = () => {
  return (
    <div className="flex items-end gap-1 h-8 w-20">
      {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
        <div key={i} className="bg-indigo-100 w-2 rounded-sm relative group">
          <div
            className={`absolute bottom-0 w-full bg-indigo-500 rounded-sm transition-all duration-500 group-hover:bg-indigo-600`}
            style={{ height: `${h}%` }}
          ></div>
        </div>
      ))}
    </div>
  );
};

const SmartSlider = ({ label, name, value, onChange, helpText }) => {
  const getColor = (val) => {
    if (val < 50) return "bg-rose-500";
    if (val < 80) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div>
      <div className="flex justify-between mb-2">
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
        <span
          className={`text-sm font-bold px-2 py-0.5 rounded ${
            value < 100 ? "bg-slate-100" : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {value}%
        </span>
      </div>
      <input
        type="range"
        name={name}
        min="0"
        max="100"
        value={value}
        onChange={onChange}
        className={`w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 accent-slate-600`}
      />
      <div className="w-full h-1 mt-1 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getColor(value)}`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
      <p className="text-[10px] text-slate-500 mt-1.5">{helpText}</p>
    </div>
  );
};

const ProgressBar = ({ label, value }) => {
  const getColor = (val) => {
    if (val < 50) return "bg-rose-500";
    if (val < 80) return "bg-amber-500";
    return "bg-emerald-500";
  };
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-bold text-slate-800">{value}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${getColor(
            value
          )}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  themeColor = "indigo",
  inputType,
}) => {
  if (!isOpen) return null;

  const headerColors = {
    indigo: "border-t-indigo-500",
    amber: "border-t-amber-500",
    emerald: "border-t-emerald-500",
    rose: "border-t-rose-500",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm transition-opacity">
      <div
        className={`bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200 border-t-8 ${
          headerColors[themeColor] || headerColors.indigo
        }`}
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b px-6 py-4 flex justify-between items-center z-10">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            {inputType === "problem" && (
              <AlertTriangle size={20} className="text-amber-500" />
            )}
            {inputType === "program" && (
              <Zap size={20} className="text-emerald-500" />
            )}
            {inputType === "discipline" && (
              <Shield size={20} className="text-rose-500" />
            )}
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default function DashboardEvaluasiFinal() {
  // --- STATES ---
  const [problems, setProblems] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState("problems");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [inputType, setInputType] = useState("problem");
  const [editingItem, setEditingItem] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [meetingMode, setMeetingMode] = useState(false);
  const [draftData, setDraftData] = useState(null);

  // --- SUPABASE FETCH FUNCTIONS ---
  const fetchProblems = async () => {
    const { data, error } = await supabase
      .from("problems")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching problems:", error);
      return [];
    }
    return data.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      rootCause: p.root_cause,
      impact: p.impact,
      solution: p.solution,
      pj: p.pj,
      deadline: p.deadline,
      status: p.status,
      priority: p.priority,
      createdAt: p.created_at,
    }));
  };

  const fetchPrograms = async () => {
    const { data, error } = await supabase
      .from("programs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching programs:", error);
      return [];
    }
    return data.map((p) => ({
      id: p.id,
      title: p.title,
      implProgress: p.impl_progress,
      goalProgress: p.goal_progress,
      problemNote: p.problem_note,
      solutionNote: p.solution_note,
      pj: p.pj,
      deadline: p.deadline,
      createdAt: p.created_at,
    }));
  };

  const fetchDisciplineLogs = async () => {
    const { data, error } = await supabase
      .from("discipline_logs")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching discipline logs:", error);
      return [];
    }
    return data.map((l) => ({
      id: l.id,
      studentName: l.student_name,
      studentClass: l.student_class,
      type: l.type,
      points: l.points,
      note: l.note,
      officer: l.officer,
      date: l.date,
    }));
  };

  // Load all data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [problemsData, programsData, logsData] = await Promise.all([
        fetchProblems(),
        fetchPrograms(),
        fetchDisciplineLogs(),
      ]);
      setProblems(problemsData);
      setPrograms(programsData);
      setLogs(logsData);
      setLoading(false);
    };
    loadData();
  }, []);

  // --- SMART SUGGESTIONS ---
  const suggestions = useMemo(() => {
    const categories = new Set();
    const roots = new Set();
    const students = new Set();

    problems.forEach((p) => {
      if (p.category) categories.add(p.category);
      if (p.rootCause) roots.add(p.rootCause);
    });

    logs.forEach((l) => {
      if (l.studentName) students.add(l.studentName);
    });

    return {
      categories: Array.from(categories),
      roots: Array.from(roots),
      students: Array.from(students),
    };
  }, [problems, logs]);

  // --- ANALYTICS (MAIN DASHBOARD) ---
  const stats = useMemo(() => {
    const programIssues = programs.filter(
      (p) =>
        (parseInt(p.implProgress) < 100 || parseInt(p.goalProgress) < 100) &&
        p.problemNote
    );

    const allIssues = [
      ...problems.map((p) => ({ ...p, sourceType: "manual" })),
      ...programIssues.map((p) => ({
        title: `Isu Program: ${p.title}`,
        rootCause: p.problemNote,
        category: "Efektivitas Program",
        status: p.deadline ? "Progress" : "Open",
        deadline: p.deadline,
        priority: "Tinggi",
        solution: p.solutionNote,
        pj: p.pj,
        sourceType: "program",
      })),
    ];

    const total = allIssues.length;
    const active = allIssues.filter((p) => p.status !== "Selesai").length;
    const today = new Date().toISOString().split("T")[0];
    const critical = allIssues.filter(
      (p) =>
        p.status !== "Selesai" &&
        (p.priority === "Tinggi" || (p.deadline && p.deadline < today))
    ).length;
    const noSolution = allIssues.filter(
      (p) => !p.solution || p.solution.trim() === ""
    ).length;
    const noPJ = allIssues.filter((p) => !p.pj || p.pj.trim() === "").length;

    const rootCauses = allIssues.map((p) => p.rootCause).filter(Boolean);
    const rootCounts = rootCauses.reduce((acc, curr) => {
      const key = curr.toLowerCase().trim();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const displayRoot = Object.keys(rootCounts)
      .map((key) => {
        const originalText = rootCauses.find(
          (r) => r.toLowerCase().trim() === key
        );
        return [originalText, rootCounts[key]];
      })
      .sort((a, b) => b[1] - a[1]);
    const dominantRoot = displayRoot[0];

    const catCounts = allIssues.reduce((acc, curr) => {
      const key = curr.category ? curr.category.trim() : "Uncategorized";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const sortedCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);

    let programScore =
      programs.length > 0
        ? programs.reduce((acc, p) => acc + parseInt(p.goalProgress), 0) /
          programs.length
        : 100;
    let problemScore =
      problems.length > 0
        ? (problems.filter((p) => p.status === "Selesai").length /
            problems.length) *
          100
        : 100;
    const penalty = Math.min(critical * 5, 20);
    const healthScore = Math.max(
      0,
      Math.round((programScore + problemScore) / 2 - penalty)
    );

    return {
      total,
      active,
      critical,
      dominantRoot,
      sortedCats,
      displayRoot,
      healthScore,
      noSolution,
      noPJ,
    };
  }, [problems, programs]);

  // --- ANALYTICS (DISCIPLINE) ---
  const disciplineStats = useMemo(() => {
    const studentMap = {};
    let positiveCount = 0;
    let negativeCount = 0;
    let todayCount = 0;
    const todayStr = new Date().toISOString().split("T")[0];

    logs.forEach((log) => {
      if (log.date === todayStr) todayCount++;

      if (log.points > 0) negativeCount++;
      if (log.points < 0) positiveCount++;

      if (!studentMap[log.studentName]) {
        studentMap[log.studentName] = {
          name: log.studentName,
          class: log.studentClass || "N/A",
          totalPoints: 0,
          violationCount: 0,
          appreciationCount: 0,
          lastLog: log.date,
        };
      }
      studentMap[log.studentName].totalPoints += parseInt(log.points);
      if (parseInt(log.points) > 0)
        studentMap[log.studentName].violationCount++;
      else studentMap[log.studentName].appreciationCount++;
    });

    const students = Object.values(studentMap).sort(
      (a, b) => b.totalPoints - a.totalPoints
    );
    const attentionList = students.filter((s) => s.totalPoints > 0).slice(0, 5);

    return {
      students,
      attentionList,
      todayCount,
      positiveCount,
      negativeCount,
    };
  }, [logs]);

  // --- HANDLERS ---
  const handleDelete = async (id, type) => {
    if (window.confirm("Hapus data ini?")) {
      if (type === "problem") {
        const { error } = await supabase.from("problems").delete().eq("id", id);
        if (!error) setProblems(problems.filter((p) => p.id !== id));
      } else if (type === "program") {
        const { error } = await supabase.from("programs").delete().eq("id", id);
        if (!error) setPrograms(programs.filter((p) => p.id !== id));
      } else if (type === "discipline") {
        const { error } = await supabase
          .from("discipline_logs")
          .delete()
          .eq("id", id);
        if (!error) setLogs(logs.filter((l) => l.id !== id));
      }
    }
  };

  const handleClone = async (item, type) => {
    if (type === "problem") {
      const { data, error } = await supabase
        .from("problems")
        .insert({
          title: `${item.title} (Salinan)`,
          category: item.category,
          root_cause: item.rootCause,
          impact: item.impact,
          solution: item.solution,
          pj: item.pj,
          deadline: item.deadline,
          status: item.status,
          priority: item.priority,
        })
        .select();

      if (!error && data) {
        const newProblems = await fetchProblems();
        setProblems(newProblems);
      }
    } else if (type === "program") {
      const { data, error } = await supabase
        .from("programs")
        .insert({
          title: `${item.title} (Salinan)`,
          impl_progress: item.implProgress,
          goal_progress: item.goalProgress,
          problem_note: item.problemNote,
          solution_note: item.solutionNote,
          pj: item.pj,
          deadline: item.deadline,
        })
        .select();

      if (!error && data) {
        const newPrograms = await fetchPrograms();
        setPrograms(newPrograms);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setDraftData(null);

    if (inputType === "problem") {
      const problemData = {
        title: formData.get("title"),
        category: formData.get("category"),
        root_cause: formData.get("rootCause"),
        impact: formData.get("impact"),
        solution: formData.get("solution"),
        pj: formData.get("pj"),
        deadline: formData.get("deadline"),
        status: formData.get("status"),
        priority: formData.get("priority"),
      };

      if (editingItem) {
        const { error } = await supabase
          .from("problems")
          .update(problemData)
          .eq("id", editingItem.id);

        if (!error) {
          const newProblems = await fetchProblems();
          setProblems(newProblems);
        }
      } else {
        const { error } = await supabase.from("problems").insert(problemData);

        if (!error) {
          const newProblems = await fetchProblems();
          setProblems(newProblems);
        }
      }
    } else if (inputType === "program") {
      const programData = {
        title: formData.get("title"),
        impl_progress: formData.get("implProgress") || 0,
        goal_progress: formData.get("goalProgress") || 0,
        problem_note: formData.get("problemNote"),
        solution_note: formData.get("solutionNote"),
        pj: formData.get("pj"),
        deadline: formData.get("deadline"),
      };

      if (editingItem) {
        const { error } = await supabase
          .from("programs")
          .update(programData)
          .eq("id", editingItem.id);

        if (!error) {
          const newPrograms = await fetchPrograms();
          setPrograms(newPrograms);
        }
      } else {
        const { error } = await supabase.from("programs").insert(programData);

        if (!error) {
          const newPrograms = await fetchPrograms();
          setPrograms(newPrograms);
        }
      }
    } else if (inputType === "discipline") {
      const pointValue = parseInt(formData.get("pointValue"));
      const isViolation = formData.get("type") === "violation";
      const finalPoints = isViolation ? pointValue : -pointValue;

      const logData = {
        student_name: formData.get("studentName"),
        student_class: formData.get("studentClass"),
        type: isViolation ? "violation" : "appreciation",
        points: finalPoints,
        note: formData.get("note"),
        officer: formData.get("officer"),
      };

      const { error } = await supabase.from("discipline_logs").insert(logData);

      if (!error) {
        const newLogs = await fetchDisciplineLogs();
        setLogs(newLogs);
      }
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleEscalateToProblem = (student) => {
    setIsDetailModalOpen(false);
    setInputType("problem");
    setEditingItem({
      id: null,
      title: `Pola Disiplin: ${student.name}`,
      category: "Disiplin Bahasa",
      rootCause: "Perlu analisis mendalam pada individu/kelompok",
      impact: `Total Poin ${student.totalPoints} dengan ${student.violationCount} pelanggaran.`,
      priority: "Tinggi",
      status: "Open",
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const formData = new FormData(e.currentTarget.form);
    const data = Object.fromEntries(formData.entries());
    setDraftData(data);
  };

  const openNew = () => {
    setEditingItem(null);
    if (viewMode === "discipline") setInputType("discipline");
    else if (viewMode === "programs") setInputType("program");
    else setInputType("problem");
    setIsModalOpen(true);
  };

  const openEdit = (item, type) => {
    setEditingItem(item);
    setInputType(type);
    setIsModalOpen(true);
  };

  const openStudentDetail = (student) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
  };

  const [formImplProgress, setFormImplProgress] = useState(0);
  const [formGoalProgress, setFormGoalProgress] = useState(0);
  const [discType, setDiscType] = useState("violation");

  useEffect(() => {
    if (editingItem && inputType === "program") {
      setFormImplProgress(editingItem.implProgress);
      setFormGoalProgress(editingItem.goalProgress);
    } else {
      setFormImplProgress(100);
      setFormGoalProgress(100);
    }
  }, [editingItem, inputType]);

  const getStatusBadge = (status) => {
    if (!status) return "neutral";
    if (status === "Selesai") return "success";
    if (status === "Progress") return "blue";
    if (status === "Open") return "warning";
    return "neutral";
  };

  const getHealthColor = (score) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-amber-600";
    return "text-rose-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Activity
            className="animate-spin text-indigo-600 mx-auto mb-4"
            size={48}
          />
          <p className="text-slate-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      {/* HEADER */}
      <header
        className={`bg-white border-b sticky top-0 z-30 px-4 py-3 md:px-8 flex flex-col md:flex-row justify-between items-center shadow-sm gap-4 transition-all duration-300 ${
          meetingMode ? "opacity-95" : ""
        }`}
      >
        <div className="flex items-center gap-4 w-full md:w-auto justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="text-indigo-600" /> Dashboard Evaluasi
            </h1>
          </div>
          <button
            onClick={() => setMeetingMode(!meetingMode)}
            className={`md:hidden p-2 rounded-full ${
              meetingMode
                ? "bg-indigo-100 text-indigo-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {meetingMode ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>

        <div className="flex gap-2 items-center w-full md:w-auto justify-end flex-wrap md:flex-nowrap">
          <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setViewMode("problems")}
              className={`flex-1 md:flex-none px-3 py-1.5 text-sm rounded-md transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                viewMode === "problems"
                  ? "bg-white shadow text-amber-600 font-bold"
                  : "text-slate-500"
              }`}
            >
              <AlertTriangle size={14} /> {!meetingMode && "Masalah"}
            </button>
            <button
              onClick={() => setViewMode("programs")}
              className={`flex-1 md:flex-none px-3 py-1.5 text-sm rounded-md transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                viewMode === "programs"
                  ? "bg-white shadow text-emerald-600 font-bold"
                  : "text-slate-500"
              }`}
            >
              <Zap size={14} /> {!meetingMode && "Program"}
            </button>
            <button
              onClick={() => setViewMode("discipline")}
              className={`flex-1 md:flex-none px-3 py-1.5 text-sm rounded-md transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                viewMode === "discipline"
                  ? "bg-white shadow text-rose-600 font-bold"
                  : "text-slate-500"
              }`}
            >
              <Shield size={14} /> {!meetingMode && "Disiplin"}
            </button>
          </div>

          <button
            onClick={() => setMeetingMode(!meetingMode)}
            className={`hidden md:flex p-2 rounded-lg items-center gap-2 text-sm font-medium transition-colors ${
              meetingMode
                ? "bg-indigo-100 text-indigo-700"
                : "bg-white border hover:bg-slate-50 text-slate-500"
            }`}
            title="Mode Rapat"
          >
            {meetingMode ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>

          {!meetingMode && (
            <button
              onClick={openNew}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-slate-300"
            >
              <Plus size={16} /> <span className="hidden sm:inline">Input</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
        {/* ZONA A: RINGKASAN STRATEGIS (CONDITIONAL) */}

        {viewMode !== "discipline" && (
          <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-2">
            {/* SYSTEM HEALTH SCORE */}
            <Card className="col-span-2 md:col-span-2 lg:col-span-2 border-l-4 border-l-indigo-500 flex items-center justify-between relative overflow-hidden">
              <div className="z-10">
                <div className="text-slate-500 text-xs font-semibold uppercase mb-1">
                  Skor Kesehatan Sistem
                </div>
                <div
                  className={`text-4xl font-black ${getHealthColor(
                    stats.healthScore
                  )}`}
                >
                  {stats.total === 0 && programs.length === 0
                    ? "-"
                    : stats.healthScore}
                  <span className="text-sm font-normal text-slate-400 ml-1">
                    /100
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <MiniTrend />
                  <span className="text-[10px] text-slate-400">
                    Trend 7 Hari
                  </span>
                </div>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-indigo-50 to-transparent"></div>
              <Activity
                className="text-indigo-100 absolute right-4 bottom-4"
                size={64}
              />
            </Card>

            <Card
              className={`border-l-4 ${
                stats.noSolution > 0
                  ? "border-l-rose-500 bg-rose-50/30"
                  : "border-l-slate-200"
              }`}
            >
              <div className="text-slate-500 text-xs font-semibold uppercase mb-1 flex items-center gap-1">
                <HelpCircle size={12} /> Tanpa Solusi
              </div>
              <div
                className={`text-2xl font-bold ${
                  stats.noSolution > 0 ? "text-rose-700" : "text-slate-700"
                }`}
              >
                {stats.noSolution}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Butuh diskusi tim
              </div>
            </Card>

            <Card
              className={`border-l-4 ${
                stats.noPJ > 0
                  ? "border-l-amber-500 bg-amber-50/30"
                  : "border-l-slate-200"
              }`}
            >
              <div className="text-slate-500 text-xs font-semibold uppercase mb-1 flex items-center gap-1">
                <UserX size={12} /> Tanpa PJ
              </div>
              <div
                className={`text-2xl font-bold ${
                  stats.noPJ > 0 ? "text-amber-700" : "text-slate-700"
                }`}
              >
                {stats.noPJ}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Belum ditugaskan
              </div>
            </Card>

            <Card className="border-l-4 border-l-amber-500 col-span-2 md:col-span-2 lg:col-span-2">
              <div className="text-amber-600 text-xs font-semibold uppercase mb-1">
                Penyebab Dominan
              </div>
              <div
                className="text-lg font-bold text-amber-800 truncate"
                title={stats.dominantRoot ? stats.dominantRoot[0] : "-"}
              >
                {stats.dominantRoot ? stats.dominantRoot[0] : "-"}
              </div>
              <div className="text-[10px] text-amber-600 mt-1">
                Muncul di {stats.dominantRoot ? stats.dominantRoot[1] : 0}{" "}
                masalah
              </div>
            </Card>
          </section>
        )}

        {/* ZONA A KHUSUS DISIPLIN */}
        {viewMode === "discipline" && (
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-2">
            <Card className="col-span-2 border-l-4 border-l-rose-500 bg-rose-50/20">
              <div className="text-rose-600 text-xs font-semibold uppercase mb-2 flex items-center gap-1">
                <AlertTriangle size={12} /> Santri Perlu Perhatian
              </div>
              <div className="space-y-2">
                {disciplineStats.attentionList.length > 0 ? (
                  disciplineStats.attentionList.map((s, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-sm border-b border-rose-100 pb-1 last:border-0 last:pb-0"
                    >
                      <span className="font-medium text-slate-700">
                        {s.name}
                      </span>
                      <span className="font-bold text-rose-600">
                        +{s.totalPoints}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-slate-400 italic">
                    Tidak ada santri di atas ambang batas.
                  </span>
                )}
              </div>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <div className="text-blue-600 text-xs font-semibold uppercase mb-1">
                Total Input Hari Ini
              </div>
              <div className="text-3xl font-black text-slate-800">
                {disciplineStats.todayCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Catatan masuk
              </div>
            </Card>

            <Card className="col-span-2 md:col-span-2 lg:col-span-2 border-l-4 border-l-slate-400">
              <div className="text-slate-500 text-xs font-semibold uppercase mb-1">
                Rasio Positif vs Negatif
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <ThumbsDown size={18} className="text-rose-500" />
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-rose-700">
                      {disciplineStats.negativeCount}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Pelanggaran
                    </span>
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="flex items-center gap-2">
                  <ThumbsUp size={18} className="text-emerald-500" />
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-emerald-700">
                      {disciplineStats.positiveCount}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Apresiasi
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* ZONA B: VISUALISASI MATRIKS (HANYA DI TAB PROBLEM) */}
        {stats.total > 0 && viewMode === "problems" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
            <Card className="lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <BarChart2 size={18} /> Akar Masalah (Pareto)
                </h3>
              </div>
              <div className="space-y-3">
                {stats.displayRoot.slice(0, 5).map(([root, count], idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-slate-700">
                          {root}
                        </span>
                        <span className="text-slate-500">{count} kasus</span>
                      </div>
                      <div className="w-full bg-slate-50 h-1.5 mt-1 rounded-full">
                        <div
                          className="bg-amber-400 h-1.5 rounded-full"
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* MATRIKS PRIORITAS */}
            <Card className="bg-slate-800 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-indigo-300">
                  <Layers size={18} /> Matriks Tindakan
                </h3>
                <div className="grid grid-cols-2 gap-2 text-center h-40">
                  <div className="bg-rose-600/20 border border-rose-500/50 rounded-lg flex flex-col items-center justify-center p-2">
                    <span className="text-2xl font-bold text-rose-400">
                      {stats.critical}
                    </span>
                    <span className="text-[10px] uppercase text-rose-200">
                      Kerjakan Sekarang
                    </span>
                  </div>
                  <div className="bg-amber-600/20 border border-amber-500/50 rounded-lg flex flex-col items-center justify-center p-2">
                    <span className="text-2xl font-bold text-amber-400">
                      {stats.active - stats.critical}
                    </span>
                    <span className="text-[10px] uppercase text-amber-200">
                      Jadwalkan
                    </span>
                  </div>
                  <div className="bg-emerald-600/20 border border-emerald-500/50 rounded-lg col-span-2 flex flex-col items-center justify-center p-2">
                    <span className="text-2xl font-bold text-emerald-400">
                      {stats.total - stats.active}
                    </span>
                    <span className="text-[10px] uppercase text-emerald-200">
                      Selesai / Teratasi
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ZONA C: LIST CONTENT (SWITCHABLE) */}

        {/* VIEW: DAFTAR MASALAH */}
        {viewMode === "problems" && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {problems.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <div className="inline-flex bg-slate-100 p-4 rounded-full mb-4">
                  <Clipboard className="text-slate-400" size={32} />
                </div>
                <h3 className="text-slate-900 font-medium mb-1">
                  Belum ada masalah tercatat
                </h3>
                <p className="text-slate-500 mb-4 text-sm">
                  Mulai petakan masalah untuk melihat analisis sistemik.
                </p>
                {!meetingMode && (
                  <button
                    onClick={() => {
                      setInputType("problem");
                      openNew();
                    }}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    + Input Masalah Baru
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {problems.map((problem) => (
                  <Card
                    key={problem.id}
                    className="relative group hover:shadow-lg transition-all border-t-4 border-t-transparent hover:border-t-amber-500 hover:-translate-y-1"
                  >
                    {/* ACTION BUTTONS */}
                    {!meetingMode && (
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white shadow-sm p-1 rounded-lg border border-slate-100">
                        <button
                          onClick={() => handleClone(problem, "problem")}
                          className="p-1.5 hover:bg-indigo-50 rounded text-indigo-600"
                          title="Duplikasi"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => openEdit(problem, "problem")}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-600"
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(problem.id, "problem")}
                          className="p-1.5 hover:bg-rose-50 rounded text-rose-600"
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}

                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge type={getStatusBadge(problem.status)}>
                          {problem.status || "Belum Ditentukan"}
                        </Badge>
                        <Badge type="blue" icon={Clipboard}>
                          Laporan Langsung
                        </Badge>
                        {problem.priority === "Tinggi" && (
                          <Badge type="danger">Urgent</Badge>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-800 leading-tight mb-1">
                        {problem.title || "Tanpa Judul"}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono bg-slate-50 inline-block px-1 rounded">
                        {problem.category || "Uncategorized"}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm mt-4 pt-4 border-t border-slate-50">
                      <div className="flex items-start gap-2">
                        <Target size={14} className="mt-0.5 text-amber-500" />
                        <span className="text-slate-600 text-xs">
                          Akar:{" "}
                          <span className="font-semibold text-slate-800">
                            {problem.rootCause || "-"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* VIEW: EFEKTIVITAS PROGRAM */}
        {viewMode === "programs" && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {programs.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <div className="inline-flex bg-slate-100 p-4 rounded-full mb-4">
                  <PieChart className="text-slate-400" size={32} />
                </div>
                <h3 className="text-slate-900 font-medium mb-1">
                  Belum ada evaluasi program
                </h3>
                <p className="text-slate-500 mb-4 text-sm">
                  Ukur efektivitas program Anda sekarang.
                </p>
                {!meetingMode && (
                  <button
                    onClick={() => {
                      setInputType("program");
                      openNew();
                    }}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    + Input Efektivitas Program
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {programs.map((program) => {
                  const isPerfect =
                    parseInt(program.implProgress) === 100 &&
                    parseInt(program.goalProgress) === 100;
                  return (
                    <Card
                      key={program.id}
                      className={`relative group hover:shadow-lg transition-all border-l-4 ${
                        isPerfect ? "border-l-emerald-500" : "border-l-rose-500"
                      } hover:-translate-y-1`}
                    >
                      {!meetingMode && (
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white shadow-sm p-1 rounded-lg border border-slate-100">
                          <button
                            onClick={() => handleClone(program, "program")}
                            className="p-1.5 hover:bg-indigo-50 rounded text-indigo-600"
                            title="Duplikasi"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            onClick={() => openEdit(program, "program")}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-600"
                            title="Edit"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(program.id, "program")}
                            className="p-1.5 hover:bg-rose-50 rounded text-rose-600"
                            title="Hapus"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                      <div className="flex gap-2 mb-2">
                        <Badge type="purple" icon={Zap}>
                          Evaluasi Program
                        </Badge>
                      </div>
                      <h3 className="font-bold text-slate-800 mb-4 pr-16 text-lg">
                        {program.title || "Program Tanpa Nama"}
                      </h3>
                      <div className="space-y-4 mb-4">
                        <ProgressBar
                          label="Penerapan"
                          value={program.implProgress}
                        />
                        <ProgressBar
                          label="Capaian Tujuan"
                          value={program.goalProgress}
                        />
                      </div>
                      {!isPerfect && (
                        <div className="mt-4 pt-3 border-t border-slate-100 bg-rose-50/30 -mx-4 -mb-4 p-4 rounded-b-xl">
                          <p className="text-xs font-bold text-rose-800 mb-2 flex items-center gap-1">
                            <AlertTriangle size={12} /> Kendala Utama
                          </p>
                          <p className="text-xs text-slate-700 mb-1 italic">
                            "{program.problemNote || "-"}"
                          </p>
                          <div className="flex justify-between mt-3 text-[10px] text-slate-500 border-t border-rose-200/50 pt-2">
                            <span>PJ: {program.pj || "-"}</span>
                            <span>Deadline: {program.deadline || "-"}</span>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* VIEW: DISIPLIN BAHASA (NEW LIST) */}
        {viewMode === "discipline" && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {disciplineStats.students.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <div className="inline-flex bg-slate-100 p-4 rounded-full mb-4">
                  <Shield className="text-slate-400" size={32} />
                </div>
                <h3 className="text-slate-900 font-medium mb-1">
                  Belum ada catatan kedisiplinan
                </h3>
                <p className="text-slate-500 mb-4 text-sm">
                  Catat pelanggaran atau apresiasi santri di sini.
                </p>
                {!meetingMode && (
                  <button
                    onClick={() => {
                      setInputType("discipline");
                      openNew();
                    }}
                    className="text-rose-600 font-bold hover:underline"
                  >
                    + Input Log Santri
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="grid grid-cols-12 gap-2 p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <div className="col-span-6 md:col-span-4">Santri</div>
                  <div className="col-span-2 md:col-span-2 text-center">
                    Kelas
                  </div>
                  <div className="col-span-4 md:col-span-6 text-right pr-4">
                    Total Poin
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {disciplineStats.students.map((student, idx) => {
                    const isHighRisk = student.totalPoints >= 10;
                    const isWarning =
                      student.totalPoints > 0 && student.totalPoints < 10;
                    const isSafe = student.totalPoints <= 0;

                    return (
                      <div
                        key={idx}
                        onClick={() => openStudentDetail(student)}
                        className="grid grid-cols-12 gap-2 p-4 items-center hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div className="col-span-6 md:col-span-4 font-bold text-slate-800 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <User size={16} />
                          </div>
                          {student.name}
                        </div>
                        <div className="col-span-2 md:col-span-2 text-center text-sm text-slate-500">
                          {student.class}
                        </div>
                        <div className="col-span-4 md:col-span-6 flex justify-end pr-4">
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1
                                                ${
                                                  isHighRisk
                                                    ? "bg-rose-100 text-rose-700"
                                                    : ""
                                                }
                                                ${
                                                  isWarning
                                                    ? "bg-amber-100 text-amber-700"
                                                    : ""
                                                }
                                                ${
                                                  isSafe
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : ""
                                                }
                                            `}
                          >
                            {student.totalPoints > 0
                              ? `+${student.totalPoints}`
                              : student.totalPoints}
                            {isHighRisk && <AlertTriangle size={12} />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* MODAL UTAMA */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingItem
            ? "Edit Data"
            : inputType === "problem"
            ? "Lapor Masalah"
            : inputType === "program"
            ? "Evaluasi Program"
            : "Catat Log Disiplin"
        }
        themeColor={
          inputType === "problem"
            ? "amber"
            : inputType === "program"
            ? "emerald"
            : "rose"
        }
        inputType={inputType}
      >
        {/* Toggle UI - Hanya muncul jika New Entry */}
        {!editingItem && (
          <div className="flex mb-6 bg-slate-100 p-1 rounded-xl overflow-x-auto">
            <button
              type="button"
              onClick={() => setInputType("problem")}
              className={`flex-1 min-w-[100px] py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                inputType === "problem"
                  ? "bg-white shadow-sm text-amber-600"
                  : "text-slate-400"
              }`}
            >
              Masalah
            </button>
            <button
              type="button"
              onClick={() => setInputType("program")}
              className={`flex-1 min-w-[100px] py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                inputType === "program"
                  ? "bg-white shadow-sm text-emerald-600"
                  : "text-slate-400"
              }`}
            >
              Program
            </button>
            <button
              type="button"
              onClick={() => setInputType("discipline")}
              className={`flex-1 min-w-[100px] py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                inputType === "discipline"
                  ? "bg-white shadow-sm text-rose-600"
                  : "text-slate-400"
              }`}
            >
              Disiplin
            </button>
          </div>
        )}

        <form
          onSubmit={handleSave}
          onChange={handleFormChange}
          className="space-y-5"
        >
          {/* FORM: MASALAH */}
          {inputType === "problem" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Judul Masalah
                </label>
                <input
                  name="title"
                  defaultValue={editingItem?.title || draftData?.title}
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  placeholder="Cth: Santri sering telat..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Kategori
                  </label>
                  <input
                    name="category"
                    list="categoryOptions"
                    defaultValue={editingItem?.category || draftData?.category}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="Ketik..."
                  />
                  <datalist id="categoryOptions">
                    {suggestions.categories.map((cat, idx) => (
                      <option key={idx} value={cat} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Akar Masalah
                  </label>
                  <input
                    name="rootCause"
                    list="rootOptions"
                    defaultValue={
                      editingItem?.rootCause || draftData?.rootCause
                    }
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="Penyebab utama..."
                  />
                  <datalist id="rootOptions">
                    {suggestions.roots.map((root, idx) => (
                      <option key={idx} value={root} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <textarea
                    name="solution"
                    defaultValue={editingItem?.solution || draftData?.solution}
                    rows="2"
                    className="w-full border rounded-lg p-2 text-sm"
                    placeholder="Rencana solusi..."
                  />
                  <div className="space-y-2">
                    <input
                      name="pj"
                      defaultValue={editingItem?.pj || draftData?.pj}
                      className="w-full border rounded-lg p-2 text-sm"
                      placeholder="PJ"
                    />
                    <input
                      type="date"
                      name="deadline"
                      defaultValue={
                        editingItem?.deadline || draftData?.deadline
                      }
                      className="w-full border rounded-lg p-2 text-sm text-slate-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FORM: PROGRAM */}
          {inputType === "program" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Nama Program
                </label>
                <input
                  name="title"
                  defaultValue={editingItem?.title || draftData?.title}
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Cth: Pemberian Kosakata Harian"
                />
              </div>
              <div className="bg-slate-50 p-6 rounded-xl space-y-6 border border-slate-200">
                <SmartSlider
                  label="1. Efektivitas Penerapan"
                  name="implProgress"
                  value={formImplProgress}
                  onChange={(e) => setFormImplProgress(e.target.value)}
                  helpText="Geser ke kiri jika terhambat."
                />
                <SmartSlider
                  label="2. Capaian Tujuan"
                  name="goalProgress"
                  value={formGoalProgress}
                  onChange={(e) => setFormGoalProgress(e.target.value)}
                  helpText="Geser ke kiri jika tidak sesuai target."
                />
              </div>
              {(formImplProgress < 100 || formGoalProgress < 100) && (
                <div className="bg-rose-50 p-5 rounded-xl border border-rose-100 animate-in slide-in-from-bottom-2">
                  <h4 className="font-bold text-rose-700 text-sm mb-4 flex items-center gap-2 pb-2 border-b border-rose-200">
                    <AlertTriangle size={16} /> Analisis Kendala
                  </h4>
                  <input
                    name="problemNote"
                    defaultValue={
                      editingItem?.problemNote || draftData?.problemNote
                    }
                    className="w-full border border-rose-200 rounded-lg p-2.5 text-sm mb-2"
                    placeholder="Kendala utama?"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      name="pj"
                      defaultValue={editingItem?.pj || draftData?.pj}
                      className="w-full border border-rose-200 rounded-lg p-2 text-sm"
                      placeholder="PJ"
                    />
                    <input
                      type="date"
                      name="deadline"
                      defaultValue={
                        editingItem?.deadline || draftData?.deadline
                      }
                      className="w-full border border-rose-200 rounded-lg p-2 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FORM: DISIPLIN */}
          {inputType === "discipline" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Toggle Type */}
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setDiscType("violation")}
                  className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 ${
                    discType === "violation"
                      ? "bg-white text-rose-600 shadow-sm"
                      : "text-slate-400"
                  }`}
                >
                  <ThumbsDown size={16} /> Pelanggaran
                </button>
                <button
                  type="button"
                  onClick={() => setDiscType("appreciation")}
                  className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 ${
                    discType === "appreciation"
                      ? "bg-white text-emerald-600 shadow-sm"
                      : "text-slate-400"
                  }`}
                >
                  <ThumbsUp size={16} /> Apresiasi
                </button>
              </div>

              {/* Hidden Input for Logic */}
              <input type="hidden" name="type" value={discType} />

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Nama Santri
                  </label>
                  <input
                    name="studentName"
                    list="studentOptions"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                    placeholder="Cari nama..."
                    required
                  />
                  <datalist id="studentOptions">
                    {suggestions.students.map((s, i) => (
                      <option key={i} value={s} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Kelas
                  </label>
                  <input
                    name="studentClass"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                    placeholder="X-A"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Poin{" "}
                  {discType === "violation" ? "(Menambah)" : "(Mengurangi)"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 5].map((pt) => (
                    <label
                      key={pt}
                      className={`border rounded-lg p-2 text-center cursor-pointer transition-all hover:bg-slate-50 flex flex-col items-center gap-1`}
                    >
                      <input
                        type="radio"
                        name="pointValue"
                        value={pt}
                        className="accent-rose-600 w-4 h-4"
                        defaultChecked={pt === 1}
                      />
                      <span className="text-sm font-bold">{pt} Poin</span>
                      <span className="text-[10px] text-slate-400">
                        {pt === 1 ? "Ringan" : pt === 2 ? "Sedang" : "Berat"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Catatan (Opsional)
                </label>
                <input
                  name="note"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                  placeholder="Keterangan kejadian..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Petugas
                </label>
                <input
                  name="officer"
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                  placeholder="Nama petugas..."
                />
              </div>
            </div>
          )}

          <div className="pt-6 mt-4 flex gap-3 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 font-medium text-slate-600 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`flex-1 py-2.5 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 ${
                inputType === "problem"
                  ? "bg-amber-600"
                  : inputType === "program"
                  ? "bg-emerald-600"
                  : "bg-rose-600"
              }`}
            >
              Simpan Data
            </button>
          </div>
        </form>
      </Modal>

      {/* DETAIL MODAL (SANTRI) */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Riwayat Santri"
        themeColor="rose"
        inputType="discipline"
      >
        {selectedStudent && (
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {selectedStudent.name}
                </h2>
                <p className="text-slate-500">{selectedStudent.class}</p>
              </div>
              <div
                className={`px-4 py-2 rounded-xl text-xl font-black ${
                  selectedStudent.totalPoints > 0
                    ? "bg-rose-100 text-rose-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                {selectedStudent.totalPoints > 0
                  ? `+${selectedStudent.totalPoints}`
                  : selectedStudent.totalPoints}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-500 uppercase">
                Riwayat Log
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {logs
                  .filter((l) => l.studentName === selectedStudent.name)
                  .map((log, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-400">
                          {log.date}
                        </span>
                        <span className="text-sm font-medium text-slate-700">
                          {log.note || "-"}
                        </span>
                      </div>
                      <span
                        className={`font-bold text-sm ${
                          log.type === "violation"
                            ? "text-rose-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {log.type === "violation" ? "+" : ""}
                        {log.points}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* ESKALASI TOMBOL */}
            {!meetingMode && (
              <div className="pt-4 border-t">
                <button
                  onClick={() => handleEscalateToProblem(selectedStudent)}
                  className="w-full py-3 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-200 hover:bg-indigo-100 flex items-center justify-center gap-2"
                >
                  <ArrowRight size={16} /> Angkat Jadi Masalah Sistem
                </button>
                <p className="text-[10px] text-center text-slate-400 mt-2">
                  Gunakan ini jika perilaku santri membutuhkan evaluasi
                  kebijakan.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
