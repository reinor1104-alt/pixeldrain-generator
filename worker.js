export default {
  async fetch(request) {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    // =====================
    // API MODE
    // =====================
    if (id) {
      try {
        const res = await fetch(`https://pixeldrain.com/api/file/${id}`);
        if (!res.ok) {
          return Response.json({ error: "Failed fetch API" }, { status: 500 });
        }

        const data = await res.json();

        if (!data || data.success === false) {
          return Response.json({ error: "File not found" }, { status: 404 });
        }

        return Response.json({
          id: data.id,
          title: data.name || "Unknown",
          size: data.size || 0,
          mime: data.mime_type || "unknown",
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

    // =====================
    // UI MODE
    // =====================
    return new Response(`
<!DOCTYPE html>
<html>
<head>
<title>Pixeldrain Generator</title>
</head>
<body>
<h2>Pixeldrain Generator</h2>
<input id="input" placeholder="Masukkan ID" />
<button onclick="go()">Generate</button>
<div id="out"></div>

<script>
async function go() {
  const id = document.getElementById('input').value;
  const res = await fetch('?id=' + id);
  const data = await res.json();

  document.getElementById('out').innerHTML =
    '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
}
</script>

</body>
</html>
    `, {
      headers: { "content-type": "text/html;charset=UTF-8" }
    });
  }
};
