import { Table, Paragraph, TableCell, TableRow, Document, Packer, TextRun } from 'docx';

export interface Card {
	term: string;
	definition: string;
}

function toRow(card: Card): InstanceType<typeof TableRow> {
	return new TableRow({
		children: [
			new TableCell({
				width: { size: 100 },
				children: [
					new Paragraph({
						children: [new TextRun({ text: card.term, bold: true })]
					})
				]
			}),
			new TableCell({
				children: [
					new Paragraph({
						text: card.definition
					})
				]
			})
		]
	});
}

export default async function MakeDoc(cards: Card[]): Promise<Buffer> {
	let rowArray: TableRow[] = cards.map((card) => toRow(card));

	const table = new Table({
		rows: rowArray
	});

	const doc = new Document({
		sections: [
			{
				children: [table]
			}
		]
	});

	return await Packer.toBuffer(doc);
}
