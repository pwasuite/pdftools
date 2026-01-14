function loadScript() {
  import("./gs-worker.js");
}

var Module;

// Quality settings mapping
const QUALITY_SETTINGS = {
  1: "/screen", // Lowest quality, smallest size
  2: "/ebook", // Default - good balance
  3: "/printer", // Higher quality
  4: "/prepress", // Highest quality, largest size
};

function runGhostscript(inputFiles, gsArguments, outputPattern, callback) {
  // inputFiles is now an array of { name, data } where data is Uint8Array

  Module = {
    preRun: [
      function () {
        // Write all input files to the virtual filesystem
        inputFiles.forEach((file) => {
          self.Module.FS.writeFile(file.name, file.data);
        });
      },
    ],
    postRun: [
      function () {
        // Collect output files matching the pattern
        const outputs = [];

        // Check for numbered outputs (split operation)
        if (outputPattern.includes("%")) {
          let pageNum = 1;
          while (true) {
            // Support both %d (simple) and %04d (zero-padded) patterns
            let filename;
            if (outputPattern.includes("%04d")) {
              filename = outputPattern.replace("%04d", String(pageNum).padStart(4, "0"));
            } else if (outputPattern.includes("%03d")) {
              filename = outputPattern.replace("%03d", String(pageNum).padStart(3, "0"));
            } else {
              filename = outputPattern.replace("%d", pageNum);
            }
            try {
              const data = self.Module.FS.readFile(filename, { encoding: "binary" });
              outputs.push({ name: filename, data: data });
              pageNum++;
            } catch (e) {
              break; // No more files
            }
          }
        } else {
          // Single output file
          try {
            const data = self.Module.FS.readFile(outputPattern, { encoding: "binary" });
            outputs.push({ name: outputPattern, data: data });
          } catch (e) {
            console.error("Error reading output file:", e);
          }
        }

        // Convert output data to plain arrays for transfer
        const results = outputs.map((out) => ({
          name: out.name,
          data: Array.from(out.data),
        }));

        callback({ outputs: results });
      },
    ],
    arguments: gsArguments,
    print: function (text) {
      console.log("GS:", text);
    },
    printErr: function (text) {
      console.error("GS Error:", text);
    },
    totalDependencies: 0,
    noExitRuntime: 1,
  };

  if (!self.Module) {
    self.Module = Module;
    loadScript();
  } else {
    self.Module["calledRun"] = false;
    self.Module["postRun"] = Module.postRun;
    self.Module["preRun"] = Module.preRun;
    self.Module["arguments"] = gsArguments;
    self.Module.callMain(gsArguments);
  }
}

function handleCompress(data, callback) {
  const qualitySetting = QUALITY_SETTINGS[data.quality] || "/ebook";

  const args = [
    "-sDEVICE=pdfwrite",
    "-dCompatibilityLevel=1.4",
    `-dPDFSETTINGS=${qualitySetting}`,
    "-dNOPAUSE",
    "-dQUIET",
    "-dBATCH",
    "-sOutputFile=output.pdf",
    "input.pdf",
  ];

  // data.fileData is already a Uint8Array
  runGhostscript(
    [{ name: "input.pdf", data: new Uint8Array(data.fileData) }],
    args,
    "output.pdf",
    callback
  );
}

function handleMerge(data, callback) {
  // data.filesData is an array of { name, data } objects
  const inputFiles = data.filesData.map((file, index) => ({
    name: `input${index}.pdf`,
    data: new Uint8Array(file.data),
  }));

  const inputNames = inputFiles.map((f) => f.name);

  let args = [
    "-sDEVICE=pdfwrite",
    "-dCompatibilityLevel=1.4",
    "-dNOPAUSE",
    "-dQUIET",
    "-dBATCH",
    "-sOutputFile=merged.pdf",
  ];

  // Add compression settings if enabled
  if (data.enableCompression) {
    const qualitySetting = QUALITY_SETTINGS[data.quality] || "/ebook";
    args.push(`-dPDFSETTINGS=${qualitySetting}`);
  }

  args = args.concat(inputNames);

  runGhostscript(inputFiles, args, "merged.pdf", callback);
}

function handleSplit(data, callback) {
  const args = [
    "-sDEVICE=pdfwrite",
    "-dCompatibilityLevel=1.4",
    "-dNOPAUSE",
    "-dQUIET",
    "-dBATCH",
    "-sOutputFile=page_%04d.pdf",
    "input.pdf",
  ];

  runGhostscript(
    [{ name: "input.pdf", data: new Uint8Array(data.fileData) }],
    args,
    "page_%04d.pdf",
    callback
  );
}

