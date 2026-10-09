"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { supabase } from "@/app/lib/supabase";

type Tournament = {
  id: string;
  name: string;
  slug: string | null;
  city: string | null;
  country: string | null;
  venue: string | null;
  start_date: string | null;
  end_date: string | null;
  age_group: string | null;
  registration_status: string | null;
  description: string | null;
  poster_url: string | null;
  regulations_ge_url: string | null;
  regulations_en_url: string | null;
  presentation_url: string | null;
  is_featured: boolean;
  is_published: boolean;
};

type UploadField = "poster_url" | "regulations_ge_url" | "regulations_en_url" | "presentation_url";
type FormData = Omit<Tournament, "id">;
const BUCKET = "tournament-media";
const emptyForm: FormData = {
  name: "", slug: "", city: "Telavi", country: "Georgia", venue: "",
  start_date: "", end_date: "", age_group: "U16", registration_status: "OPEN",
  description: "", poster_url: "", regulations_ge_url: "", regulations_en_url: "",
  presentation_url: "", is_featured: false, is_published: true,
};
const uploadItems: { field: UploadField; label: string; accept: string; maxMB: number; kind: "image" | "pdf" }[] = [
  { field: "poster_url", label: "Tournament Poster", accept: ".png,.jpg,.jpeg,.webp", maxMB: 10, kind: "image" },
  { field: "regulations_ge_url", label: "Georgian Regulations", accept: ".pdf", maxMB: 20, kind: "pdf" },
  { field: "regulations_en_url", label: "English Regulations", accept: ".pdf", maxMB: 20, kind: "pdf" },
  { field: "presentation_url", label: "Presentation", accept: ".pdf", maxMB: 20, kind: "pdf" },
];

