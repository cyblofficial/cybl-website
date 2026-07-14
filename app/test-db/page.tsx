import { supabase } from "@/app/lib/supabase";

export default async function TestDatabasePage() {
  const { data, error } = await supabase
    .from("teams")
    .select("*");

  return (
    <main className="min-h-screen bg-[#050816] p-10 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-400">
          CYBL Database Test
        </p>

        <h1 className="mt-4 text-4xl font-black">
          Supabase Connection
        </h1>

        {error ? (
          <div className="mt-8 rounded-3xl border border-red-500/30 bg-red-500/10 p-6">
            <p className="font-black text-red-400">
              Database Error
            </p>

            <pre className="mt-4 whitespace-pre-wrap text-sm text-red-200">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-green-500/30 bg-green-500/10 p-6">
            <p className="text-2xl font-black text-green-400">
              ✅ Supabase Connected
            </p>

            <p className="mt-3 text-gray-300">
              Teams found: {data?.length ?? 0}
            </p>

            <pre className="mt-6 overflow-auto rounded-2xl bg-black/30 p-5 text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}