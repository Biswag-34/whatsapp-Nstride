import readXlsxFile, { type Row } from "read-excel-file/browser";

import type { ImportedRow } from "@/features/import-center/types";

function cleanHeader(value: unknown, index: number) {
  const header = String(value ?? "").trim();

  return header.length > 0 ? header : `Column ${index + 1}`;
}

export async function parseImportFile(file: File) {
  const isCsv = file.name.toLowerCase().endsWith(".csv");
  const rawRows: Row[] = isCsv
    ? await parseCsvFile(file)
    : ((await readXlsxFile(file)) as unknown as Row[]);

  if (rawRows.length < 2) {
    return {
      columns: rawRows[0]?.map(cleanHeader) ?? [],
      rows: [] as ImportedRow[],
    };
  }

  const columns = rawRows[0].map(cleanHeader);
  const rows = rawRows
    .slice(1)
    .filter((row) => row.some((value) => String(value ?? "").trim().length > 0))
    .map((row, index) => ({
      id: crypto.randomUUID(),
      rowNumber: index + 2,
      values: columns.reduce<Record<string, string>>((values, column, columnIndex) => {
        values[column] = String(row[columnIndex] ?? "").trim();
        return values;
      }, {}),
    }));

  return { columns, rows };
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && nextCharacter === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (character === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  cells.push(current);
  return cells;
}

async function parseCsvFile(file: File): Promise<Row[]> {
  const text = await file.text();

  return text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map(parseCsvLine);
}
