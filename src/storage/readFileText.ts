const FILE_READ_ERROR_MESSAGE = "프로젝트 파일을 읽을 수 없습니다.";

export function readFileText(file: File): Promise<string> {
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
