import express from "express";
import path from "path";
import app from "./api/index";

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  if (!process.env.VERCEL) {
    if (process.env.NODE_ENV !== "production") {
      const viteModuleName = "vite";
      const { createServer: createViteServer } = await import(
        /* @vite-ignore */ viteModuleName
      );
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.get("/admin", (_req: any, res: any) => {
        res.redirect("/admin.html");
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("/admin", (_req: any, res: any) => {
        res.sendFile(path.join(distPath, "admin.html"));
      });
      app.get("*", (req: any, res: any, next: any) => {
        if (
          req.path.startsWith("/api") ||
          req.url.startsWith("/api") ||
          req.path.startsWith("/cashfree") ||
          req.url.startsWith("/cashfree")
        ) {
          return next();
        }
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`⚡ Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
