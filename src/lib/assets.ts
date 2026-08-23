/**
 * Utility to convert an image URL to a Base64 string.
 * Essential for html2pdf.js to avoid 404s/CORS issues in production.
 */
export async function getBase64ImageFromUrl(imageUrl: string): Promise<string> {
  try {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result as string));
      reader.addEventListener("error", () => reject(new Error("Failed to convert image to Base64")));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error fetching image for Base64 conversion:", error);
    // Fallback to the URL itself if conversion fails, though it might break in PDF
    return imageUrl;
  }
}
