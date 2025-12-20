/**
 * Checks the magic bytes of a file to verify it's a valid image (JPG, PNG, WEBP).
 */
export async function validateImageFile(file: File): Promise<{ isValid: boolean; error?: string }> {
  // 1. Basic MIME type check (fast fail)
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    return { isValid: false, error: "Invalid file type. Only JPG, PNG, and WEBP are allowed." };
  }

  // 2. Size check (e.g., 5MB limit)
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE) {
    return { isValid: false, error: "File size exceeds 5MB limit." };
  }

  // 3. Magic Bytes Check (Content Inspection)
  const isRealImage = await checkMagicBytes(file);
  if (!isRealImage) {
    return { isValid: false, error: "File content does not match image format." };
  }

  return { isValid: true };
}

async function checkMagicBytes(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    // Read the first 16 bytes (enough for most signatures)
    reader.onloadend = (e) => {
      if (!e.target?.result || !(e.target.result instanceof ArrayBuffer)) {
        return resolve(false);
      }

      const arr = new Uint8Array(e.target.result);
      const header = getHexString(arr);

      // Check signatures
      // JPEG: FF D8 FF
      if (header.startsWith("ffd8ff")) return resolve(true);
      
      // PNG: 89 50 4E 47 0D 0A 1A 0A
      if (header.startsWith("89504e470d0a1a0a")) return resolve(true);
      
      // WEBP: RIFF....WEBP (RIFF = 52 49 46 46, WEBP = 57 45 42 50)
      // Offset 0-3 is "RIFF", offset 8-11 is "WEBP"
      if (header.startsWith("52494646") && header.substring(16, 24) === "57454250") {
        return resolve(true);
      }

      resolve(false);
    };

    reader.readAsArrayBuffer(file.slice(0, 16));
  });
}

function getHexString(buffer: Uint8Array) {
  return Array.from(buffer)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}