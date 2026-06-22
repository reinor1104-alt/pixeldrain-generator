export default {
  async fetch(request) {
    const url = new URL(request.url);

    // =========================
    // Kalau ada parameter id → JSON mode
    // =========================
    const id = url.searchParams.get("id");

    if (id) {
      try {
        const api = `https://pixeldrain.com/api/file/${id}`;
        const res = await fetch(api);
        const data = await res.json();

        if (!data || data.success === false) {
          return Response.json({ error: "File not found" }, { status: 404 });
        }

        return Response.json({
          id: data.id,
          title: data.name,
          size: data.size,
          mime: data.mime_type,
          link: `https://pixeldrain.com/u/${id}`,
          direct_download: `https://pixeldrain.com/api/file/${id}`,
          thumbnail: data.mime_type?.startsWith("image/")
            ? `https://pixeldrain.com/api/file/${id}`
            : "https://pixeldrain.com/assets/logo.png"
        });
      } catch (e) {
        return Response.json({ error: e.toString() }, { status: 500 });
      }
    }

    // =========================
    // UI GENERATOR MODE (HTML)
    // =========================
    return new Response(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Pixeldrain Multi Generator</title>
<style>
body {
  font-family: Arial;
  background: #111;
  color: white;
  padding: 20px;
}

textarea {
  width: 100%;
  height: 150px;
  padding: 10px;
}

button {
  padding: 10px 15px;
  margin-top: 10px;
  cursor: pointer;
}

.card {
  background: #222;
  padding: 10px;
  margin-top: 10px;
  border-radius: 8px;
}
a { color: #4af; }
</style>
</head>
<body>

<h2>Pixeldrain Multi Link Generator</h2>

<textarea id="input" placeholder="Masukkan ID, satu per baris"></textarea>
<br>
<button onclick="generate()">Generate</button>

<div id="result"></div>

<script>
async function generate() {
  const input = document.getElementById("input").value.trim().split("\\n");
  const result = document.getElementById("result");
  result.innerHTML = "";

  for (let id of input) {
    if (!id) continue;

    try {
      const res = await fetch("?id=" + id);
      const data = await res.json();

      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <b>${data.title || "Unknown"}</b><br>
        ID: ${data.id}<br>
        <a href="${data.link}" target="_blank">View</a> |
        <a href="${data.direct_download}" target="_blank">Download</a>
      `;

      result.appendChild(div);
    } catch (e) {
      console.log(e);
    }
  }
}
</script>

</body>
</html>
    `, {
      headers: {
        "content-type": "text/html"
      }
    });
  }
};
