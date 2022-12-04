import downloadLib from "downloadjs";

export default function download(file: Blob, filename: string) {
  downloadLib(file, filename);
}