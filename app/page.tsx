import sql from "@/app/lib/db";
import { Snippet } from "@/app/lib/definitions";

export default async function Home() {
  let rows: Snippet[] = [];

  try {
    rows = await sql<Snippet[]>`SELECT * FROM snippets`;
  } catch (error) {
    console.error("Database Error:", error);
  }

  return (
    <div className="p-10 font-mono text-sm">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>

      {rows.length > 0 ? (
        <div className="p-4 bg-green-100 border border-green-500 rounded text-green-700">
          ✅ <strong>Success!</strong> Found {rows.length} snippet(s) in
          database.
          <pre className="mt-4 p-2 bg-black text-white rounded">
            {JSON.stringify(rows[0], null, 2)}
          </pre>
        </div>
      ) : (
        <div className="p-4 bg-red-100 text-red-700">
          ❌ Connected, but no data found.
        </div>
      )}
    </div>
  );
}
