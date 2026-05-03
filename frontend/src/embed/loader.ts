(function () {
  const SCRIPT_URL = (document.currentScript as HTMLScriptElement)?.src || "https://seanbearden.com/embed.js";
  const BASE_URL = SCRIPT_URL.substring(0, SCRIPT_URL.lastIndexOf("/"));
  const EMBED_URL = `${BASE_URL}/embed.html`;

  const iframe = document.createElement("iframe");
  iframe.src = EMBED_URL;
  iframe.style.position = "fixed";
  iframe.style.bottom = "20px";
  iframe.style.right = "20px";
  iframe.style.width = "60px";
  iframe.style.height = "60px";
  iframe.style.border = "none";
  iframe.style.zIndex = "999999";
  iframe.style.transition = "width 0.3s ease, height 0.3s ease";
  iframe.style.colorScheme = "light dark";
  iframe.setAttribute("allow", "clipboard-read; clipboard-write");

  document.body.appendChild(iframe);

  window.addEventListener("message", (event) => {
    if (event.origin !== new URL(BASE_URL).origin) return;

    if (event.data?.type === "chat-agent:state") {
      if (event.data.isOpen) {
        iframe.style.width = "400px";
        iframe.style.height = "550px";
        // Handle mobile
        if (window.innerWidth < 450) {
          iframe.style.width = "100%";
          iframe.style.height = "100%";
          iframe.style.bottom = "0";
          iframe.style.right = "0";
        }
      } else {
        iframe.style.width = "60px";
        iframe.style.height = "60px";
        iframe.style.bottom = "20px";
        iframe.style.right = "20px";
      }
    }
  });
})();
