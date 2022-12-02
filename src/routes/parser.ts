
export default async function(file: File) {
    const text = await file.text();
    const textHTML = text.split("<!DOCTYPE html>")[1];
    const parser = new DOMParser();
    const virtualDoc = parser.parseFromString(textHTML, "text/html");
    const term = Array.from(virtualDoc.querySelectorAll(".SetPageTerm-wordText")).map(e => e.textContent);
    const definition = Array.from(virtualDoc.querySelectorAll(".setPageTerm-definitionText")).map(e => e.textContent);
    return term.map((t, i) => ({ term: t, definition: definition[i] }));
}