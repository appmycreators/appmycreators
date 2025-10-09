import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { supabaseUrl } from "./lib/supabase";

// Inject preconnect/dns-prefetch for Supabase endpoints to improve TTFB
(() => {
  try {
    if (!supabaseUrl) return;
    const u = new URL(supabaseUrl);
    const origins = [u.origin];
    // Common Supabase subpaths (auth/rest/storage)
    ["/auth/v1", "/rest/v1", "/storage/v1"].forEach((p) => origins.push(`${u.origin}${p}`));

    origins.forEach((href) => {
      const pre = document.createElement("link");
      pre.rel = "preconnect";
      pre.href = href;
      pre.crossOrigin = "anonymous";
      document.head.appendChild(pre);

      const dns = document.createElement("link");
      dns.rel = "dns-prefetch";
      dns.href = href;
      document.head.appendChild(dns);
    });
  } catch (e) {
    // no-op
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
