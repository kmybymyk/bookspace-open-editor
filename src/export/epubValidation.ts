import type JSZipType from "jszip";

type EpubPackage = InstanceType<typeof JSZipType>;

export type EpubValidationResult = {
  readonly errors: readonly string[];
};

function hasStoredFirstMimetype(bytes: Uint8Array): boolean {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.byteLength < 58 || view.getUint32(0, true) !== 0x04034b50) {
    return false;
  }
  const compressionMethod = view.getUint16(8, true);
  const fileNameLength = view.getUint16(26, true);
  const extraLength = view.getUint16(28, true);
  const nameStart = 30;
  const nameEnd = nameStart + fileNameLength;
  const contentStart = nameEnd + extraLength;
  const contentEnd = contentStart + "application/epub+zip".length;
  const decoder = new TextDecoder();

  return (
    compressionMethod === 0 &&
    decoder.decode(bytes.slice(nameStart, nameEnd)) === "mimetype" &&
    decoder.decode(bytes.slice(contentStart, contentEnd)) === "application/epub+zip"
  );
}

function parseXml(value: string, label: string, errors: string[]): Document {
  const document = new DOMParser().parseFromString(value, "application/xml");
  if (document.querySelector("parsererror") !== null) {
    errors.push(`${label} XML을 파싱할 수 없습니다.`);
  }
  return document;
}

async function readZipText(zip: EpubPackage, path: string, errors: string[]): Promise<string> {
  const file = zip.file(path);
  if (file === null) {
    errors.push(`${path} 파일이 없습니다.`);
    return "";
  }
  return file.async("string");
}

function blobBytes(blob: Blob): Promise<Uint8Array> {
  if (typeof blob.arrayBuffer === "function") {
    return blob.arrayBuffer().then((buffer) => new Uint8Array(buffer));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("EPUB Blob을 읽을 수 없습니다."));
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result));
        return;
      }
      reject(new Error("EPUB Blob을 바이트로 읽을 수 없습니다."));
    };
    reader.readAsArrayBuffer(blob);
  });
}

export async function validateEpubBlob(blob: Blob): Promise<EpubValidationResult> {
  const errors: string[] = [];
  const bytes = await blobBytes(blob);
  if (!hasStoredFirstMimetype(bytes)) {
    errors.push("mimetype 파일이 EPUB 첫 번째 항목으로 무압축 저장되지 않았습니다.");
  }

  const { default: JSZip } = await import("jszip");
  const zip = await JSZip.loadAsync(blob);
  const container = parseXml(await readZipText(zip, "META-INF/container.xml", errors), "container.xml", errors);
  const rootfile = container.querySelector("rootfile")?.getAttribute("full-path") ?? "";
  if (rootfile !== "OEBPS/content.opf") {
    errors.push("container.xml의 rootfile이 OEBPS/content.opf를 가리키지 않습니다.");
  }

  const opfText = await readZipText(zip, "OEBPS/content.opf", errors);
  const opf = parseXml(opfText, "content.opf", errors);
  const manifestItems = Array.from(opf.querySelectorAll("manifest > item"));
  const manifestById = new Map(manifestItems.map((item) => [item.getAttribute("id") ?? "", item]));
  const nav = manifestItems.find((item) => item.getAttribute("properties") === "nav");
  if (nav === undefined) {
    errors.push("nav 항목이 manifest에 없습니다.");
  }

  for (const item of manifestItems) {
    const href = item.getAttribute("href");
    if (href && zip.file(`OEBPS/${href}`) === null) {
      errors.push(`manifest 참조 파일이 없습니다: ${href}`);
    }
  }

  for (const itemref of Array.from(opf.querySelectorAll("spine > itemref"))) {
    const idref = itemref.getAttribute("idref") ?? "";
    if (!manifestById.has(idref)) {
      errors.push(`spine idref가 manifest에 없습니다: ${idref}`);
    }
  }

  const xhtmlPaths = manifestItems
    .filter((item) => item.getAttribute("media-type") === "application/xhtml+xml")
    .map((item) => item.getAttribute("href"))
    .filter((href): href is string => href !== null);
  for (const href of xhtmlPaths) {
    parseXml(await readZipText(zip, `OEBPS/${href}`, errors), href, errors);
  }

  return { errors };
}
