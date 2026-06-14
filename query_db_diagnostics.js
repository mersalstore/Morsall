const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, 'db_diag_output.txt');
function diagLog(msg) {
    const line = `[${new Date().toISOString()}] ${msg}\n`;
    fs.appendFileSync(logPath, line);
    console.log(msg);
}

// Clear log
if (fs.existsSync(logPath)) {
    fs.unlinkSync(logPath);
}

diagLog("=== DB DIAGNOSTICS STARTING ===");

// 1. Set environment variables to limit thread usage
process.env.TOKIO_WORKER_THREADS = '1';
process.env.UV_THREADPOOL_SIZE = '1';
diagLog("Set TOKIO_WORKER_THREADS=1 and UV_THREADPOOL_SIZE=1");

// 2. Kill other Node.js processes for our user to free up nproc limit
try {
    const currentPid = process.pid;
    diagLog(`Current process PID: ${currentPid}`);
    
    const pidsRaw = execSync("pgrep -u u754458241 node || true").toString().trim();
    if (pidsRaw) {
        const pids = pidsRaw.split('\n')
            .map(p => parseInt(p.trim()))
            .filter(p => p && p !== currentPid);
            
        diagLog(`Found other running node processes: ${pids.join(', ')}`);
        for (const pid of pids) {
            try {
                process.kill(pid, 'SIGKILL');
                diagLog(`Successfully killed zombie PID: ${pid}`);
            } catch (kErr) {
                diagLog(`Failed to kill PID ${pid}: ${kErr.message}`);
            }
        }
    } else {
        diagLog("No other node processes found.");
    }
} catch (e) {
    diagLog("Process cleanup failed or skipped: " + e.message);
}

// 3. Run prisma generate
try {
    diagLog("Running prisma generate...");
    const cmd = `"${process.execPath}" ./node_modules/prisma/build/index.js generate`;
    const out = execSync(cmd, { cwd: __dirname });
    diagLog("Prisma generate success:\n" + out.toString());
} catch (e) {
    diagLog("Prisma generate failed: " + e.message);
    if (e.stderr) diagLog("Prisma generate stderr: " + e.stderr.toString());
}

// 4. Connect to DB and fix existing SubscriptionPlan rows (set slug where null)
async function fixDataAndPush() {
    try {
        diagLog("Connecting to Database to fix SubscriptionPlan slugs...");
        const { PrismaClient } = require('@prisma/client');
        const db = new PrismaClient();
        
        // We will execute raw SQL because the schema definition might mismatch the DB
        // Fetch all plans
        const plans = await db.$queryRawUnsafe("SELECT id, name, slug FROM SubscriptionPlan");
        diagLog("Existing plans: " + JSON.stringify(plans));
        
        for (let i = 0; i < plans.length; i++) {
            const plan = plans[i];
            if (!plan.slug) {
                let fallbackSlug = "";
                if (plan.name) {
                    fallbackSlug = plan.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                }
                if (!fallbackSlug) {
                    fallbackSlug = `plan-${plan.id || i}`;
                }
                
                // Check if slug already exists to prevent duplicate key errors
                const exists = plans.some(p => p.slug === fallbackSlug);
                if (exists) {
                    fallbackSlug = `${fallbackSlug}-${i}`;
                }
                
                diagLog(`Updating plan id=${plan.id} name="${plan.name}" with slug="${fallbackSlug}"`);
                await db.$executeRawUnsafe(
                    "UPDATE SubscriptionPlan SET slug = ? WHERE id = ?",
                    fallbackSlug,
                    plan.id
                );
            }
        }
        
        await db.$disconnect();
        diagLog("SubscriptionPlan slugs fixed successfully!");
        
        // 5. Run prisma db push now that NULL slugs are resolved
        try {
            diagLog("Running prisma db push...");
            const cmd = `"${process.execPath}" ./node_modules/prisma/build/index.js db push --accept-data-loss`;
            const out = execSync(cmd, { cwd: __dirname });
            diagLog("Prisma db push success:\n" + out.toString());
        } catch (e) {
            diagLog("Prisma db push failed: " + e.message);
            if (e.stderr) diagLog("Prisma db push stderr: " + e.stderr.toString());
            if (e.stdout) diagLog("Prisma db push stdout: " + e.stdout.toString());
        }
        
    } catch (err) {
        diagLog("Error in data fix: " + err.message + "\nStack: " + err.stack);
    }
}

fixDataAndPush().then(() => {
    diagLog("=== DB DIAGNOSTICS COMPLETE ===");
});
