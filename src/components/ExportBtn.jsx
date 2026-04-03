import { useState, useRef, useEffect } from "react";

function exportCSV(data, filename) {
  const headers = Object.keys(data[0]);
  const rows = data.map(r => headers.map(h => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","));
  download([headers.join(","), ...rows].join("\n"), filename + ".csv", "text/csv");
}

function exportJSON(data, filename) {
  download(JSON.stringify(data, null, 2), filename + ".json", "application/json");
}

function exportHTML(data, filename, title) {
  const hdrs = Object.keys(data[0] || {});
  const rows = data.map(r => `<tr>${hdrs.map(h => `<td>${r[h] ?? ""}</td>`).join("")}</tr>`).join("");
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>${title}</title>
<style>body{font-family:sans-serif;padding:28px;background:#f4f5f7}h1{margin-bottom:6px}
.meta{font-size:12px;color:#777;margin-bottom:18px}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.1)}
th{background:#0d1018;color:#f0c040;padding:11px 14px;text-align:left;font-size:12px}
td{padding:10px 14px;border-bottom:1px solid #eee;font-size:13px}
tr:hover td{background:#fafafa}</style></head><body>
<h1>📋 ${title}</h1>
<div class="meta">Exported: ${new Date().toLocaleString()} · ${data.length} records</div>
<table><thead><tr>${hdrs.map(h => `<th>${h}</th>`).join("")}</tr></thead>
<tbody>${rows}</tbody></table></body></html>`;
  download(html, filename + ".html", "text/html");
}

function download(content, filename, type) {
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(new Blob([content], { type })),
    download: filename,
  });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function ExportBtn({ data, filename, title }) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");
  const ref = useRef();

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const run = (type) => {
    if (!data?.length) { alert("No data to export."); return; }
    if (type === "csv")  exportCSV(data, filename);
    if (type === "json") exportJSON(data, filename);
    if (type === "html") exportHTML(data, filename, title);
    setToast(`✅ Exported ${data.length} records as ${type.toUpperCase()}`);
    setTimeout(() => setToast(""), 2800);
    setOpen(false);
  };

  return (
    <>
      <div className="export-wrap" ref={ref}>
        <button className="btn btn-export" onClick={() => setOpen(o => !o)}>
          ⬇ Export ▾
        </button>
        {open && (
          <div className="export-drop">
            {[
              { t: "csv",  icon: "📄", label: "CSV",  desc: "Spreadsheet / Excel" },
              { t: "json", icon: "🗂️", label: "JSON", desc: "Developer / API" },
              { t: "html", icon: "🌐", label: "HTML", desc: "Styled report" },
            ].map(o => (
              <button key={o.t} className="export-item" onClick={() => run(o.t)}>
                <span style={{ fontSize: "1.1rem" }}>{o.icon}</span>
                <div>
                  <div className="export-item-label">{o.label}</div>
                  <div className="export-item-desc">{o.desc}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {toast && (
        <div className="toast-stack">
          <div className="toast toast-success">{toast}</div>
        </div>
      )}
    </>
  );
}