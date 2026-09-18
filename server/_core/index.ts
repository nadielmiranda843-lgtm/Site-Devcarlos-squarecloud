import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { constructPowerPetWebhook } from "../stripe";
import { ensureInitialAdmin } from "../db";
import { ENV } from "./env";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  if (ENV.adminPassword) {
    await ensureInitialAdmin({ name: ENV.adminName, email: ENV.adminEmail, password: ENV.adminPassword });
  } else {
    console.warn("ADMIN_PASSWORD não configurada; o servidor iniciará sem criar ou atualizar a conta administrativa.");
  }
  const app = express();
  const server = createServer(app);
  app.set("trust proxy", 1);
  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), (req, res) => {
    try {
      const event = constructPowerPetWebhook(req.body as Buffer, req.headers["stripe-signature"] as string | undefined);
      if (!event) return res.status(503).json({ error: "Stripe webhook não configurado." });
      if (event.id.startsWith("evt_test_")) return res.json({ verified: true });
      console.log(`[Stripe webhook] ${event.type} ${event.id}`);
      return res.json({ received: true });
    } catch (error) {
      console.error("[Stripe webhook] Invalid signature", error);
      return res.status(400).json({ error: "Webhook inválido." });
    }
  });
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = process.env.NODE_ENV === "production" ? preferredPort : await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  const host = process.env.HOST || "0.0.0.0";
  server.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}/`);
  });
}

startServer().catch(console.error);
