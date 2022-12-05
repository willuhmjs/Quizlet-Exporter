import type { Card } from "./card";

export default async function (file: File): Promise<Card[]> {
	const text = await file.text();
	const parser = new DOMParser();
	const virtualDoc = parser.parseFromString(text, 'text/html');
	const term = Array.from(virtualDoc.querySelectorAll('.SetPageTerm-wordText')).map(
		(e) => e.textContent
	);
	const definition = Array.from(virtualDoc.querySelectorAll('.SetPageTerm-definitionText')).map(
		(e) => e.textContent
	);
	return term.map((t, i) => {
		return { term: ""+t, definition: ""+definition[i] }
	});
}
