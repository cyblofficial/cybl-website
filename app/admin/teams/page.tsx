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
  logo_url: string | null;
  is_active: boolean | null;
};

type PlayerRow = {
  id: string;
  cybl_id: string;
  team_id: string | null;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  nationality: string | null;
  height_cm: number | null;
  position: string | null;
  jersey_number: number | null;
  photo_url: string | null;
  is_active: boolean | null;
};

type CoachRow = {
  id: string;
  team_id: string | null;
  first_name: string;
  last_name: string;
  role: string;
  nationality: string | null;
  photo_url: string | null;
  is_active: boolean;
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

type PlayerFormState = {
  first_name: string;
  last_name: string;
  birth_date: string;
  nationality: string;
  height_cm: string;
  position: string;
  jersey_number: string;
  photo_url: string;
  is_active: boolean;
};

type CoachFormState = {
  first_name: string;
  last_name: string;
  role: string;
  nationality: string;
  photo_url: string;
  is_active: boolean;
};

const emptyTeamForm: TeamFormState = {
  name: "",
  short_name: "",
  country: "",
  city: "",
  team_type: "CLUB",
  logo_url: "",
  is_active: true,
};

const emptyPlayerForm: PlayerFormState = {
  first_name: "",
  last_name: "",
  birth_date: "",
  nationality: "",
  height_cm: "",
  position: "",
  jersey_number: "",
  photo_url: "",
  is_active: true,
};

const emptyCoachForm: CoachFormState = {
  first_name: "",
  last_name: "",
  role: "HEAD_COACH",
  nationality: "",
  photo_url: "",
  is_active: true,
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createCyblId() {
  const stamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 900 + 100);
  return `CYBL-${stamp}-${random}`;
}

function safeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminTeamsPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [coaches, setCoaches] = useState<CoachRow[]>([]);

  const [teamForm, setTeamForm] = useState<TeamFormState>(emptyTeamForm);
  const [playerForm, setPlayerForm] = useState<PlayerFormState>(emptyPlayerForm);
  const [coachForm, setCoachForm] = useState<CoachFormState>(emptyCoachForm);

  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editingCoachId, setEditingCoachId] = useState<string | null>(null);
  const [managedTeamId, setManagedTeamId] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingTeam, setSavingTeam] = useState(false);
  const [savingPlayer, setSavingPlayer] = useState(false);
  const [savingCoach, setSavingCoach] = useState(false);

  const [uploadingTeamLogo, setUploadingTeamLogo] = useState(false);
  const [uploadingPlayerPhoto, setUploadingPlayerPhoto] = useState(false);
  const [uploadingCoachPhoto, setUploadingCoachPhoto] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const editingTeam = useMemo(
    () => teams.find((team) => team.id === editingTeamId) ?? null,
    [teams, editingTeamId]
  );

  const managedTeam = useMemo(
    () => teams.find((team) => team.id === managedTeamId) ?? null,
    [teams, managedTeamId]
  );

  const teamPlayers = useMemo(
    () =>
      players
        .filter((player) => player.team_id === managedTeamId)
        .sort(
          (a, b) =>
            (a.jersey_number ?? 999) - (b.jersey_number ?? 999) ||
            a.last_name.localeCompare(b.last_name)
        ),
    [players, managedTeamId]
  );

  const teamCoaches = useMemo(
    () =>
      coaches
        .filter((coach) => coach.team_id === managedTeamId)
        .sort((a, b) => a.last_name.localeCompare(b.last_name)),
    [coaches, managedTeamId]
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

    await Promise.all([loadTeams(), loadPlayers(), loadCoaches()]);
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

  async function loadPlayers() {
    const { data, error } = await supabase
      .from("players")
      .select(
        `
        id,
        cybl_id,
        team_id,
        first_name,
        last_name,
        birth_date,
        nationality,
        height_cm,
        position,
        jersey_number,
        photo_url,
        is_active
        `
      )
      .order("last_name");

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setPlayers((data ?? []) as PlayerRow[]);
  }

  async function loadCoaches() {
    const { data, error } = await supabase
      .from("coaches")
      .select("*")
      .order("last_name");

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setCoaches((data ?? []) as CoachRow[]);
  }

  function clearMessages() {
    setMessage("");
    setErrorMessage("");
  }

  function resetTeamForm() {
    setTeamForm(emptyTeamForm);
    setEditingTeamId(null);
    clearMessages();
  }

  function resetPlayerForm() {
    setPlayerForm(emptyPlayerForm);
    setEditingPlayerId(null);
    clearMessages();
  }

  function resetCoachForm() {
    setCoachForm(emptyCoachForm);
    setEditingCoachId(null);
    clearMessages();
  }

  function startEditTeam(team: TeamRow) {
    setEditingTeamId(team.id);
    setTeamForm({
      name: team.name ?? "",
      short_name: team.short_name ?? "",
      country: team.country ?? "",
      city: team.city ?? "",
      team_type: team.team_type ?? "CLUB",
      logo_url: team.logo_url ?? "",
      is_active: team.is_active ?? true,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function manageRoster(team: TeamRow) {
    setManagedTeamId(team.id);
    resetPlayerForm();
    resetCoachForm();

    window.setTimeout(() => {
      document
        .getElementById("team-roster-manager")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function startEditPlayer(player: PlayerRow) {
    setEditingPlayerId(player.id);
    setPlayerForm({
      first_name: player.first_name ?? "",
      last_name: player.last_name ?? "",
      birth_date: player.birth_date ?? "",
      nationality: player.nationality ?? "",
      height_cm: player.height_cm ? String(player.height_cm) : "",
      position: player.position ?? "",
      jersey_number:
        player.jersey_number !== null ? String(player.jersey_number) : "",
      photo_url: player.photo_url ?? "",
      is_active: player.is_active ?? true,
    });

    document
      .getElementById("player-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function startEditCoach(coach: CoachRow) {
    setEditingCoachId(coach.id);
    setCoachForm({
      first_name: coach.first_name ?? "",
      last_name: coach.last_name ?? "",
      role: coach.role ?? "HEAD_COACH",
      nationality: coach.nationality ?? "",
      photo_url: coach.photo_url ?? "",
      is_active: coach.is_active ?? true,
    });

    document
      .getElementById("coach-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function uploadPublicImage(
    file: File,
    bucket: "team-logos" | "player-photos" | "coach-photos",
    folder: string
  ) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";

    if (!["jpg", "jpeg", "png", "webp"].includes(extension)) {
      throw new Error("Please upload JPG, PNG or WEBP image.");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Image must be smaller than 5 MB.");
    }

    const filePath = `${folder}/${Date.now()}-${safeFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function handleTeamLogoUpload(file: File | null) {
    if (!file) return;

    try {
      setUploadingTeamLogo(true);
      clearMessages();

      const folder = editingTeamId || "new-team";
      const url = await uploadPublicImage(file, "team-logos", folder);

      setTeamForm((current) => ({ ...current, logo_url: url }));
      setMessage("✓ Team logo uploaded.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Logo upload failed."
      );
    } finally {
      setUploadingTeamLogo(false);
    }
  }

  async function handlePlayerPhotoUpload(file: File | null) {
    if (!file || !managedTeamId) return;

    try {
      setUploadingPlayerPhoto(true);
      clearMessages();

      const url = await uploadPublicImage(
        file,
        "player-photos",
        `${managedTeamId}/players`
      );

      setPlayerForm((current) => ({ ...current, photo_url: url }));
      setMessage("✓ Player photo uploaded.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Player photo upload failed."
      );
    } finally {
      setUploadingPlayerPhoto(false);
    }
  }

  async function handleCoachPhotoUpload(file: File | null) {
    if (!file || !managedTeamId) return;

    try {
      setUploadingCoachPhoto(true);
      clearMessages();

      const url = await uploadPublicImage(
        file,
        "coach-photos",
        `${managedTeamId}/coaches`
      );

      setCoachForm((current) => ({ ...current, photo_url: url }));
      setMessage("✓ Coach photo uploaded.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Coach photo upload failed."
      );
    } finally {
      setUploadingCoachPhoto(false);
    }
  }

  async function handleTeamSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!teamForm.name.trim()) {
      setErrorMessage("Team name is required.");
      return;
    }

    setSavingTeam(true);
    clearMessages();

    const payload = {
      name: teamForm.name.trim(),
      short_name: teamForm.short_name.trim() || null,
      country: teamForm.country.trim() || null,
      city: teamForm.city.trim() || null,
      team_type: teamForm.team_type.trim() || "CLUB",
      logo_url: teamForm.logo_url.trim() || null,
      is_active: teamForm.is_active,
      updated_at: new Date().toISOString(),
    };

    if (editingTeamId) {
      const { error } = await supabase
        .from("teams")
        .update(payload)
        .eq("id", editingTeamId);

      if (error) {
        setErrorMessage(error.message);
        setSavingTeam(false);
        return;
      }

      setMessage("✓ Team updated successfully.");
    } else {
      let slug = slugify(teamForm.name);

      if (!slug) {
        slug = `team-${Date.now()}`;
      }

      if (teams.some((team) => team.slug === slug)) {
        slug = `${slug}-${Date.now()}`;
      }

      const { data, error } = await supabase
        .from("teams")
        .insert({ ...payload, slug })
        .select()
        .single();

      if (error) {
        setErrorMessage(error.message);
        setSavingTeam(false);
        return;
      }

      const newTeam = data as TeamRow;
      setManagedTeamId(newTeam.id);
      setMessage("✓ Team added. You can now add players and coaches.");
    }

    await loadTeams();

    setTeamForm(emptyTeamForm);
    setEditingTeamId(null);
    setSavingTeam(false);
  }

  async function handlePlayerSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!managedTeamId) {
      setErrorMessage("Select a team first.");
      return;
    }

    if (!playerForm.first_name.trim() || !playerForm.last_name.trim()) {
      setErrorMessage("Player first name and last name are required.");
      return;
    }

    const jerseyNumber =
      playerForm.jersey_number.trim() === ""
        ? null
        : Number(playerForm.jersey_number);

    const height =
      playerForm.height_cm.trim() === "" ? null : Number(playerForm.height_cm);

    if (
      jerseyNumber !== null &&
      (!Number.isInteger(jerseyNumber) || jerseyNumber < 0 || jerseyNumber > 99)
    ) {
      setErrorMessage("Jersey number must be between 0 and 99.");
      return;
    }

    if (
      height !== null &&
      (!Number.isFinite(height) || height < 50 || height > 260)
    ) {
      setErrorMessage("Height must be a valid number in centimeters.");
      return;
    }

    setSavingPlayer(true);
    clearMessages();

    const payload = {
      team_id: managedTeamId,
      first_name: playerForm.first_name.trim(),
      last_name: playerForm.last_name.trim(),
      birth_date: playerForm.birth_date || null,
      nationality: playerForm.nationality.trim() || null,
      height_cm: height,
      position: playerForm.position.trim() || null,
      jersey_number: jerseyNumber,
      photo_url: playerForm.photo_url.trim() || null,
      is_active: playerForm.is_active,
      updated_at: new Date().toISOString(),
    };

    if (editingPlayerId) {
      const { error } = await supabase
        .from("players")
        .update(payload)
        .eq("id", editingPlayerId);

      if (error) {
        setErrorMessage(error.message);
        setSavingPlayer(false);
        return;
      }

      setMessage("✓ Player updated.");
    } else {
      const { error } = await supabase
        .from("players")
        .insert({ ...payload, cybl_id: createCyblId() });

      if (error) {
        setErrorMessage(error.message);
        setSavingPlayer(false);
        return;
      }

      setMessage("✓ Player added to team roster.");
    }

    await loadPlayers();

    setPlayerForm(emptyPlayerForm);
    setEditingPlayerId(null);
    setSavingPlayer(false);
  }

  async function handleCoachSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!managedTeamId) {
      setErrorMessage("Select a team first.");
      return;
    }

    if (!coachForm.first_name.trim() || !coachForm.last_name.trim()) {
      setErrorMessage("Coach first name and last name are required.");
      return;
    }

    setSavingCoach(true);
    clearMessages();

    const payload = {
      team_id: managedTeamId,
      first_name: coachForm.first_name.trim(),
      last_name: coachForm.last_name.trim(),
      role: coachForm.role || "HEAD_COACH",
      nationality: coachForm.nationality.trim() || null,
      photo_url: coachForm.photo_url.trim() || null,
      is_active: coachForm.is_active,
      updated_at: new Date().toISOString(),
    };

    if (editingCoachId) {
      const { error } = await supabase
        .from("coaches")
        .update(payload)
        .eq("id", editingCoachId);

      if (error) {
        setErrorMessage(error.message);
        setSavingCoach(false);
        return;
      }

      setMessage("✓ Coach updated.");
    } else {
      const { error } = await supabase.from("coaches").insert(payload);

      if (error) {
        setErrorMessage(error.message);
        setSavingCoach(false);
        return;
      }

      setMessage("✓ Coach added.");
    }

    await loadCoaches();

    setCoachForm(emptyCoachForm);
    setEditingCoachId(null);
    setSavingCoach(false);
  }

  async function toggleTeamActive(team: TeamRow) {
    clearMessages();

    const { error } = await supabase
      .from("teams")
      .update({
        is_active: !(team.is_active ?? true),
        updated_at: new Date().toISOString(),
      })
      .eq("id", team.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    await loadTeams();
  }

  async function togglePlayerActive(player: PlayerRow) {
    clearMessages();

    const { error } = await supabase
      .from("players")
      .update({
        is_active: !(player.is_active ?? true),
        updated_at: new Date().toISOString(),
      })
      .eq("id", player.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    await loadPlayers();
  }

  async function toggleCoachActive(coach: CoachRow) {
    clearMessages();

    const { error } = await supabase
      .from("coaches")
      .update({
        is_active: !coach.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", coach.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    await loadCoaches();
  }

  async function deleteTeam(team: TeamRow) {
    const confirmed = window.confirm(
      `Delete "${team.name}" permanently?\n\nPlayers and coaches connected to this team may also be affected.`
    );

    if (!confirmed) return;

    clearMessages();

    const { error } = await supabase.from("teams").delete().eq("id", team.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (managedTeamId === team.id) setManagedTeamId("");
    if (editingTeamId === team.id) resetTeamForm();

    await Promise.all([loadTeams(), loadPlayers(), loadCoaches()]);
    setMessage("✓ Team deleted.");
  }

  async function deletePlayer(player: PlayerRow) {
    const confirmed = window.confirm(
      `Delete ${player.first_name} ${player.last_name} permanently?`
    );

    if (!confirmed) return;

    clearMessages();

    const { error } = await supabase
      .from("players")
      .delete()
      .eq("id", player.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (editingPlayerId === player.id) resetPlayerForm();

    await loadPlayers();
    setMessage("✓ Player deleted.");
  }

  async function deleteCoach(coach: CoachRow) {
    const confirmed = window.confirm(
      `Delete ${coach.first_name} ${coach.last_name} permanently?`
    );

    if (!confirmed) return;

    clearMessages();

    const { error } = await supabase
      .from("coaches")
      .delete()
      .eq("id", coach.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (editingCoachId === coach.id) resetCoachForm();

    await loadCoaches();
    setMessage("✓ Coach deleted.");
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

  if (!profile) return null;

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-8 text-white md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-400">
              CYBL Administration
            </p>

            <h1 className="mt-3 text-4xl font-black md:text-6xl">
              Teams & Rosters
            </h1>

            <p className="mt-4 text-gray-400">
              Manage teams, players, jersey numbers, player data and coaching
              staff.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/admin"
              className="rounded-full border border-white/15 bg-white/10 px-5 py-3 font-black"
            >
              ← Dashboard
            </a>

            <button
              onClick={() => void handleLogout()}
              className="rounded-full border border-white/15 bg-white/10 px-5 py-3 font-black"
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
                {editingTeam ? `Editing: ${editingTeam.name}` : "Add Team"}
              </h2>
            </div>

            {editingTeamId && (
              <button
                onClick={resetTeamForm}
                className="rounded-full border border-white/15 bg-white/10 px-5 py-3 font-black"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form
            onSubmit={handleTeamSubmit}
            className="mt-8 grid gap-5 md:grid-cols-2"
          >
            <Field label="Team Name">
              <input
                value={teamForm.name}
                onChange={(event) =>
                  setTeamForm({ ...teamForm, name: event.target.value })
                }
                placeholder="Example: BC Telavi"
                className={inputClass}
              />
            </Field>

            <Field label="Short Name">
              <input
                value={teamForm.short_name}
                onChange={(event) =>
                  setTeamForm({
                    ...teamForm,
                    short_name: event.target.value,
                  })
                }
                placeholder="Example: TEL"
                className={inputClass}
              />
            </Field>

            <Field label="Country">
              <input
                value={teamForm.country}
                onChange={(event) =>
                  setTeamForm({ ...teamForm, country: event.target.value })
                }
                placeholder="Georgia"
                className={inputClass}
              />
            </Field>

            <Field label="City">
              <input
                value={teamForm.city}
                onChange={(event) =>
                  setTeamForm({ ...teamForm, city: event.target.value })
                }
                placeholder="Telavi"
                className={inputClass}
              />
            </Field>

            <Field label="Team Type">
              <select
                value={teamForm.team_type}
                onChange={(event) =>
                  setTeamForm({
                    ...teamForm,
                    team_type: event.target.value,
                  })
                }
                className={inputClass}
              >
                <option value="CLUB">Club</option>
                <option value="NATIONAL_TEAM">National Team</option>
                <option value="ACADEMY">Academy</option>
                <option value="SCHOOL">School</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>

            <Field label="Team Logo">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={uploadingTeamLogo}
                onChange={(event) =>
                  void handleTeamLogoUpload(event.target.files?.[0] ?? null)
                }
                className={fileClass}
              />

              <p className="mt-2 text-xs text-gray-500">
                JPG / PNG / WEBP · maximum 5 MB
              </p>

              {uploadingTeamLogo && (
                <p className="mt-2 text-sm font-bold text-orange-400">
                  Uploading logo...
                </p>
              )}

              {teamForm.logo_url && (
                <div className="mt-3 flex h-28 items-center justify-center rounded-2xl bg-white p-3">
                  <img
                    src={teamForm.logo_url}
                    alt="Team logo preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
            </Field>

            <label className="md:col-span-2 flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-[#081321] p-4">
              <input
                type="checkbox"
                checked={teamForm.is_active}
                onChange={(event) =>
                  setTeamForm({
                    ...teamForm,
                    is_active: event.target.checked,
                  })
                }
                className="h-5 w-5"
              />

              <div>
                <p className="font-black">Active Team</p>
                <p className="text-sm text-gray-400">
                  Active teams can be selected for new games.
                </p>
              </div>
            </label>

            <button
              type="submit"
              disabled={savingTeam || uploadingTeamLogo}
              className="md:col-span-2 w-full rounded-2xl bg-orange-500 px-6 py-4 text-lg font-black text-black disabled:opacity-40"
            >
              {savingTeam
                ? "SAVING..."
                : editingTeamId
                ? "SAVE TEAM CHANGES"
                : "ADD TEAM"}
            </button>
          </form>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-orange-400">
                Database
              </p>
              <h2 className="mt-2 text-3xl font-black">All Teams</h2>
            </div>

            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-black">
              {teams.length} teams
            </span>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {teams.map((team) => {
              const active = team.is_active ?? true;
              const playerCount = players.filter(
                (player) => player.team_id === team.id
              ).length;
              const coachCount = coaches.filter(
                (coach) => coach.team_id === team.id
              ).length;

              return (
                <article
                  key={team.id}
                  className={`rounded-3xl border p-6 ${
                    managedTeamId === team.id
                      ? "border-orange-400/60 bg-orange-500/10"
                      : "border-white/10 bg-white/10"
                  }`}
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
                        {[team.city, team.country].filter(Boolean).join(", ") ||
                          "Location not set"}
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

                  <div className="mt-5 grid grid-cols-2 gap-3 text-center">
                    <div className="rounded-2xl bg-[#081321] p-3">
                      <p className="text-2xl font-black text-orange-400">
                        {playerCount}
                      </p>
                      <p className="text-xs font-bold uppercase text-gray-400">
                        Players
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#081321] p-3">
                      <p className="text-2xl font-black text-orange-400">
                        {coachCount}
                      </p>
                      <p className="text-xs font-bold uppercase text-gray-400">
                        Coaches
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => manageRoster(team)}
                    className="mt-5 w-full rounded-2xl bg-orange-500 px-4 py-4 font-black text-black"
                  >
                    MANAGE ROSTER →
                  </button>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => startEditTeam(team)}
                      className="rounded-2xl bg-blue-500/15 px-4 py-3 font-black text-blue-300"
                    >
                      EDIT TEAM
                    </button>

                    <button
                      onClick={() => void toggleTeamActive(team)}
                      className="rounded-2xl bg-yellow-500/15 px-4 py-3 font-black text-yellow-300"
                    >
                      {active ? "DEACTIVATE" : "ACTIVATE"}
                    </button>
                  </div>

                  <button
                    onClick={() => void deleteTeam(team)}
                    className="mt-3 w-full rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-black text-red-300"
                  >
                    DELETE TEAM
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        {managedTeam && (
          <section
            id="team-roster-manager"
            className="mt-12 scroll-mt-6 rounded-[32px] border border-orange-500/30 bg-white/10 p-5 md:p-8"
          >
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-orange-400">
                  Team Roster
                </p>
                <h2 className="mt-2 text-4xl font-black">
                  {managedTeam.name}
                </h2>
                <p className="mt-2 text-gray-400">
                  {teamPlayers.length} players · {teamCoaches.length} coaches
                </p>
              </div>

              <button
                onClick={() => setManagedTeamId("")}
                className="rounded-full border border-white/15 bg-white/10 px-5 py-3 font-black"
              >
                Close Roster
              </button>
            </div>

            <div className="mt-8 grid gap-8 xl:grid-cols-2">
              <section
                id="player-form"
                className="scroll-mt-6 rounded-3xl border border-white/10 bg-[#081321] p-5 md:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-400">
                      Players
                    </p>
                    <h3 className="mt-2 text-2xl font-black">
                      {editingPlayerId ? "Edit Player" : "Add Player"}
                    </h3>
                  </div>

                  {editingPlayerId && (
                    <button
                      onClick={resetPlayerForm}
                      className="rounded-full border border-white/15 px-4 py-2 text-sm font-black"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <form
                  onSubmit={handlePlayerSubmit}
                  className="mt-6 grid gap-4 md:grid-cols-2"
                >
                  <Field label="First Name">
                    <input
                      value={playerForm.first_name}
                      onChange={(event) =>
                        setPlayerForm({
                          ...playerForm,
                          first_name: event.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Last Name">
                    <input
                      value={playerForm.last_name}
                      onChange={(event) =>
                        setPlayerForm({
                          ...playerForm,
                          last_name: event.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Jersey Number">
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={playerForm.jersey_number}
                      onChange={(event) =>
                        setPlayerForm({
                          ...playerForm,
                          jersey_number: event.target.value,
                        })
                      }
                      placeholder="11"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Position">
                    <select
                      value={playerForm.position}
                      onChange={(event) =>
                        setPlayerForm({
                          ...playerForm,
                          position: event.target.value,
                        })
                      }
                      className={inputClass}
                    >
                      <option value="">Select position</option>
                      <option value="PG">PG</option>
                      <option value="SG">SG</option>
                      <option value="SF">SF</option>
                      <option value="PF">PF</option>
                      <option value="C">C</option>
                      <option value="G">G</option>
                      <option value="F">F</option>
                    </select>
                  </Field>

                  <Field label="Birth Date">
                    <input
                      type="date"
                      value={playerForm.birth_date}
                      onChange={(event) =>
                        setPlayerForm({
                          ...playerForm,
                          birth_date: event.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Height (cm)">
                    <input
                      type="number"
                      min="50"
                      max="260"
                      value={playerForm.height_cm}
                      onChange={(event) =>
                        setPlayerForm({
                          ...playerForm,
                          height_cm: event.target.value,
                        })
                      }
                      placeholder="185"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Nationality">
                    <input
                      value={playerForm.nationality}
                      onChange={(event) =>
                        setPlayerForm({
                          ...playerForm,
                          nationality: event.target.value,
                        })
                      }
                      placeholder="Georgia"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Player Photo">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      disabled={uploadingPlayerPhoto}
                      onChange={(event) =>
                        void handlePlayerPhotoUpload(
                          event.target.files?.[0] ?? null
                        )
                      }
                      className={fileClass}
                    />
                  </Field>

                  {playerForm.photo_url && (
                    <div className="md:col-span-2 flex justify-center">
                      <img
                        src={playerForm.photo_url}
                        alt="Player preview"
                        className="h-28 w-28 rounded-2xl object-cover"
                      />
                    </div>
                  )}

                  <label className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <input
                      type="checkbox"
                      checked={playerForm.is_active}
                      onChange={(event) =>
                        setPlayerForm({
                          ...playerForm,
                          is_active: event.target.checked,
                        })
                      }
                      className="h-5 w-5"
                    />
                    <span className="font-black">Active Player</span>
                  </label>

                  <button
                    type="submit"
                    disabled={savingPlayer || uploadingPlayerPhoto}
                    className="md:col-span-2 rounded-2xl bg-orange-500 px-5 py-4 font-black text-black disabled:opacity-40"
                  >
                    {savingPlayer
                      ? "SAVING..."
                      : editingPlayerId
                      ? "SAVE PLAYER"
                      : "+ ADD PLAYER"}
                  </button>
                </form>
              </section>

              <section
                id="coach-form"
                className="scroll-mt-6 rounded-3xl border border-white/10 bg-[#081321] p-5 md:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-400">
                      Coaching Staff
                    </p>
                    <h3 className="mt-2 text-2xl font-black">
                      {editingCoachId ? "Edit Coach" : "Add Coach"}
                    </h3>
                  </div>

                  {editingCoachId && (
                    <button
                      onClick={resetCoachForm}
                      className="rounded-full border border-white/15 px-4 py-2 text-sm font-black"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <form
                  onSubmit={handleCoachSubmit}
                  className="mt-6 grid gap-4 md:grid-cols-2"
                >
                  <Field label="First Name">
                    <input
                      value={coachForm.first_name}
                      onChange={(event) =>
                        setCoachForm({
                          ...coachForm,
                          first_name: event.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Last Name">
                    <input
                      value={coachForm.last_name}
                      onChange={(event) =>
                        setCoachForm({
                          ...coachForm,
                          last_name: event.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Role">
                    <select
                      value={coachForm.role}
                      onChange={(event) =>
                        setCoachForm({
                          ...coachForm,
                          role: event.target.value,
                        })
                      }
                      className={inputClass}
                    >
                      <option value="HEAD_COACH">Head Coach</option>
                      <option value="ASSISTANT_COACH">Assistant Coach</option>
                      <option value="TEAM_MANAGER">Team Manager</option>
                      <option value="PHYSIO">Physio</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </Field>

                  <Field label="Nationality">
                    <input
                      value={coachForm.nationality}
                      onChange={(event) =>
                        setCoachForm({
                          ...coachForm,
                          nationality: event.target.value,
                        })
                      }
                      placeholder="Georgia"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Coach Photo">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      disabled={uploadingCoachPhoto}
                      onChange={(event) =>
                        void handleCoachPhotoUpload(
                          event.target.files?.[0] ?? null
                        )
                      }
                      className={fileClass}
                    />
                  </Field>

                  {coachForm.photo_url && (
                    <div className="flex items-center justify-center">
                      <img
                        src={coachForm.photo_url}
                        alt="Coach preview"
                        className="h-28 w-28 rounded-2xl object-cover"
                      />
                    </div>
                  )}

                  <label className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <input
                      type="checkbox"
                      checked={coachForm.is_active}
                      onChange={(event) =>
                        setCoachForm({
                          ...coachForm,
                          is_active: event.target.checked,
                        })
                      }
                      className="h-5 w-5"
                    />
                    <span className="font-black">Active Staff Member</span>
                  </label>

                  <button
                    type="submit"
                    disabled={savingCoach || uploadingCoachPhoto}
                    className="md:col-span-2 rounded-2xl bg-blue-500 px-5 py-4 font-black disabled:opacity-40"
                  >
                    {savingCoach
                      ? "SAVING..."
                      : editingCoachId
                      ? "SAVE COACH"
                      : "+ ADD COACH"}
                  </button>
                </form>
              </section>
            </div>

            <div className="mt-8 grid gap-8 xl:grid-cols-2">
              <section>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-2xl font-black">Players</h3>
                  <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black">
                    {teamPlayers.length}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {teamPlayers.map((player) => (
                    <article
                      key={player.id}
                      className="rounded-2xl border border-white/10 bg-[#081321] p-4"
                    >
                      <div className="flex items-center gap-4">
                        {player.photo_url ? (
                          <img
                            src={player.photo_url}
                            alt={`${player.first_name} ${player.last_name}`}
                            className="h-16 w-16 shrink-0 rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl font-black">
                            #{player.jersey_number ?? "-"}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="text-xl font-black">
                            #{player.jersey_number ?? "-"} {player.first_name}{" "}
                            {player.last_name}
                          </p>

                          <p className="mt-1 text-sm text-gray-400">
                            {[
                              player.position,
                              player.height_cm ? `${player.height_cm} cm` : null,
                              player.birth_date,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>

                          <p className="mt-1 text-xs font-bold text-gray-500">
                            {player.cybl_id}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            player.is_active ?? true
                              ? "bg-green-500/15 text-green-300"
                              : "bg-red-500/15 text-red-300"
                          }`}
                        >
                          {player.is_active ?? true ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <button
                          onClick={() => startEditPlayer(player)}
                          className="rounded-xl bg-blue-500/15 px-3 py-3 text-sm font-black text-blue-300"
                        >
                          EDIT
                        </button>

                        <button
                          onClick={() => void togglePlayerActive(player)}
                          className="rounded-xl bg-yellow-500/15 px-3 py-3 text-sm font-black text-yellow-300"
                        >
                          {player.is_active ?? true ? "DEACTIVATE" : "ACTIVATE"}
                        </button>

                        <button
                          onClick={() => void deletePlayer(player)}
                          className="rounded-xl bg-red-500/10 px-3 py-3 text-sm font-black text-red-300"
                        >
                          DELETE
                        </button>
                      </div>
                    </article>
                  ))}

                  {teamPlayers.length === 0 && (
                    <div className="rounded-2xl border border-white/10 bg-[#081321] p-6 text-center text-gray-400">
                      No players yet. Add the first player above.
                    </div>
                  )}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-2xl font-black">Coaching Staff</h3>
                  <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black">
                    {teamCoaches.length}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {teamCoaches.map((coach) => (
                    <article
                      key={coach.id}
                      className="rounded-2xl border border-white/10 bg-[#081321] p-4"
                    >
                      <div className="flex items-center gap-4">
                        {coach.photo_url ? (
                          <img
                            src={coach.photo_url}
                            alt={`${coach.first_name} ${coach.last_name}`}
                            className="h-16 w-16 shrink-0 rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-sm font-black">
                            STAFF
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="text-xl font-black">
                            {coach.first_name} {coach.last_name}
                          </p>

                          <p className="mt-1 text-sm font-bold text-orange-400">
                            {coach.role.replaceAll("_", " ")}
                          </p>

                          {coach.nationality && (
                            <p className="mt-1 text-sm text-gray-400">
                              {coach.nationality}
                            </p>
                          )}
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            coach.is_active
                              ? "bg-green-500/15 text-green-300"
                              : "bg-red-500/15 text-red-300"
                          }`}
                        >
                          {coach.is_active ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <button
                          onClick={() => startEditCoach(coach)}
                          className="rounded-xl bg-blue-500/15 px-3 py-3 text-sm font-black text-blue-300"
                        >
                          EDIT
                        </button>

                        <button
                          onClick={() => void toggleCoachActive(coach)}
                          className="rounded-xl bg-yellow-500/15 px-3 py-3 text-sm font-black text-yellow-300"
                        >
                          {coach.is_active ? "DEACTIVATE" : "ACTIVATE"}
                        </button>

                        <button
                          onClick={() => void deleteCoach(coach)}
                          className="rounded-xl bg-red-500/10 px-3 py-3 text-sm font-black text-red-300"
                        >
                          DELETE
                        </button>
                      </div>
                    </article>
                  ))}

                  {teamCoaches.length === 0 && (
                    <div className="rounded-2xl border border-white/10 bg-[#081321] p-6 text-center text-gray-400">
                      No coaching staff yet.
                    </div>
                  )}
                </div>
              </section>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-[#050f1e] px-4 py-4 text-white outline-none focus:border-orange-400";

const fileClass =
  "block w-full rounded-2xl border border-white/10 bg-[#050f1e] px-4 py-3 text-sm text-gray-300 file:mr-4 file:rounded-xl file:border-0 file:bg-orange-500 file:px-4 file:py-2 file:font-black file:text-black";

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