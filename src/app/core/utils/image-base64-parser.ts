export interface ParsedBase64File {
  base64: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export function parseFilesToBase64(
  input: File | FileList
): Promise<ParsedBase64File[]> {
  const files = input instanceof FileList ? Array.from(input) : [input];

  return Promise.all(
    files.map(
      (file) =>
        new Promise<ParsedBase64File>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              base64: reader.result as string,
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
            });
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        })
    )
  );
}
