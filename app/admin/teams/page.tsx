"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

type Profile = {
  id: string;
  email: string | null;
  role: "SUPER_ADMIN" | "SCORER";
  is_active: boolean;
};

type TeamRow = {
  id: string;
  slug: string;
  name: string;
  short_name: string | null;
  country: string | null;
  city: string | null;
  team_type: string | null;
  logo_url?: string | null;
  is_active?: boolean | null;
};

type TeamFormState = {
  name: string;
  short_name: string;
  country: string;
  city: string;
  team_type: string;
  logo_url: string;
  is_active: boolean;
};

const emptyForm: TeamFormState = {
  name: "",
  short_name: "",
  country: "",
  city: "",
  team_type: "CLUB",
  logo_url: "",
  is_active: true,
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminTeamsPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [teams, setTeams] = useState<TeamRow[]>([]);

  const [form, setForm] = useState<TeamFormState>(emptyForm);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const editingTeam = useMemo(
    () => teams.find((team) => team.id === editingTeamId),
    [teams, editingTeamId]
  );

  useEffect(() => {
    void loadPage();
  }, []);

  async function loadPage() {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      router.replace("/admin/login");
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, role, is_active")
      .eq("id", session.user.id)
      .single();

    if (
      profileError ||
      !profileData ||
      !profileData.is_active ||
      profileData.role !== "SUPER_ADMIN"
    ) {
      router.replace("/admin");
      return;
    }

    setProfile(profileData as Profile);

    await loadTeams();

    setLoading(false);
  }

  async function loadTeams() {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("name");

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setTeams((data ?? []) as TeamRow[]);
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingTeamId(null);
    setMessage("");
    setErrorMessage("");
  }

  function startEdit(team: TeamRow) {
    setEditingTeamId(team.id);

    setForm({
      name: team.name ?? "",
      short_name: team.short_name ?? "",
      country: team.country ?? "",
      city: team.city ?? "",
      team_type: team.team_type ?? "CLUB",
      logo_url: team.logo_url ?? "",
      is_active: team.is_active ?? true,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      setErrorMessage("Team name is required.");
      return;
    }

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    const payload = {
      name: form.name.trim(),
      short_name: form.short_name.trim() || null,
      country: form.country.trim() || null,
      city: form.city.trim() || null,
      team_type: form.team_type.trim() || "CLUB",
      logo_url: form.logo_url.trim() || null,
      is_active: form.is_active,
    };

    if (editingTeamId) {
      const { error } = await supabase
        .from("teams")
        .update(payload)
        .eq("id", editingTeamId);

      if (error) {
        setErrorMessage(error.message);
        setSaving(false);
        return;
      }

      setMessage("Team updated successfully.");
    } else {
      let slug = slugify(form.name);

      if (!slug) {
        slug = `team-${Date.now()}`;
      }

      const existingSlug = teams.some((team) => team.slug === slug);

      if (existingSlug) {
        slug = `${slug}-${Date.now()}`;
      }

      const { error } = await supabase.from("teams").insert({
        ...payload,
        slug,
      });

      if (error) {
        setErrorMessage(error.message);
        setSaving(false);
        return;
      }

      setMessage("Team added successfully.");
    }

    await loadTeams();

    setForm(emptyForm);
    setEditingTeamId(null);
    setSaving(false);
  }

  async function toggleActive(team: TeamRow) {
    const nextValue = !(team.is_active ?? true);

    const { error } = await supabase
      .from("teams")
      .update({
        is_active: nextValue,
      })
      .eq("id", team.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    await loadTeams();
  }

  async function deleteTeam(team: TeamRow) {
    const confirmed = window.confirm(
      `Delete "${team.name}" permanently?\n\nIf this team is connected to players, tournaments or games, Supabase may block the deletion.`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("teams")
      .delete()
      .eq("id", team.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (editingTeamId === team.id) {
      resetForm();
    }

    await loadTeams();

    setMessage("Team deleted successfully.");
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    router.replace("/admin/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
        <p className="text-xl font-black">Loading Teams Manager...</p>
      </main>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-8 text-white md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-400">
              CYBL Administration
            </p>

            <h1 className="mt-3 text-4xl font-black md:text-6xl">
              Teams Manager
            </h1>

            <p className="mt-4 text-gray-400">
              Add new teams or edit existing CYBL teams.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/admin"
              className="rounded-full border border-white/15 bg-white/10 px-5 py-3 font-black transition active:scale-95"
            >
              ← Dashboard
            </a>

            <button
              onClick={() => void handleLogout()}
              className="rounded-full border border-white/15 bg-white/10 px-5 py-3 font-black transition active:scale-95"
            >
              Log Out
            </button>
          </div>
        </div>

        {message && (
          <div className="mt-8 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 font-bold text-green-300">
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 font-bold text-red-300">
            {errorMessage}
          </div>
        )}

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/10 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-orange-400">
                {editingTeam ? "Edit Team" : "New Team"}
              </p>

              <h2 className="mt-2 text-3xl font-black">
                {editingTeam
                  ? `Editing: ${editingTeam.name}`
                  : "Add Team"}
              </h2>
            </div>

            {editingTeamId && (
              <button
                onClick={resetForm}
                className="rounded-full border border-white/15 bg-white/10 px-5 py-3 font-black"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 grid gap-5 md:grid-cols-2"
          >
            <Field label="Team Name">
              <input
                value={form.name}
                onChange={(event) =>
                  setForm({
                    ...form,
                    name: event.target.value,
                  })
                }
                placeholder="Example: BC Telavi"
                className="w-full rounded-2xl border border-white/10 bg-[#081321] px-4 py-4 outline-none focus:border-orange-400"
              />
            </Field>

            <Field label="Short Name">
              <input
                value={form.short_name}
                onChange={(event) =>
                  setForm({
                    ...form,
                    short_name: event.target.value,
                  })
                }
                placeholder="Example: TEL"
                className="w-full rounded-2xl border border-white/10 bg-[#081321] px-4 py-4 outline-none focus:border-orange-400"
              />
            </Field>

            <Field label="Country">
              <input
                value={form.country}
                onChange={(event) =>
                  setForm({
                    ...form,
                    country: event.target.value,
                  })
                }
                placeholder="Georgia"
                className="w-full rounded-2xl border border-white/10 bg-[#081321] px-4 py-4 outline-none focus:border-orange-400"
              />
            </Field>

            <Field label="City">
              <input
                value={form.city}
                onChange={(event) =>
                  setForm({
                    ...form,
                    city: event.target.value,
                  })
                }
                placeholder="Telavi"
                className="w-full rounded-2xl border border-white/10 bg-[#081321] px-4 py-4 outline-none focus:border-orange-400"
              />
            </Field>

            <Field label="Team Type">
              <select
                value={form.team_type}
                onChange={(event) =>
                  setForm({
                    ...form,
                    team_type: event.target.value,
                  })
                }
                className="w-full rounded-2xl border border-white/10 bg-[#081321] px-4 py-4 outline-none focus:border-orange-400"
              >
                <option value="CLUB">Club</option>
                <option value="NATIONAL_TEAM">National Team</option>
                <option value="ACADEMY">Academy</option>
                <option value="SCHOOL">School</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>

            <Field label="Logo URL">
              <input
                value={form.logo_url}
                onChange={(event) =>
                  setForm({
                    ...form,
                    logo_url: event.target.value,
                  })
                }
                placeholder="https://..."
                className="w-full rounded-2xl border border-white/10 bg-[#081321] px-4 py-4 outline-none focus:border-orange-400"
              />
            </Field>

            <div className="md:col-span-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-[#081321] p-4">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      is_active: event.target.checked,
                    })
                  }
                  className="h-5 w-5"
                />

                <div>
                  <p className="font-black">Active Team</p>

                  <p className="text-sm text-gray-400">
                    Inactive teams can stay in the database without being used
                    in new competitions.
                  </p>
                </div>
              </label>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-orange-500 px-6 py-4 text-lg font-black transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "SAVING..."
                  : editingTeamId
                  ? "SAVE TEAM CHANGES"
                  : "ADD TEAM"}
              </button>
            </div>
          </form>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-orange-400">
                Database
              </p>

              <h2 className="mt-2 text-3xl font-black">
                All Teams
              </h2>
            </div>

            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-black">
              {teams.length} teams
            </span>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {teams.map((team) => {
              const active = team.is_active ?? true;

              return (
                <article
                  key={team.id}
                  className="rounded-3xl border border-white/10 bg-white/10 p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-widest text-orange-400">
                        {team.short_name || team.slug}
                      </p>

                      <h3 className="mt-2 break-words text-2xl font-black">
                        {team.name}
                      </h3>

                      <p className="mt-3 text-sm text-gray-400">
                        {[team.city, team.country]
                          .filter(Boolean)
                          .join(", ") || "Location not set"}
                      </p>

                      <p className="mt-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                        {team.team_type || "TEAM"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                        active
                          ? "bg-green-500/15 text-green-300"
                          : "bg-red-500/15 text-red-300"
                      }`}
                    >
                      {active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {team.logo_url && (
                    <div className="mt-5 flex h-28 items-center justify-center overflow-hidden rounded-2xl bg-white p-3">
                      <img
                        src={team.logo_url}
                        alt={`${team.name} logo`}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  )}

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => startEdit(team)}
                      className="rounded-2xl bg-blue-500/15 px-4 py-3 font-black text-blue-300 transition active:scale-95"
                    >
                      EDIT
                    </button>

                    <button
                      onClick={() => void toggleActive(team)}
                      className="rounded-2xl bg-yellow-500/15 px-4 py-3 font-black text-yellow-300 transition active:scale-95"
                    >
                      {active ? "DEACTIVATE" : "ACTIVATE"}
                    </button>
                  </div>

                  <button
                    onClick={() => void deleteTeam(team)}
                    className="mt-3 w-full rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-black text-red-300 transition active:scale-95"
                  >
                    DELETE TEAM
                  </button>
                </article>
              );
            })}
          </div>

          {teams.length === 0 && (
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/10 p-8 text-center text-gray-400">
              No teams found.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-gray-300">
        {label}
      </label>

      {children}
    </div>
  );
}