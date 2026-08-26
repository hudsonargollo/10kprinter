export async function putHtml(bucket: R2Bucket, leadId: string, html: string): Promise<string> {
  const key = `scrapes/${leadId}/page.html`;
  await bucket.put(key, html, { httpMetadata: { contentType: "text/html; charset=utf-8" } });
  return key;
}

export async function putScreenshot(bucket: R2Bucket, leadId: string, screenshot: Uint8Array): Promise<string> {
  const key = `scrapes/${leadId}/screenshot.png`;
  await bucket.put(key, screenshot, { httpMetadata: { contentType: "image/png" } });
  return key;
}

export async function putHeroScreenshot(bucket: R2Bucket, leadId: string, screenshot: Uint8Array): Promise<string> {
  const key = `scrapes/${leadId}/hero.png`;
  await bucket.put(key, screenshot, { httpMetadata: { contentType: "image/png" } });
  return key;
}

export async function putPrdMarkdown(
  bucket: R2Bucket,
  leadId: string,
  vertical: string,
  markdown: string,
): Promise<string> {
  const key = `prds/${leadId}/${vertical}.md`;
  await bucket.put(key, markdown, { httpMetadata: { contentType: "text/markdown; charset=utf-8" } });
  return key;
}

export async function putCoverImage(
  bucket: R2Bucket,
  leadId: string,
  vertical: string,
  image: Uint8Array,
  contentType: string,
): Promise<string> {
  const ext = contentType === "image/png" ? "png" : "jpg";
  const key = `proposals/${leadId}/${vertical}/cover.${ext}`;
  await bucket.put(key, image, { httpMetadata: { contentType } });
  return key;
}

export async function putProposalHtml(
  bucket: R2Bucket,
  leadId: string,
  vertical: string,
  html: string,
): Promise<string> {
  const key = `proposals/${leadId}/${vertical}/proposal.html`;
  await bucket.put(key, html, { httpMetadata: { contentType: "text/html; charset=utf-8" } });
  return key;
}

export async function getScreenshotBase64(bucket: R2Bucket, key: string): Promise<string> {
  const obj = await bucket.get(key);
  if (!obj) throw new Error(`R2 object not found: ${key}`);
  const buf = await obj.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
