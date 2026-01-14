// Read file as ArrayBuffer in the main thread
async function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result));
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function runGSOperation(operation, data) {
  const worker = new Worker(new URL("./background-worker.js", import.meta.url), { type: "module" });

  worker.postMessage({
    data: { operation, ...data },
    target: "wasm",
  });

  return new Promise((resolve, reject) => {
    const listener = (e) => {
      resolve(e.data);
      worker.removeEventListener("message", listener);
      setTimeout(() => worker.terminate(), 0);
    };
    worker.addEventListener("message", listener);

    worker.addEventListener("error", (e) => {
      console.error("Worker error:", e);
      reject(e);
      worker.terminate();
    });
  });
}

// Compress a single PDF - now accepts File object directly
export async function compressPDF(file, quality = 2) {
  const fileData = await readFileAsArrayBuffer(file);
  return runGSOperation("compress", { fileData, quality });
}

// Merge multiple PDFs - now accepts File objects directly
export async function mergePDFs(files, enableCompression = true, quality = 2) {
  const filesData = await Promise.all(
    files.map(async (f) => ({
      data: await readFileAsArrayBuffer(f.file || f),
      name: (f.file || f).name,
    }))
  );
  return runGSOperation("merge", { filesData, enableCompression, quality });
}

// Split PDF into individual pages - now accepts File object directly
export async function splitPDF(file) {
  const fileData = await readFileAsArrayBuffer(file);
  return runGSOperation("split", { fileData, fileName: file.name });
}

// Extract a range of pages from PDF
export async function extractPages(file, firstPage, lastPage) {
  const fileData = await readFileAsArrayBuffer(file);
  return runGSOperation("extractPages", { fileData, firstPage, lastPage });
}

// Convert PDF to Grayscale
export async function grayscalePDF(file) {
  const fileData = await readFileAsArrayBuffer(file);
  return runGSOperation("grayscale", { fileData });
}

// Resize PDF pages
export async function resizePDF(file, paperSize) {
  const fileData = await readFileAsArrayBuffer(file);
  return runGSOperation("resize", { fileData, paperSize });
}

// Get page count from PDF - runs in background with cancellation support
export async function getPageCount(file, signal) {
  const fileData = await readFileAsArrayBuffer(file);

  const worker = new Worker(new URL("./background-worker.js", import.meta.url), { type: "module" });

  worker.postMessage({
    data: { operation: "getPageCount", fileData },
    target: "wasm",
  });

  return new Promise((resolve, reject) => {
    // Handle abort signal for cancellation
    if (signal) {
      signal.addEventListener("abort", () => {
        worker.terminate();
        reject(new DOMException("Page count detection aborted", "AbortError"));
      });
    }

    const listener = (e) => {
      resolve(e.data);
      worker.removeEventListener("message", listener);
      setTimeout(() => worker.terminate(), 0);
    };
    worker.addEventListener("message", listener);

    worker.addEventListener("error", (e) => {
      console.error("Worker error:", e);
      reject(e);
      worker.terminate();
    });
  });
}

// Legacy support
export async function _GSPS2PDF(dataStruct) {
  const worker = new Worker(new URL("./background-worker.js", import.meta.url), { type: "module" });
  worker.postMessage({ data: dataStruct, target: "wasm" });
  return new Promise((resolve, reject) => {
    const listener = (e) => {
      resolve(e.data);
      worker.removeEventListener("message", listener);
      setTimeout(() => worker.terminate(), 0);
    };
    worker.addEventListener("message", listener);
  });
}
