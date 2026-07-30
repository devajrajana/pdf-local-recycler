(function () {
  if (document.getElementById("pdf-recycler-floating-btn")) return;

  const btn = document.createElement("button");
  btn.id = "pdf-recycler-floating-btn";
  btn.title = "Recycle PDF & Close Tab";
  btn.innerHTML = "🗑️";

  // Fixed position & styling
  Object.assign(btn.style, {
    position: "fixed",
    top: "80px",
    right: "40px",
    zIndex: "2147483647",
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    backgroundColor: "#dc3545",
    color: "#ffffff",
    border: "2px solid #ffffff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
    fontSize: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  });

  // Simple click handler
  btn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "delete_current_pdf" });
  });

  (document.body || document.documentElement).appendChild(btn);
})();