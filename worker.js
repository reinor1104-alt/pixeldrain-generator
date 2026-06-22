export default {
  async fetch(request) {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    // =========================
    // VALIDASI INPUT
    // =========================
    if (!id) {
      return Response.json({
        error: "Missing id parameter",
        usage: "?id=abc123"
      }, { status: 400 });
    }

    try {
      // =========================
      // CALL PIXELDRAIN API
      // =========================
      const apiUrl = `https://pixeldrain.com/api/file/${id}`;
      const res = await fetch(apiUrl);
      const data = await res.json();

      // =========================
      // CHECK ERROR
      // =========================
      if (!data || data.success === false) {
        return Response.json({
          error: "File not found or invalid ID"
        }, { status: 404 });
      }

      // =========================
      // BUILD OUTPUT
      // =========================
      const viewUrl = `https://pixeldrain.com/u/${id}`;
      const downloadUrl = `https://pixeldrain.com/api/file/${id}`;

      const isImage = data.mime_type && data.mime_type.startsWith("image/");

      const thumbnail = isImage
        ? downloadUrl
        : "https://pixeldrain.com/assets/logo.png";

      return Response.json({
        status: "success",
        id: data.id,
        title: data.name,
        size: data.size,
        mime: data.mime_type || "unknown",
        views: data.views || 0,
        downloads: data.downloads || 0,

        thumbnail: thumbnail,
        link: viewUrl,
        direct_download: downloadUrl
      });

    } catch (err) {
      return Response.json({
        error: "Internal error",
        detail: err.toString()
      }, { status: 500 });
    }
  }
};
