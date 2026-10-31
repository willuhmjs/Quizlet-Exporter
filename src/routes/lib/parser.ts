import type { Card } from './card';

function clean(el: Element): string {
	// Prefer the semantic text spans Quizlet renders inside each card side; fall
	// back to raw textContent so future class changes still yield something.
	const spans = el.querySelectorAll('.TermText, .FormattedText');
	const text =
		spans.length > 0
			? Array.from(spans)
					.map((s) => (s.getAttribute('aria-label') || s.textContent || '').trim())
					.filter(Boolean)
					.join(' ')
			: (el.textContent || '').trim();
	return text.replace(/\s+/g, ' ');
}

function cardsFromPairs(fronts: Element[], backs: Element[]): Card[] {
	const cards: Card[] = [];
	for (let i = 0; i < fronts.length; i++) {
		const term = clean(fronts[i]);
		const definition = backs[i] ? clean(backs[i]) : '';
		if (term || definition) cards.push({ term, definition });
	}
	return cards;
}

// Current Quizlet (2024+): obfuscated classes, but stable data-testid sides,
// alternating term/definition in document order.
function parseModern(doc: Document): Card[] {
	const sides = Array.from(doc.querySelectorAll('[data-testid="set-page-term-card-side"]'));
	if (sides.length >= 2 && sides.length % 2 === 0) {
		return cardsFromPairs(
			sides.filter((_, i) => i % 2 === 0),
			sides.filter((_, i) => i % 2 === 1)
		);
	}
	// Flip-card variant with explicit front/back faces.
	const fronts = Array.from(doc.querySelectorAll('[data-testid="set-page-term-card-side"][data-face="front"], [data-testid="Card-front"]'));
	const backs = Array.from(doc.querySelectorAll('[data-testid="set-page-term-card-side"][data-face="back"], [data-testid="Card-back"]'));
	if (fronts.length > 0 && backs.length === fronts.length) {
		return cardsFromPairs(fronts, backs);
	}
	return [];
}

// Legacy Quizlet (~2022) saved pages.
function parseLegacy(doc: Document): Card[] {
	const terms = Array.from(doc.querySelectorAll('.SetPageTerm-wordText'));
	const defs = Array.from(doc.querySelectorAll('.SetPageTerm-definitionText'));
	if (terms.length === 0) return [];
	return cardsFromPairs(terms, defs);
}

// SEO JSON-LD block Quizlet embeds in every public set page (first ~10 cards).
// Last resort: better a partial export than an empty one.
function parseJsonLd(doc: Document): Card[] {
	const blocks = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
	for (const block of blocks) {
		let data: unknown;
		try {
			data = JSON.parse(block.textContent || '');
		} catch {
			continue;
		}
		if (
			typeof data === 'object' &&
			data !== null &&
			(data as { '@type'?: string })['@type'] === 'Quiz' &&
			Array.isArray((data as { hasPart?: unknown }).hasPart)
		) {
			const parts = (data as {
				hasPart: { text?: string; acceptedAnswer?: { text?: string } }[];
			}).hasPart;
			return parts
				.map((p) => ({ term: p.text || '', definition: p.acceptedAnswer?.text || '' }))
				.filter((c) => c.term || c.definition);
		}
	}
	return [];
}

export default async function (file: File): Promise<Card[]> {
	const text = await file.text();
	return parseHtml(text);
}

export function parseHtml(text: string): Card[] {
	const virtualDoc = new DOMParser().parseFromString(text, 'text/html');
	const modern = parseModern(virtualDoc);
	if (modern.length > 0) return modern;
	const legacy = parseLegacy(virtualDoc);
	if (legacy.length > 0) return legacy;
	return parseJsonLd(virtualDoc);
}