function handleExtractPages(data, callback) {
  const { firstPage, lastPage } = data;

  const args = [
    "-sDEVICE=pdfwrite",
    "-dCompatibilityLevel=1.4",
    `-dFirstPage=${firstPage}`,
    `-dLastPage=${lastPage}`,
    "-dNOPAUSE",
    "-dQUIET",
    "-dBATCH",
    "-sOutputFile=extracted.pdf",
    "input.pdf",
  ];

  runGhostscript(
    [{ name: "input.pdf", data: new Uint8Array(data.fileData) }],
    args,
    "extracted.pdf",
    callback
  );
}

// Get page count from PDF using PostScript command
// This uses a specialized approach that captures stdout instead of file output
function handleGetPageCount(data, callback) {
  const inputFiles = [{ name: "input.pdf", data: new Uint8Array(data.fileData) }];

  // PostScript command to open PDF and output page count
  // The command: (input.pdf) (r) file runpdfbegin pdfpagecount = quit
  const gsArguments = [
    "-dNODISPLAY",
    "-dNOPAUSE",
    "-dBATCH",
    "-q",
    "-c",
    "(input.pdf) (r) file runpdfbegin pdfpagecount = quit",
  ];

  let capturedOutput = "";

  Module = {
    preRun: [
      function () {
        inputFiles.forEach((file) => {
          self.Module.FS.writeFile(file.name, file.data);
        });
      },
    ],
    postRun: [
      function () {
        // Parse the captured output to extract page count
        const pageCount = parseInt(capturedOutput.trim(), 10);
        if (!isNaN(pageCount) && pageCount > 0) {
          callback({ pageCount });
        } else {
          callback({ pageCount: null, error: "Could not determine page count" });
        }
      },
    ],
    arguments: gsArguments,
    print: function (text) {
      console.log("GS PageCount:", text);
      capturedOutput += text + "\n";
    },
    printErr: function (text) {
      console.error("GS PageCount Error:", text);
    },
    totalDependencies: 0,
    noExitRuntime: 1,
  };

  if (!self.Module) {
    self.Module = Module;
    loadScript();
  } else {
    self.Module["calledRun"] = false;
    self.Module["postRun"] = Module.postRun;
    self.Module["preRun"] = Module.preRun;
    self.Module["arguments"] = gsArguments;
    // Reset the print handler for this operation
    self.Module["print"] = Module.print;
    self.Module.callMain(gsArguments);
  }
}

self.addEventListener("message", function ({ data: e }) {
  console.log("Worker received message:", e);

  if (e.target !== "wasm") {
    return;
  }

  const messageData = e.data;
  const operation = messageData.operation;

  const sendResponse = (result) => {
    self.postMessage({ operation, ...result });
  };

  switch (operation) {
    case "compress":
      handleCompress(messageData, sendResponse);
      break;
    case "merge":
      handleMerge(messageData, sendResponse);
      break;
    case "split":
      handleSplit(messageData, sendResponse);
      break;

    case "extractPages":
      handleExtractPages(messageData, sendResponse);
      break;
    case "grayscale":
      handleGrayscale(messageData, sendResponse);
      break;
    case "resize":
      handleResize(messageData, sendResponse);
      break;
    case "getPageCount":
      handleGetPageCount(messageData, sendResponse);
      break;
    default:
      console.error("Unknown operation:", operation);
  }
});

function handleResize(data, callback) {
  const paperSize = data.paperSize || "a4";
  const args = [
    "-sDEVICE=pdfwrite",
    "-dCompatibilityLevel=1.4",
    "-dFIXEDMEDIA",
    "-dPDFFitPage",
    `-sPAPERSIZE=${paperSize}`,
    "-dNOPAUSE",
    "-dQUIET",
    "-dBATCH",
    "-sOutputFile=resized.pdf",
    "input.pdf",
  ];

  runGhostscript(
    [{ name: "input.pdf", data: new Uint8Array(data.fileData) }],
    args,
    "resized.pdf",
    callback
  );
}

function handleGrayscale(data, callback) {
  const args = [
    "-sDEVICE=pdfwrite",
    "-dCompatibilityLevel=1.4",
    "-sColorConversionStrategy=Gray",
    "-dProcessColorModel=/DeviceGray",
    "-dNOPAUSE",
    "-dQUIET",
    "-dBATCH",
    "-sOutputFile=grayscale.pdf",
    "input.pdf",
  ];

  runGhostscript(
    [{ name: "input.pdf", data: new Uint8Array(data.fileData) }],
    args,
    "grayscale.pdf",
    callback
  );
}

console.log("PDF Tools Worker ready");
