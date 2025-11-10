// src/lib/upload.ts
export async function uploadToCloudinary(uri: string) {
    // replace with your values
    const CLOUD_NAME = "framez-cloud";
    const UPLOAD_PRESET = "framez_unsigned";

    // try to guess mime type from filename
    const guessMime = (u: string) => {
        const ext = u.split(".").pop()?.toLowerCase() ?? "";
        if (["jpg", "jpeg"].includes(ext)) return "image/jpeg";
        if (["png"].includes(ext)) return "image/png";
        if (["gif"].includes(ext)) return "image/gif";
        if (["mp4", "mov"].includes(ext)) return "video/mp4";
        return "application/octet-stream";
    };

    const name = uri.split("/").pop() ?? "upload";
    const type = guessMime(uri);

    const form = new FormData();
    form.append("file", {
        uri,
        name,
        type,
    } as any);
    form.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
        method: "POST",
        body: form,
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message ?? "Upload failed");
    return json.secure_url as string; // URL string
}
