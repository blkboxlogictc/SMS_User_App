import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register service worker for PWA functionality
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);

        // Check for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New content is available, show update notification
                if (confirm("New version available! Reload to update?")) {
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

// Add install prompt for PWA
let deferredPrompt: any;

window.addEventListener("beforeinstallprompt", (e) => {
  console.log("PWA install prompt available");
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;

  // Show install button or banner
  showInstallPromotion();
});

function showInstallPromotion() {
  // Create install banner
  const installBanner = document.createElement("div");
  installBanner.id = "install-banner";
  installBanner.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    background: linear-gradient(135deg, #3B82F6, #10B981);
    color: white;
    padding: 16px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: slideUp 0.3s ease-out;
  `;

  installBanner.innerHTML = `
    <div style="flex: 1;">
      <div style="font-weight: 600; margin-bottom: 4px;">📱 Install Stuart Main Street</div>
      <div style="font-size: 14px; opacity: 0.9;">Add to your home screen for quick access!</div>
    </div>
    <div style="display: flex; gap: 8px;">
      <button id="install-btn" style="
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
      ">Install</button>
      <button id="dismiss-btn" style="
        background: transparent;
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
      ">×</button>
    </div>
  `;

  // Add animation keyframes
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(installBanner);

  // Handle install button click
  document
    .getElementById("install-btn")
    ?.addEventListener("click", async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        deferredPrompt = null;
      }
      installBanner.remove();
    });

  // Handle dismiss button click
  document.getElementById("dismiss-btn")?.addEventListener("click", () => {
    installBanner.remove();
    // Remember user dismissed (optional: store in localStorage)
    localStorage.setItem("installPromptDismissed", Date.now().toString());
  });

  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (document.getElementById("install-banner")) {
      installBanner.remove();
    }
  }, 10000);
}

// Handle successful installation
window.addEventListener("appinstalled", (evt) => {
  console.log("PWA was installed successfully");
  // Remove install banner if still visible
  const banner = document.getElementById("install-banner");
  if (banner) {
    banner.remove();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
