export default {
  async fetch(request) {
    const url = new URL(request.url);

    // =========================
    // JSON API MODE (?id=xxxx)
    // =========================
    const id = url.searchParams.get("id");

    if (id) {
      try {
        const api = `https://pixeldrain.com/api/file/${id}`;
        const res = await fetch(api);

        if (!res.ok) {
          return Response.json(
            { error: "Failed to fetch Pixeldrain API" },
            { status: 500 }
          );
        }

        const data = await res.json();

        if (!data || data.success === false) {
          return Response.json(
            { error: "File not found" },
            { status: 404 }
          );
        }

        return Response.json({
          id: data.id,
          title: data.name || "Unknown",
          size: data.size || 0,
          mime: data.mime_type || "unknown",
          link: `https://pixeldrain.com/u/${id}`,
          direct_download: `https://pixeldrain.com/api/file/${id}`,
          thumbnail:
            data.mime_type?.startsWith("image/")
              ? `https://pixeldrain.com/api/file/${id}`
              : "https://pixeldrain.com/assets/logo.png"
        });
      } catch (e) {
        return Response.json(
          { error: e.toString() },
          { status: 500 }
        );
      }
    }

    // =========================
    // UI MODE (HTML GENERATOR)
    // =========================
    return new Response(
      `
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pixeldrain Generator</title>

<style>
body {
  font-family: Arial, sans-serif;
  background: #111;
  color: #fff;
  padding: 20px;
}

h2 {
  text-align: center;
}

textarea {
  width: 100%;
  height: 150px;
  padding: 10px;
  border-radius: 6px;
  border: none;
  outline: none;
}

button {
  padding: 10px 15px;
  margin-top: 10px;
  cursor: pointer;
  border: none;
  border-radius: 6px;
  background: #4af;
  color: #000;
  font-weight: bold;
}

.card {
  background: #222;
  padding: 12px;
  margin-top: 10px;
  border-radius: 8px;
  word-break: break-all;
}

a {
  color: #4af;
  text-decoration: none;
}
</style>
</head>

<body>

<h2>Pixeldrain Multi Generator</h2>

<textarea id="input" placeholder="Masukkan ID Pixeldrain, satu per baris"></textarea>
<br>
<button onclick="generate()">Generate</button>

<div id="result"></div>

<script>
async function generate() {
  const input = document.getElementById("input").value.trim().split("\\n");
  const result = document.getElementById("result");

  result.innerHTML = "";

  for (let id of input) {
    id = id.trim();
    if (!id) continue;

    try {
      const res = await fetch("?id=" + id);
      const data = await res.json();

      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <b>${data.title}</b><br>
        <small>ID: ${data.id}</small><br><br>
        <a href="${data.link}" target="_blank">🔗 View</a> |
        <a href="${data.direct_download}" target="_blank">⬇ Download</a>
      `;

      result.appendChild(div);
    } catch (err) {
      console.log(err);
    }
  }
}
</script>

</body>
</html>
      `,
      {
        headers: {
          "content-type": "text/html;charset=UTF-8"
        }
      }
    );
  }
};