function Input({ label, value, onChange, placeholder = "", type = "text" }: {
  label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string;
}) {
  return <div>
    <label className="mb-2 block text-sm font-bold text-gray-300">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full rounded-xl border border-white/10 bg-[#081B33] px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-orange-500/50" />
  </div>;
}

export default function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<UploadField | null>(null);
  const [message, setMessage] = useState("");
  const fileInputs = useRef<Partial<Record<UploadField, HTMLInputElement | null>>>({});

  useEffect(() => { void loadTournaments(); }, []);

  async function loadTournaments() {
    setLoading(true);
    const { data, error } = await supabase.from("tournaments").select("*").order("start_date", { ascending: true });
    if (error) setMessage(`Error: ${error.message}`);
    else setTournaments((data || []) as Tournament[]);
    setLoading(false);
  }

  function updateField<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function generateSlug(name: string) {
    return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  async function uploadFile(field: UploadField, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const config = uploadItems.find((item) => item.field === field)!;
    const allowed = config.kind === "pdf"
      ? file.type === "application/pdf" && /\.pdf$/i.test(file.name)
      : ["image/png", "image/jpeg", "image/webp"].includes(file.type) && /\.(png|jpe?g|webp)$/i.test(file.name);
    if (!allowed) {
      setMessage(`Invalid file type for ${config.label}. Allowed: ${config.accept}`);
      event.target.value = "";
      return;
    }
    if (file.size > config.maxMB * 1024 * 1024) {
      setMessage(`${config.label}: maximum file size is ${config.maxMB} MB.`);
      event.target.value = "";
      return;
    }
    setUploading(field);
    setMessage("");
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error("Please sign in as an administrator.");
      const extension = file.name.split(".").pop()!.toLowerCase();
      const path = `${field}/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      updateField(field, data.publicUrl);
      setMessage(`${config.label} uploaded. Click ${editingId ? "Save Changes" : "Add Tournament"} to save the URL to the tournament.`);
    } catch (error) {
      setMessage(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setUploading(null);
      event.target.value = "";
    }
  }

  async function saveTournament(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploading) { setMessage("Please wait for the upload to finish."); return; }
    if (!form.name.trim()) { setMessage("Tournament name is required."); return; }
    setSaving(true);
    setMessage("");
    const payload = {
      ...form,
      name: form.name.trim(),
      slug: form.slug.trim() || generateSlug(form.name),
      city: form.city || null, country: form.country || null, venue: form.venue || null,
      start_date: form.start_date || null, end_date: form.end_date || null,
      age_group: form.age_group || null, registration_status: form.registration_status || "OPEN",
      description: form.description || null, poster_url: form.poster_url || null,
      regulations_ge_url: form.regulations_ge_url || null,
      regulations_en_url: form.regulations_en_url || null,
      presentation_url: form.presentation_url || null,
    };
    const result = editingId
      ? await supabase.from("tournaments").update(payload).eq("id", editingId)
      : await supabase.from("tournaments").insert(payload);
    if (result.error) {
      setMessage(`Error: ${result.error.message}`);
      setSaving(false);
      return;
    }
    setMessage(editingId ? "Tournament updated successfully." : "Tournament created successfully.");
    setForm({ ...emptyForm });
    setEditingId(null);
    setSaving(false);
    await loadTournaments();
  }

  function editTournament(tournament: Tournament) {
    const { id, ...values } = tournament;
    setEditingId(id);
    setForm({ ...emptyForm, ...values,
      name: tournament.name || "", slug: tournament.slug || "", city: tournament.city || "",
      country: tournament.country || "", venue: tournament.venue || "",
      start_date: tournament.start_date || "", end_date: tournament.end_date || "",
      age_group: tournament.age_group || "", registration_status: tournament.registration_status || "OPEN",
      description: tournament.description || "", poster_url: tournament.poster_url || "",
      regulations_ge_url: tournament.regulations_ge_url || "", regulations_en_url: tournament.regulations_en_url || "",
      presentation_url: tournament.presentation_url || "",
      is_featured: tournament.is_featured ?? false, is_published: tournament.is_published ?? true,
    });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() { setEditingId(null); setForm({ ...emptyForm }); setMessage(""); }

  async function deleteTournament(id: string, name: string) {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    const { error } = await supabase.from("tournaments").delete().eq("id", id);
    if (error) setMessage(`Error: ${error.message}`);
    else { setMessage("Tournament deleted."); await loadTournaments(); }
  }

  const busy = saving || uploading !== null;
  return <main className="min-h-screen bg-[#050816] px-6 py-10 text-white">
    <div className="mx-auto max-w-7xl">
      <div className="mb-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-400">CYBL Administration</p>
        <h1 className="mt-3 text-4xl font-black md:text-5xl">Tournament Management</h1>
        <p className="mt-3 text-gray-400">Create, edit, publish and manage CYBL tournaments.</p>
      </div>
      {message && <div role="status" className="mb-8 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4 text-orange-200">{message}</div>}
      <form onSubmit={saveTournament} className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
        <h2 className="mb-8 text-2xl font-black">{editingId ? "Edit Tournament" : "Add New Tournament"}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Input label="Tournament Name" value={form.name} onChange={(value) => setForm((prev) => ({ ...prev, name: value, slug: editingId ? prev.slug : generateSlug(value) }))} placeholder="CYBL U16" />
          <Input label="Slug" value={form.slug} onChange={(value) => updateField("slug", value)} placeholder="cybl-u16" />
          <Input label="City" value={form.city || ""} onChange={(value) => updateField("city", value)} placeholder="Telavi" />
          <Input label="Country" value={form.country || ""} onChange={(value) => updateField("country", value)} placeholder="Georgia" />
          <Input label="Venue" value={form.venue || ""} onChange={(value) => updateField("venue", value)} placeholder="Telavi Sports Palace" />
          <Input label="Age Group" value={form.age_group || ""} onChange={(value) => updateField("age_group", value)} placeholder="U16" />
          <Input label="Start Date" type="date" value={form.start_date || ""} onChange={(value) => updateField("start_date", value)} />
          <Input label="End Date" type="date" value={form.end_date || ""} onChange={(value) => updateField("end_date", value)} />
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-300">Registration Status</label>
            <select value={form.registration_status || "OPEN"} onChange={(e) => updateField("registration_status", e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#081B33] px-4 py-3 text-white">
              <option value="OPEN">OPEN</option><option value="CLOSED">CLOSED</option><option value="COMING SOON">COMING SOON</option><option value="INVITATION ONLY">INVITATION ONLY</option>
            </select>
          </div>
          <div className="hidden md:block" />
          {uploadItems.map((item) => <div key={item.field} className="rounded-2xl border border-white/10 bg-[#081B33]/60 p-4">
            <Input label={`${item.label} URL`} value={form[item.field] || ""} onChange={(value) => updateField(item.field, value)} placeholder="Upload a file or paste an existing URL" />
            <input ref={(element) => { fileInputs.current[item.field] = element; }} type="file" accept={item.accept} className="hidden" onChange={(event) => void uploadFile(item.field, event)} />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button type="button" disabled={busy} onClick={() => fileInputs.current[item.field]?.click()} className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-black text-white hover:bg-orange-600 disabled:opacity-50">
                {uploading === item.field ? "Uploading..." : `Upload ${item.kind === "image" ? "Poster" : "PDF"}`}
              </button>
              <span className="text-xs text-gray-400">{item.accept} · max {item.maxMB} MB</span>
              {form[item.field] && <a href={form[item.field] || "#"} target="_blank" rel="noopener noreferrer" className="text-sm text-sky-300 underline">View file</a>}
            </div>
            {item.field === "poster_url" && form.poster_url && <div className="mt-3"><img src={form.poster_url} alt="Tournament poster preview" className="max-h-48 max-w-full rounded-lg object-contain" /></div>}
          </div>)}
        </div>
        <div className="mt-6">
          <label className="mb-2 block text-sm font-bold text-gray-300">Description</label>
          <textarea value={form.description || ""} onChange={(e) => updateField("description", e.target.value)} rows={5} placeholder="Tournament description..." className="w-full rounded-xl border border-white/10 bg-[#081B33] px-4 py-3 text-white" />
        </div>
        <div className="mt-6 flex flex-wrap gap-6">
          <label className="flex items-center gap-3"><input type="checkbox" checked={form.is_featured} onChange={(e) => updateField("is_featured", e.target.checked)} className="h-5 w-5" /><span className="font-bold">Featured Tournament</span></label>
          <label className="flex items-center gap-3"><input type="checkbox" checked={form.is_published} onChange={(e) => updateField("is_published", e.target.checked)} className="h-5 w-5" /><span className="font-bold">Published</span></label>
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <button type="submit" disabled={busy} className="rounded-full bg-orange-500 px-8 py-4 font-black hover:bg-orange-600 disabled:opacity-50">{saving ? "Saving..." : editingId ? "Save Changes" : "Add Tournament"}</button>
          {editingId && <button type="button" disabled={busy} onClick={cancelEdit} className="rounded-full border border-white/20 px-8 py-4 font-bold hover:bg-white/10 disabled:opacity-50">Cancel</button>}
        </div>
      </form>
      <section className="mt-12">
        <h2 className="mb-6 text-3xl font-black">Existing Tournaments</h2>
        {loading ? <p className="text-gray-400">Loading tournaments...</p> : tournaments.length === 0 ? <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-gray-400">No tournaments found.</div> : <div className="grid gap-5">
          {tournaments.map((tournament) => <div key={tournament.id} className="rounded-3xl border border-white/10 bg-[#081B33] p-6">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  {tournament.is_featured && <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-bold text-orange-400">FEATURED</span>}
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${tournament.is_published ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>{tournament.is_published ? "PUBLISHED" : "HIDDEN"}</span>
                </div>
                <h3 className="text-2xl font-black">{tournament.name}</h3>
                <p className="mt-2 text-gray-400">{tournament.city || "—"}{tournament.country ? `, ${tournament.country}` : ""} • {tournament.start_date || "No date"} → {tournament.end_date || "No date"}</p>
                <p className="mt-2 text-sm text-gray-500">/{tournament.slug}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => editTournament(tournament)} className="rounded-full bg-white/10 px-6 py-3 font-bold hover:bg-white/20">Edit</button>
                <button type="button" onClick={() => void deleteTournament(tournament.id, tournament.name)} className="rounded-full border border-red-500/40 px-6 py-3 font-bold text-red-400 hover:bg-red-500/10">Delete</button>
              </div>
            </div>
          </div>)}
        </div>}
      </section>
    </div>
  </main>;
}
