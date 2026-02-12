"use client";

import { useState, useEffect } from "react";

export default function Page() {
  // ---------------- STATES ----------------
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [listeningData, setListeningData] = useState([]);

  // Batch form
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [batchForm, setBatchForm] = useState({ name: "", schedule: "" });
  const [editingBatch, setEditingBatch] = useState(null);

  // Student form
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [studentForm, setStudentForm] = useState({
    name: "",
    dob: "",
    level: "",
    batch: "",
  });
  const [editingStudent, setEditingStudent] = useState(null);

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    fetch("/api/batch").then(r => r.json()).then(setBatches);
    fetch("/api/student").then(r => r.json()).then(setStudents);
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetch(`/api/listening?student=${selectedStudent._id}`)
        .then(r => r.json())
        .then(setListeningData);
    }
  }, [selectedStudent]);

  // ---------------- BATCH CRUD ----------------
  const handleBatchSubmit = async e => {
    e.preventDefault();

    await fetch("/api/batch", {
      method: editingBatch ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        editingBatch
          ? { ...batchForm, _id: editingBatch._id }
          : batchForm
      ),
    });

    setShowBatchForm(false);
    setBatchForm({ name: "", schedule: "" });
    setEditingBatch(null);
    fetch("/api/batch").then(r => r.json()).then(setBatches);
  };

  const handleEditBatch = batch => {
    setEditingBatch(batch);
    setBatchForm({ name: batch.name, schedule: batch.schedule });
    setShowBatchForm(true);
  };

  const handleDeleteBatch = async batch => {
    await fetch("/api/batch", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: batch._id }),
    });
    fetch("/api/batch").then(r => r.json()).then(setBatches);
  };

  // ---------------- STUDENT CRUD ----------------
  const handleStudentSubmit = async e => {
    e.preventDefault();

    await fetch("/api/student", {
      method: editingStudent ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        editingStudent
          ? { ...studentForm, _id: editingStudent._id }
          : studentForm
      ),
    });

    setShowStudentForm(false);
    setStudentForm({ name: "", dob: "", level: "", batch: "" });
    setEditingStudent(null);
    fetch("/api/student").then(r => r.json()).then(setStudents);
  };

  const handleEditStudent = student => {
    setEditingStudent(student);
    setStudentForm({
      name: student.name,
      dob: student.dob ? student.dob.split("T")[0] : "",
      level: student.level,
      batch: student.batch?._id || "",
    });
    setShowStudentForm(true);
  };

  const handleDeleteStudent = async student => {
    await fetch("/api/student", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: student._id }),
    });
    fetch("/api/student").then(r => r.json()).then(setStudents);
  };

  // ---------------- UI ----------------
  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Instructor Dashboard</h1>

      {/* ---------- BATCHES ---------- */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Batches</h2>

        <button
          className="bg-blue-500 text-white px-3 py-1 rounded mb-2"
          onClick={() => {
            setShowBatchForm(true);
            setEditingBatch(null);
            setBatchForm({ name: "", schedule: "" });
          }}
        >
          Add Batch
        </button>

        <ul className="divide-y">
          {batches.map(batch => (
            <li key={batch._id} className="py-2 flex justify-between">
              <span>{batch.name} ({batch.schedule})</span>
              <div>
                <button onClick={() => handleEditBatch(batch)} className="text-yellow-600 mr-2">Edit</button>
                <button onClick={() => handleDeleteBatch(batch)} className="text-red-600">Delete</button>
              </div>
            </li>
          ))}
        </ul>

        {showBatchForm && (
          <form onSubmit={handleBatchSubmit} className="mt-4">
            <input className="border p-2 mb-2 w-full" placeholder="Batch Name"
              value={batchForm.name}
              onChange={e => setBatchForm({ ...batchForm, name: e.target.value })}
              required
            />
            <input className="border p-2 mb-2 w-full" placeholder="Schedule"
              value={batchForm.schedule}
              onChange={e => setBatchForm({ ...batchForm, schedule: e.target.value })}
              required
            />
            <button className="bg-blue-500 text-white px-3 py-1 rounded mr-2">
              {editingBatch ? "Update" : "Create"}
            </button>
            <button type="button" className="bg-gray-400 text-white px-3 py-1 rounded"
              onClick={() => setShowBatchForm(false)}>
              Cancel
            </button>
          </form>
        )}
      </section>

      {/* ---------- STUDENTS ---------- */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Students</h2>

        <button
          className="bg-green-500 text-white px-3 py-1 rounded mb-2"
          onClick={() => {
            setShowStudentForm(true);
            setEditingStudent(null);
            setStudentForm({ name: "", dob: "", level: "", batch: "" });
          }}
        >
          Add Student
        </button>

        <ul className="divide-y">
          {students.map(student => (
            <li key={student._id} className="py-2 flex justify-between">
              <span>{student.name} ({student.level})</span>
              <div>
                <button onClick={() => setSelectedStudent(student)} className="text-green-600 mr-2">View</button>
                <button onClick={() => handleEditStudent(student)} className="text-yellow-600 mr-2">Edit</button>
                <button onClick={() => handleDeleteStudent(student)} className="text-red-600">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- LISTENING DATA ---------- */}
      {selectedStudent && (
        <section>
          <h2 className="text-lg font-semibold mb-2">
            Listening Data – {selectedStudent.name}
          </h2>

          <ul className="divide-y">
            {listeningData.map((week, idx) => (
              <li key={idx} className="py-2">
                <div>
                  Week: {new Date(week.weekStart).toLocaleDateString()} –{" "}
                  {new Date(week.weekEnd).toLocaleDateString()}
                </div>
                <div>
                  Scores: {week.rows.map(r => `${r.row}: ${r.score}`).join(", ")}
                </div>
                <div>
                  Comments: {week.rows.map(r => r.comments).join(", ")}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
