import Papa from "papaparse";
import { read, utils } from "xlsx";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: "income" | "expense";
}

export async function parseSpreadsheet(file: File): Promise<Transaction[]> {
  const filename = file.name.toLowerCase();

  if (filename.endsWith(".csv")) {
    const text = await file.text();
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const transactions = processRows(results.data, "csv");
            resolve(transactions);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => reject(error),
      });
    });
  } else {
    // Handle .xlsx, .xls, .ods
    const data = await file.arrayBuffer();
    const workbook = read(data, { type: "array" });
    let allTransactions: Transaction[] = [];

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      // raw: false ensures dates and numbers are formatted as strings
      const rows = utils.sheet_to_json(sheet, { raw: false }) as any[];
      const transactions = processRows(rows, sheetName);
      allTransactions = [...allTransactions, ...transactions];
    }

    return allTransactions;
  }
}

function findKey(row: any, possibleKeys: string[]): string | undefined {
  const keys = Object.keys(row);
  for (const pk of possibleKeys) {
    const found = keys.find(k => k.toLowerCase().includes(pk.toLowerCase()));
    if (found) return found;
  }
  return undefined;
}

function processRows(rows: any[], sourceName: string): Transaction[] {
  return rows
    .map((row: any, index) => {
      const dateKey = findKey(row, ["date", "time", "posted"]);
      const descKey = findKey(row, ["description", "name", "payee", "memo", "title", "merchant", "particulars"]);
      const amountKey = findKey(row, ["amount", "value", "cost", "price", "debit", "credit", "total"]);
      const catKey = findKey(row, ["category", "type", "group", "class"]);
      const typeKey = findKey(row, ["type", "transaction type", "cr/dr"]);

      const date = dateKey ? String(row[dateKey]) : `Row ${index + 1}`;
      const description = descKey ? String(row[descKey]) : `Transaction ${index + 1}`;
      const amountStr = amountKey ? String(row[amountKey]) : "0";
      const category = catKey ? String(row[catKey]) : "Uncategorized";

      const cleanAmountStr = amountStr.replace(/[^0-9.-]+/g, "");
      let amount = parseFloat(cleanAmountStr);

      if (isNaN(amount)) amount = 0;

      let type: "income" | "expense" = amount >= 0 ? "income" : "expense";
      if (typeKey && row[typeKey]) {
        const t = String(row[typeKey]).toLowerCase();
        if (t.includes("income") || t.includes("credit") || t === "cr") {
          type = "income";
          amount = Math.abs(amount);
        } else if (t.includes("expense") || t.includes("debit") || t === "dr") {
          type = "expense";
          amount = -Math.abs(amount);
        }
      } else if (amountKey && amountKey.toLowerCase().includes("debit")) {
         type = "expense";
         amount = -Math.abs(amount);
      } else if (amountKey && amountKey.toLowerCase().includes("credit")) {
         type = "income";
         amount = Math.abs(amount);
      }

      return {
        id: `tx-${sourceName}-${index}-${Date.now()}`,
        date,
        description,
        amount: Math.abs(amount),
        category,
        type: (amount >= 0 ? "income" : "expense") as "income" | "expense",
      };
    })
    .filter((tx) => tx.amount !== 0); // Filter out empty or invalid rows
}
