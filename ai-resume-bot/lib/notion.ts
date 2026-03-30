import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  RichTextItemResponse,
  BlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// ─── 輔助：將 RichText 陣列轉純文字 ───────────────────────────
function richTextToPlain(rt: RichTextItemResponse[]): string {
  return rt.map((t) => t.plain_text).join("");
}

// ─── 抓取 Block 內容（段落、清單等）──────────────────────────
async function getBlocksText(blockId: string, depth = 0): Promise<string> {
  if (depth > 3) return ""; // 防止無限遞迴
  const response = await notion.blocks.children.list({ block_id: blockId, page_size: 100 });
  const lines: string[] = [];

  for (const block of response.results as BlockObjectResponse[]) {
    const indent = "  ".repeat(depth);
    switch (block.type) {
      case "paragraph":
        lines.push(indent + richTextToPlain(block.paragraph.rich_text));
        break;
      case "heading_1":
        lines.push(`\n${indent}# ` + richTextToPlain(block.heading_1.rich_text));
        break;
      case "heading_2":
        lines.push(`\n${indent}## ` + richTextToPlain(block.heading_2.rich_text));
        break;
      case "heading_3":
        lines.push(`\n${indent}### ` + richTextToPlain(block.heading_3.rich_text));
        break;
      case "bulleted_list_item":
        lines.push(`${indent}• ` + richTextToPlain(block.bulleted_list_item.rich_text));
        break;
      case "numbered_list_item":
        lines.push(`${indent}- ` + richTextToPlain(block.numbered_list_item.rich_text));
        break;
      case "quote":
        lines.push(`${indent}> ` + richTextToPlain(block.quote.rich_text));
        break;
      case "callout":
        lines.push(`${indent}[NOTE] ` + richTextToPlain(block.callout.rich_text));
        break;
      default:
        break;
    }
    // 遞迴取子 block
    if (block.has_children) {
      const childText = await getBlocksText(block.id, depth + 1);
      if (childText) lines.push(childText);
    }
  }
  return lines.filter(Boolean).join("\n");
}

// ─── 將 Page 的 Properties 轉為文字摘要 ──────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function propertiesToText(props: PageObjectResponse["properties"]): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(props)) {
    let text = "";
    switch (value.type) {
      case "title":
        text = richTextToPlain(value.title);
        break;
      case "rich_text":
        text = richTextToPlain(value.rich_text);
        break;
      case "select":
        text = value.select?.name ?? "";
        break;
      case "multi_select":
        text = value.multi_select.map((s) => s.name).join(", ");
        break;
      case "date":
        text = value.date
          ? `${value.date.start}${value.date.end ? ` → ${value.date.end}` : ""}`
          : "";
        break;
      case "checkbox":
        text = value.checkbox ? "Yes" : "No";
        break;
      case "url":
        text = value.url ?? "";
        break;
      case "email":
        text = value.email ?? "";
        break;
      case "phone_number":
        text = value.phone_number ?? "";
        break;
      case "number":
        text = value.number?.toString() ?? "";
        break;
      default:
        break;
    }
    if (text) parts.push(`${key}: ${text}`);
  }
  return parts.join("\n");
}

// ─── 主函式：抓整個 Database ──────────────────────────────────
export async function fetchResumeContext(): Promise<string> {
  const databaseId = process.env.NOTION_DATABASE_ID!;

  const response = await notion.databases.query({
    database_id: databaseId,
    page_size: 50,
  });

  const sections: string[] = [];

  for (const page of response.results as PageObjectResponse[]) {
    const propText = propertiesToText(page.properties);
    const bodyText = await getBlocksText(page.id);
    const combined = [propText, bodyText].filter(Boolean).join("\n");
    if (combined.trim()) sections.push(combined);
  }

  return sections.join("\n\n---\n\n");
}
