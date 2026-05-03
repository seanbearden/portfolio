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

  // Single source of truth for the iframe's geometry. Both the open/close
  // state event and the window resize event call this so the widget stays
  // responsive when the user rotates a device or resizes mid-conversation.
  let isOpen = false;
  const updateDimensions = () => {
    if (isOpen) {
      const isMobile = window.innerWidth < 450;
      iframe.style.width = isMobile ? "100%" : "400px";
      iframe.style.height = isMobile ? "100%" : "550px";
      iframe.style.bottom = isMobile ? "0" : "20px";
      iframe.style.right = isMobile ? "0" : "20px";
    } else {
      iframe.style.width = "60px";
      iframe.style.height = "60px";
      iframe.style.bottom = "20px";
      iframe.style.right = "20px";
    }
  };

  window.addEventListener("message", (event) => {
    if (event.origin !== new URL(BASE_URL).origin) return;

    if (event.data?.type === "chat-agent:state") {
      isOpen = !!event.data.isOpen;
      updateDimensions();
    }
  });

  // Re-evaluate dimensions on viewport changes (resize, rotation) so an
  // open chat adapts when crossing the mobile breakpoint.
  window.addEventListener("resize", updateDimensions);
})();
