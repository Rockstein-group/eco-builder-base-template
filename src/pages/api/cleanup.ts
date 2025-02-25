import type { APIContext } from "astro";
import { unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const COMPONENTS_DIR = fileURLToPath(
  new URL("../../components", import.meta.url)
);

export async function POST(context: APIContext) {
  try {
    const body = await context.request.json();
    const { path } = body;

    if (!path) {
      return new Response(JSON.stringify({ error: "Path is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Security check: ensure the path is within the components directory
    const normalizedPath = fileURLToPath(new URL(path, import.meta.url));
    if (!normalizedPath.startsWith(COMPONENTS_DIR)) {
      return new Response(JSON.stringify({ error: "Invalid path" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await unlink(path);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error cleaning up file:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
