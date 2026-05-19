import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const node_dir = process.cwd();
  const log_file = path.join(node_dir, "logs", "stderr.log");
  const env_file = path.join(node_dir, ".env");

  let result = "=== Debug Info ===\n";

  try {
    if (fs.existsSync(env_file)) {
      const env = fs.readFileSync(env_file, "utf8");
      result += "\n=== .env Content (masked) ===\n";
      result += env.replace(/:(.*)@/, ":***@");
    } else {
      result += "\n.env NOT found\n";
    }

    if (fs.existsSync(log_file)) {
      const log = fs.readFileSync(log_file, "utf8");
      result += "\n=== Last 100 Lines of stderr.log ===\n";
      result += log.split("\n").slice(-100).join("\n");
    } else {
      result += "\nlogs/stderr.log NOT found\n";
    }

    result += "\n=== Directory Listing ===\n";
    result += fs.readdirSync(node_dir).join("\n");

  } catch (err: any) {
    result += "\nError: " + err.message;
  }

  return new NextResponse(result, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
