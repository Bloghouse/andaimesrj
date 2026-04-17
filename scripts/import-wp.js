import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';

const XML_FILE = './alugueldecaamba.WordPress.2026-04-10 (1).xml';
const OUTPUT_DIR = './src/content/blog';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const xmlData = fs.readFileSync(XML_FILE, 'utf-8');
const parser = new XMLParser({
  ignoreAttributes: false,
  cdataPropName: "__cdata"
});

const jObj = parser.parse(xmlData);
const items = jObj.rss.channel.item;

const postList = Array.isArray(items) ? items : [items];

postList.forEach(item => {
  const postType = item['wp:post_type']?.__cdata || item['wp:post_type'];
  const status = item['wp:status']?.__cdata || item['wp:status'];

  if (postType === 'post' && status === 'publish') {
    const title = item.title?.__cdata || item.title || 'Sem Título';
    const slug = item['wp:post_name']?.__cdata || item['wp:post_name'] || 'sem-slug';
    const date = item['wp:post_date']?.__cdata || item['wp:post_date'] || new Date().toISOString();
    const content = item['content:encoded']?.__cdata || item['content:encoded'] || '';

    const template = `---
title: "${title}"
description: "${title}"
pubDate: ${date.split(' ')[0]}
---

${content}
`;

    fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}.md`), template);
    console.log(`✓ Importado: ${slug}`);
  }
});

console.log('--- Migração concluída ---');
