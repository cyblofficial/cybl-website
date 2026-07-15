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
  name: string;
  short_name: string | null;
  is_active?: boolean | null;
};

type PlayerRow = {
  id: string;
  cybl_id: string;
  team_id: string | null;
  first_name: string;
  last_name: string;
  jersey_number: number | null;
  nationality: string | null;
  position: string | null;
  height_cm?: number | null;
  birth_date?: string | null;
  photo_url?: string | null;
  is_active?: boolean | null;
};

type PlayerForm = {
  team_id: string;
  first_name: string;
  last_name: string;
  jersey_number: string;
  nationality: string;
  position: string;
  height_cm: string;
  birth_date: string;
  photo_url: string;
  is_active: boolean;
};

const emptyForm: PlayerForm = {
  team_id: "",
  first_name: "",
  last_name: "",
  jersey_number: "",
  nationality: "",
  position: "",
  height_cm: "",
  birth_date: "",
  photo_url: "",
  is_active: true,
};

function buildCyblId(teamId: string, jerseyNumber: string) {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `CYBL-${teamId.slice(0, 4).toUpperCase()}-${
    jerseyNumber || "00"
  }-${suffix}`;
}

export default function AdminPlayersPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [players, setPlayers] = useState<PlayerRow[]>([]);

  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);

  const [form, setForm] = useState<PlayerForm>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    void loadPage();
  }, []);

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId),
    [teams, selectedTeamId]
  );

  const filteredPlayers = useMemo(
    () =>
      players
        .filter((player) => player.team_id === selectedTeamId)
        .sort(
          (a, b) =>
            (a.jersey_number ?? 999) - (b.jersey_number ?? 999)
        ),
    [players, selectedTeamId]
  );

  const editingPlayer = useMemo(
    () => players.find((player) => player.id === editingPlayerId),
    [players, editingPlayerId]
  );

  function getTeamPlayerCount(teamId: string) {
    return players.filter((player) => player.team_id === teamId).length;
  }

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
      !profileData.is_active
    ) {
      router.replace("/admin/login");
      return;
    }

    setProfile(profileData as Profile);

    const [teamsResponse, playersResponse] = await Promise.all([
      supabase
        .from("teams")
        .select("id, name, short_name, is_active")
        .order("name"),

      supabase
        .from("players")
        .select("*")
        .order("jersey_number"),
    ]);

    if (teamsResponse.error) {
      setErrorMessage(teamsResponse.error.message);
      setLoading(false);
      return;
    }

    if (playersResponse.error) {
      setErrorMessage(playersResponse.error.message);
      setLoading(false);
      return;
    }

    const loadedTeams = (teamsResponse.data ?? []) as TeamRow[];
    const loadedPlayers = (playersResponse.data ?? []) as PlayerRow[];

    setTeams(loadedTeams);
    setPlayers(loadedPlayers);

    if (loadedTeams.length > 0) {
      const firstTeamId = loadedTeams[0].id;

      setSelectedTeamId(firstTeamId);

      setForm({
        ...emptyForm,
        team_id: firstTeamId,
      });
    }

    setLoading(false);
  }

  async function loadPlayers() {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("jersey_number");

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setPlayers((data ?? []) as PlayerRow[]);
  }

  function resetForm() {
    setEditingPlayerId(null);

    setForm({
      ...emptyForm,
      team_id: selectedTeamId,
    });

    setErrorMessage("");
  }

  function startEdit(player: PlayerRow) {
    setEditingPlayerId(player.id);

    setSelectedTeamId(player.team_id ?? "");

    setForm({
      team_id: player.team_id ?? "",
      first_name: player.first_name ?? "",
      last_name: player.last_name ?? "",
      jersey_number: player.jersey_number?.toString() ?? "",
      nationality: player.nationality ?? "",
      position: player.position ?? "",
      height_cm: player.height_cm?.toString() ?? "",
      birth_date: player.birth_date ?? "",
      photo_url: player.photo_url ?? "",
      is_active: player.is_active ?? true,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.team_id) {
      setErrorMessage("Select a team.");
      return;
    }

    if (!form.first_name.trim()) {
      setErrorMessage("First name is required.");
      return;
    }

    if (!form.last_name.trim()) {
      setErrorMessage("Last name is required.");
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setMessage("");

    const jerseyNumber =
      form.jersey_number.trim() === ""
        ? null
        : Number(form.jersey_number);

    const heightCm =
      form.height_cm.trim() === ""
        ? null
        : Number(form.height_cm);

    const payload = {
      team_id: form.team_id,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      jersey_number: jerseyNumber,
      nationality: form.nationality.trim() || null,
      position: form.position.trim() || null,
      height_cm: heightCm,
      birth_date: form.birth_date || null,
      photo_url: form.photo_url.trim() || null,
      is_active: form.is_active,
    };

    if (editingPlayerId) {
      const { error } = await supabase
        .from("players")
        .update(payload)
        .eq("id", editingPlayerId);

      if (error) {
        setErrorMessage(error.message);
        setSaving(false);
        return;
      }

      setMessage(
        `✓ ${form.first_name} ${form.last_name} updated successfully.`
      );
    } else {
      const cyblId = buildCyblId(
        form.team_id,
        form.jersey_number
      );

      const { error } = await supabase
        .from("players")
        .insert({
          ...payload,
          cybl_id: cyblId,
        });

      if (error) {
        setErrorMessage(error.message);
        setSaving(false);
        return;
      }

      const team = teams.find(
        (item) => item.id === form.team_id
      );

      setSelectedTeamId(form.team_id);

      setMessage(
        `✓ ${form.first_name} ${form.last_name} added to ${
          team?.name ?? "team"
        }.`
      );
    }

    await loadPlayers();

    setEditingPlayerId(null);

    setForm({
      ...emptyForm,
      team_id: form.team_id,
    });

    setSaving(false);
  }

  async function toggleActive(player: PlayerRow) {
    const nextValue = !(player.is_active ?? true);

    const { error } = await supabase
      .from("players")
      .update({
        is_active: nextValue,
      })
      .eq("id", player.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    await loadPlayers();
  }

  async function deletePlayer(player: PlayerRow) {
    const confirmed = window.confirm(
      `Delete ${player.first_name} ${player.last_name}?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("players")
      .delete()
      .eq("id", player.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (editingPlayerId === player.id) {
      resetForm();
    }

    await loadPlayers();

    setMessage(
      `✓ ${player.first_name} ${player.last_name} deleted.`
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
        <p className="text-xl font-black">
          Loading Players Manager...
        </p>
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
              Players Manager
            </h1>

            <p className="mt-4 text-gray-400">
              Manage permanent team rosters and player information.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/admin"
              className="rounded-full border border-white/15 bg-white/10 px-5 py-3 font-black"
            >
              ← Dashboard
            </a>

            <a
              href="/admin/teams"
              className="rounded-full bg-orange-500 px-5 py-3 font-black"
            >
              Teams
            </a>
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

        <section className="mt-10 rounded-3xl border border-orange-500/20 bg-orange-500/10 p-6">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-orange-400">
            Selected Team
          </p>

          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-4xl font-black">
                {selectedTeam?.name ?? "No Team Selected"}
              </h2>

              <p className="mt-2 text-gray-300">
                {filteredPlayers.length} registered players
              </p>
            </div>

            <div className="w-full md:max-w-md">
              <label className="mb-2 block text-sm font-bold text-gray-300">
                Change Team
              </label>

              <select
                value={selectedTeamId}
                onChange={(event) => {
                  const teamId = event.target.value;

                  setSelectedTeamId(teamId);
                  setEditingPlayerId(null);

                  setForm({
                    ...emptyForm,
                    team_id: teamId,
                  });

                  setMessage("");
                  setErrorMessage("");
                }}
                className="w-full rounded-2xl border border-white/10 bg-[#081321] px-4 py-4 font-black"
              >
                {teams.map((team) => (
                  <option
                    key={team.id}
                    value={team.id}
                  >
                    {team.name} · {getTeamPlayerCount(team.id)} players
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/10 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-orange-400">
                {editingPlayer
                  ? "Edit Player"
                  : `Add Player to ${selectedTeam?.name ?? "Team"}`}
              </p>

              <h2 className="mt-2 text-3xl font-black">
                {editingPlayer
                  ? `${editingPlayer.first_name} ${editingPlayer.last_name}`
                  : "New Player"}
              </h2>
            </div>

            {editingPlayerId && (
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
            <Field label="First Name">
              <input
                value={form.first_name}
                onChange={(event) =>
                  setForm({
                    ...form,
                    first_name: event.target.value,
                  })
                }
                className="w-full rounded-2xl border border-white/10 bg-[#081321] px-4 py-4"
              />
            </Field>

            <Field label="Last Name">
              <input
                value={form.last_name}
                onChange={(event) =>
                  setForm({
                    ...form,
                    last_name: event.target.value,
                  })
                }
                className="w-full rounded-2xl border border-white/10 bg-[#081321] px-4 py-4"
              />
            </Field>

            <Field label="Jersey Number">
              <input
                type="number"
                min="0"
                max="99"
                value={form.jersey_number}
                onChange={(event) =>
                  setForm({
                    ...form,
                    jersey_number: event.target.value,
                  })
                }
                className="w-full rounded-2xl border border-white/10 bg-[#081321] px-4 py-4"
              />
            </Field>

            <Field label="Position">
              <select
                value={form.position}
                onChange={(event) =>
                  setForm({
                    ...form,
                    position: event.target.value,
                  })
                }
                className="w-full rounded-2xl border border-white/10 bg-[#081321] px-4 py-4"
              >
                <option value="">Select Position</option>
                <option value="PG">Point Guard</option>
                <option value="SG">Shooting Guard</option>
                <option value="SF">Small Forward</option>
                <option value="PF">Power Forward</option>
                <option value="C">Center</option>
              </select>
            </Field>

            <Field label="Height (cm)">
              <input
                type="number"
                min="100"
                max="250"
                value={form.height_cm}
                onChange={(event) =>
                  setForm({
                    ...form,
                    height_cm: event.target.value,
                  })
                }
                className="w-full rounded-2xl border border-white/10 bg-[#081321] px-4 py-4"
              />
            </Field>

            <Field label="Birth Date">
              <input
                type="date"
                value={form.birth_date}
                onChange={(event) =>
                  setForm({
                    ...form,
                    birth_date: event.target.value,
                  })
                }
                className="w-full rounded-2xl border border-white/10 bg-[#081321] px-4 py-4"
              />
            </Field>

            <Field label="Nationality">
              <input
                value={form.nationality}
                onChange={(event) =>
                  setForm({
                    ...form,
                    nationality: event.target.value,
                  })
                }
                className="w-full rounded-2xl border border-white/10 bg-[#081321] px-4 py-4"
              />
            </Field>

            <Field label="Photo URL">
              <input
                value={form.photo_url}
                onChange={(event) =>
                  setForm({
                    ...form,
                    photo_url: event.target.value,
                  })
                }
                placeholder="https://..."
                className="w-full rounded-2xl border border-white/10 bg-[#081321] px-4 py-4"
              />
            </Field>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#081321] p-4">
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
                  <p className="font-black">
                    Active Player
                  </p>

                  <p className="text-sm text-gray-400">
                    Active players can later be selected for game rosters.
                  </p>
                </div>
              </label>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-orange-500 px-6 py-4 text-lg font-black transition active:scale-[0.98] disabled:opacity-50"
              >
                {saving
                  ? "SAVING..."
                  : editingPlayerId
                  ? "SAVE PLAYER CHANGES"
                  : `ADD PLAYER TO ${selectedTeam?.name ?? "TEAM"}`}
              </button>
            </div>
          </form>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-orange-400">
                Team Roster
              </p>

              <h2 className="mt-2 text-3xl font-black">
                {selectedTeam?.name}
              </h2>

              <p className="mt-2 text-gray-400">
                Players are ordered by jersey number.
              </p>
            </div>

            <span className="rounded-full bg-white/10 px-5 py-3 font-black">
              {filteredPlayers.length} players
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredPlayers.map((player) => {
              const active = player.is_active ?? true;

              return (
                <article
                  key={player.id}
                  className="rounded-3xl border border-white/10 bg-white/10 p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-500/20 text-xl font-black text-orange-300">
                      {player.photo_url ? (
                        <img
                          src={player.photo_url}
                          alt={`${player.first_name} ${player.last_name}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        `#${player.jersey_number ?? "-"}`
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black uppercase tracking-wider text-orange-400">
                        {selectedTeam?.name}
                      </p>

                      <h3 className="mt-2 text-xl font-black">
                        #{player.jersey_number ?? "-"}{" "}
                        {player.first_name} {player.last_name}
                      </h3>

                      <p className="mt-2 text-sm text-gray-400">
                        {[
                          player.position,
                          player.height_cm
                            ? `${player.height_cm} cm`
                            : null,
                          player.nationality,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "Player information not completed"}
                      </p>

                      <p className="mt-2 text-xs text-gray-500">
                        CYBL ID: {player.cybl_id}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
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

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => startEdit(player)}
                      className="rounded-2xl bg-blue-500/15 px-4 py-3 font-black text-blue-300"
                    >
                      EDIT
                    </button>

                    <button
                      onClick={() => void toggleActive(player)}
                      className="rounded-2xl bg-yellow-500/15 px-4 py-3 font-black text-yellow-300"
                    >
                      {active ? "DEACTIVATE" : "ACTIVATE"}
                    </button>
                  </div>

                  <button
                    onClick={() => void deletePlayer(player)}
                    className="mt-3 w-full rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-black text-red-300"
                  >
                    DELETE PLAYER
                  </button>
                </article>
              );
            })}
          </div>

          {filteredPlayers.length === 0 && (
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/10 p-10 text-center">
              <p className="text-2xl font-black">
                No players in {selectedTeam?.name}
              </p>

              <p className="mt-3 text-gray-400">
                Add the first player using the form above.
              </p>
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