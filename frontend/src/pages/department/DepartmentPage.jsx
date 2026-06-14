import { useState, useEffect } from "react";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import ConfirmModal from "../../components/ui/ConfirmModal";
import FormModal from "../../components/layout/FormModal";

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition-all";

export default function DepartmentPage() {
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: "", location_id: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const asArray = (v) => (Array.isArray(v) ? v : []);

  const fetchData = async () => {
    setLoading(true);
    const [dr, lr] = await Promise.allSettled([
      api.get("/departments/"),
      api.get("/locations/"),
    ]);
    setDepartments(dr.status === "fulfilled" ? asArray(dr.value.data) : []);
    setLocations(lr.status === "fulfilled" ? asArray(lr.value.data) : []);
    setLoading(false);
  };
  useEffect(() => {
    fetchData();
  }, []);

  const openAdd = () => {
    setEditTarget(null);
    setForm({ name: "", location_id: "" });
    setError("");
    setShowForm(true);
  };
  const openEdit = (dept) => {
    setEditTarget(dept);
    setForm({ name: dept.name, location_id: dept.location_id || "" });
    setError("");
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setEditTarget(null);
    setForm({ name: "", location_id: "" });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        location_id: form.location_id ? parseInt(form.location_id) : null,
      };
      editTarget
        ? await api.put(`/departments/${editTarget.id}`, payload)
        : await api.post("/departments/", payload);
      closeForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Gagal menyimpan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/departments/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Departemen</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {departments.length} departemen terdaftar
          </p>
        </div>
        <Button onClick={openAdd} size="sm">
          + Tambah
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-sm text-gray-400">
            Memuat data...
          </div>
        ) : departments.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">
            Belum ada departemen.
          </div>
        ) : (
          <div>
            {departments.map((dept, idx) => (
              <div
                key={dept.id}
                className={`flex items-center justify-between px-5 py-4 ${idx < departments.length - 1 ? "border-b border-gray-50" : ""} hover:bg-gray-50 transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-xs font-semibold text-violet-600 flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {dept.name}
                    </p>
                    {dept.location_name ? (
                      <p className="text-xs text-green-600 mt-0.5">
                        {dept.location_name}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Tanpa lokasi absensi
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(dept)}
                    className="text-xs px-2.5 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(dept)}
                    className="text-xs px-2.5 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <FormModal
        open={showForm}
        title={editTarget ? `Edit — ${editTarget.name}` : "Tambah Departemen"}
        onClose={closeForm}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nama Departemen
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="contoh: Teknik Informatika, HRD"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Lokasi Absensi
              <span className="text-gray-400 font-normal ml-1">(opsional)</span>
            </label>
            {locations.length === 0 ? (
              <div className="text-sm text-amber-700 bg-amber-50 px-3 py-3 rounded-lg">
                Belum ada lokasi. Tambah dulu di menu Lokasi.
              </div>
            ) : (
              <>
                <select
                  value={form.location_id}
                  onChange={(e) =>
                    setForm({ ...form, location_id: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="">Tanpa lokasi (GPS tidak divalidasi)</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} — radius {l.radius_meter}m
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1.5">
                  Jika dipilih, karyawan hanya bisa absen dalam radius lokasi
                  ini.
                </p>
              </>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={closeForm}
              className="flex-1 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-sm font-medium text-white transition-colors"
            >
              {submitting ? "Menyimpan..." : editTarget ? "Update" : "Simpan"}
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmModal
        open={!!deleteTarget}
        title="Hapus departemen?"
        message={
          deleteTarget
            ? `Departemen "${deleteTarget.name}" akan dihapus dari sistem.`
            : ""
        }
        confirmText="Hapus Departemen"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
