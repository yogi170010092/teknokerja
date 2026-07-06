import { defineMcp } from "@lovable.dev/mcp-js";
import listLaptops from "./tools/list-laptops";
import getLaptop from "./tools/get-laptop";
import listArticles from "./tools/list-articles";
import getArticle from "./tools/get-article";
import getContactInfo from "./tools/get-contact-info";

export default defineMcp({
  name: "teknokerja-mcp",
  title: "TeknoKerja Bali — Laptop Rental",
  version: "0.1.0",
  instructions:
    "Tools for TeknoKerja, a laptop rental service in Bali. Use `list_laptops` to browse the current rental inventory (daily/weekly/monthly IDR pricing), `get_laptop` for full specs of one unit, `list_articles`/`get_article` for blog content in English/Indonesian/Russian/Chinese, and `get_contact_info` for WhatsApp and address. All tools are read-only.",
  tools: [listLaptops, getLaptop, listArticles, getArticle, getContactInfo],
});
