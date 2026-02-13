"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const LEVELS = [
  "Junior 1", "Junior 2", "Junior 3", "Basic",
  "Elementary A", "Elementary B", "Intermediate A", "Intermediate B",
  "Higher A", "Higher B", "Advance", "Grand"
];

export default function Page() {
  const { data: session, status } = useSession();
  
  // Batch state
  const [batches, setBatches] = useState([]);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [batchForm, setBatchForm] = useState({ name: "", day: "6", time: "09:00" });
  const [editingBatch, setEditingBatch] = useState(null);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [error, setError] = useState("");

  // Student state
  const [students, setStudents] = useState([]);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [studentForm, setStudentForm] = useState({ name: "", dob: "", level: "", batch: "" });
  const [editingStudent, setEditingStudent] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(false);

  // Listening data
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [listeningData, setListeningData] = useState([]);

  // Fetch batches and students
  useEffect(() => {
    if (status === "authenticated") {
      loadBatches();
      loadStudents();
    }
  }, [status]);

  // Fetch listening data for selected student
  useEffect(() => {
    if (selectedStudent) {
      fetch(`/api/listening?student=${selectedStudent._id}`)
        .then(r => r.json())
        .then(setListeningData)
        .catch(() => setListeningData([]));
    }
  }, [selectedStudent]);

  const loadBatches = async () => {
    try {
      const res = await fetch("/api/batch");
      const data = await res.json();
      setBatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load batches:", err);
    }
  };

  const loadStudents = async () => {
    try {
      const res = await fetch("/api/student");
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load students:", err);
    }
  };

  // Batch CRUD
  const handleBatchSubmit = async e => {
    e.preventDefault();
    setError("");
    setLoadingBatch(true);

    try {
      const dayInt = parseInt(batchForm.day);
      const schedule = `${DAYS[dayInt]} ${batchForm.time}`;
      const name = batchForm.name || schedule;

      const method = editingBatch ? "PUT" : "POST";
      const body = editingBatch
        ? { _id: editingBatch._id, name, schedule }
        : { name, schedule, instructor: session?.user?.id };

      const res = await fetch("/api/batch", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save batch");
      }

      setShowBatchForm(false);
      setBatchForm({ name: "", day: "6", time: "09:00" });
      setEditingBatch(null);
      await loadBatches();
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoadingBatch(false);
    }
  };

  const handleEditBatch = batch => {
    const parts = batch.schedule.split(" ");
    const dayIndex = DAYS.indexOf(parts[0]);
    const time = parts.slice(1).join(" ");
    
    setEditingBatch(batch);
    setBatchForm({ name: batch.name, day: String(dayIndex), time });
    setShowBatchForm(true);
  };

  const handleDeleteBatch = async batch => {
    if (!confirm("Delete this batch?")) return;

    try {
      const res = await fetch("/api/batch", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: batch._id }),
      });

      if (!res.ok) throw new Error("Failed to delete batch");
      await loadBatches();
    } catch (err) {
      setError(err.message);
    }
  };

  // Student CRUD
  const handleStudentSubmit = async e => {
    e.preventDefault();
    setError("");
    setLoadingStudent(true);

    try {
      const method = editingStudent ? "PUT" : "POST";
      const body = editingStudent
        ? { _id: editingStudent._id, ...studentForm }
        : studentForm;

      const res = await fetch("/api/student", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save student");
      }

      setShowStudentForm(false);
      setStudentForm({ name: "", dob: "", level: "", batch: "" });
      setEditingStudent(null);
      await loadStudents();
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoadingStudent(false);
    }
  };

  const handleEditStudent = student => {
    setEditingStudent(student);
    setStudentForm({
      name: student.name,
      dob: student.dob?.split("T")[0] || "",
      level: student.level,
      batch: student.batch?._id || "",
    });
    setShowStudentForm(true);
  };

  const handleDeleteStudent = async student => {
    if (!confirm("Delete this student?")) return;

    try {
      const res = await fetch("/api/student", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: student._id }),
      });

      if (!res.ok) throw new Error("Failed to delete student");
      await loadStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  if (status === "loading") {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (status !== "authenticated") {
    return <div className="p-4 text-center text-red-600">Not authenticated</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Instructor Dashboard</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      {/* BATCHES SECTION */}
      <section className="mb-8 bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Batches</h2>
          <button
            onClick={() => { setShowBatchForm(true); setEditingBatch(null); setBatchForm({ name: "", day: "6", time: "09:00" }); }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + Add Batch
          </button>
        </div>

        {showBatchForm && (
          <form onSubmit={handleBatchSubmit} className="mb-4 p-4 bg-gray-50 rounded">
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Batch Name (optional)</label>
              <input
                type="text"
                placeholder="e.g., Saturday Morning"
                value={batchForm.name}
                onChange={e => setBatchForm({ ...batchForm, name: e.target.value })}
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium mb-1">Day</label>
                <select
                  value={batchForm.day}
                  onChange={e => setBatchForm({ ...batchForm, day: e.target.value })}
                  className="w-full border p-2 rounded"
                >
                  {DAYS.map((day, idx) => (
                    <option key={idx} value={idx}>{day}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input
                  type="time"
                  value={batchForm.time}
                  onChange={e => setBatchForm({ ...batchForm, time: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loadingBatch}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loadingBatch ? "Saving..." : editingBatch ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => setShowBatchForm(false)}
                className="flex-1 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {batches.length === 0 ? (
            <p className="text-gray-500">No batches yet.</p>
          ) : (
            batches.map(batch => (
              <div key={batch._id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{batch.name || batch.schedule}</p>
                  <p className="text-sm text-gray-600">{batch.schedule}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditBatch(batch)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDeleteBatch(batch)} className="text-red-600 hover:underline">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* STUDENTS SECTION */}
      <section className="mb-8 bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Students</h2>
          <button
            onClick={() => { setShowStudentForm(true); setEditingStudent(null); setStudentForm({ name: "", dob: "", level: "", batch: "" }); }}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            + Add Student
          </button>
        </div>

        {showStudentForm && (
          <form onSubmit={handleStudentSubmit} className="mb-4 p-4 bg-gray-50 rounded">
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={studentForm.name}
                onChange={e => setStudentForm({ ...studentForm, name: e.target.value })}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              <input
                type="date"
                value={studentForm.dob}
                onChange={e => setStudentForm({ ...studentForm, dob: e.target.value })}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Level</label>
              <select
                value={studentForm.level}
                onChange={e => setStudentForm({ ...studentForm, level: e.target.value })}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">-- Select Level --</option>
                {LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Batch</label>
              <select
                value={studentForm.batch}
                onChange={e => setStudentForm({ ...studentForm, batch: e.target.value })}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">-- Select Batch --</option>
                {batches.map(batch => (
                  <option key={batch._id} value={batch._id}>
                    {batch.name || batch.schedule}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loadingStudent}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
              >
                {loadingStudent ? "Saving..." : editingStudent ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => setShowStudentForm(false)}
                className="flex-1 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {students.length === 0 ? (
            <p className="text-gray-500">No students yet.</p>
          ) : (
            students.map(student => (
              <div key={student._id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-gray-600">{student.level} • {student.batch?.name || "No batch"}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedStudent(student)} className="text-blue-600 hover:underline">View</button>
                  <button onClick={() => handleEditStudent(student)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDeleteStudent(student)} className="text-red-600 hover:underline">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* LISTENING DATA SECTION */}
      {selectedStudent && (
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Listening Data – {selectedStudent.name}</h2>
          <div className="space-y-4">
            {listeningData.length === 0 ? (
              <p className="text-gray-500">No listening data yet.</p>
            ) : (
              listeningData.map(week => (
                <div key={week._id} className="border p-3 rounded">
                  <p className="font-medium mb-2">
                    Week of {new Date(week.weekStart).toLocaleDateString()}
                  </p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left">Row</th>
                        <th className="text-left">Score</th>
                        <th className="text-left">Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {week.rows.map(row => (
                        <tr key={row.row} className="border-b">
                          <td>{row.row}</td>
                          <td>{row.score}/10</td>
                          <td>{row.comments || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
