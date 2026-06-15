const FILE_READ_ERROR_MESSAGE = "프로젝트 파일을 읽을 수 없습니다.";

export class FileSizeLimitError extends Error {
  override readonly name = "FileSizeLimitError";

  constructor(readonly maxBytes: number) {
    super(`파일은 ${Math.floor(maxBytes / 1024 / 1024)}MB 이하만 불러올 수 있습니다.`);
  }
}

type ReadFileTextOptions = {
  readonly maxBytes?: number;
};

export function readFileText(file: File, options: ReadFileTextOptions = {}): Promise<string> {
  if (options.maxBytes !== undefined && file.size > options.maxBytes) {
    return Promise.reject(new FileSizeLimitError(options.maxBytes));
  }
  if (typeof file.text === "function") {
    return file.text();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error(FILE_READ_ERROR_MESSAGE));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsText(file);
  });
}
