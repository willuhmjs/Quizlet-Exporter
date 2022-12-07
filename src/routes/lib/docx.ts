import { Table, Paragraph, TableCell, TableRow, Document, Packer, TextRun, WidthType } from 'docx';
import type { Card } from './card';

function toRow(card: Card): InstanceType<typeof TableRow> {
	return new TableRow({
		children: [
			new TableCell({
				width: { size: 2409, type: WidthType.DXA },
				children: [
					new Paragraph({
						children: [new TextRun({ text: card.term, bold: true })]
					})
				]
			}),
			new TableCell({
				width: { size: 7229, type: WidthType.DXA },
				children: [
					new Paragraph({
						text: card.definition
					})
				]
			})
		]
	});
}

export default async function MakeDoc(cards: Card[]): Promise<Blob> {
	let rowArray: TableRow[] = cards.map((card) => toRow(card));

	const table = new Table({
		rows: rowArray,
		width: { size: 0, type: WidthType.AUTO },
		columnWidths: [2409, 7229]
	});

	const doc = new Document({
		sections: [
			{
				children: [table]
			}
		]
	});

	return await Packer.toBlob(doc);
}
