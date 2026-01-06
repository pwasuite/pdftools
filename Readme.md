# pwasuite/pdftools, repository of pdf.pwasuite.com

**Try it: [PDF Tools right into the browser](https://pdf.pwasuite.com/)**

## Context

This project is another usage of the `gs.wasm` that [@ochachacha](https://github.com/ochachacha) compiled.
It is based on a fork of [Laurent Meyer's demo](https://github.com/laurentmmeyer/ghostscript-pdf-compress.wasm) of PDF compression right into the browser.

It provides many tools for PDF manipulation, right into the browser:
* compression/minfication
* merge multiple PDF files into one
* split PDF into individual pages
* extract page ranges
* convert PDF to grayscale
* change page size

It applies ghostscript commands such as:

```
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile=output.pdf input.pdf
```

Exact command varies based on user input and use case.

## WebWorker

The compression is processed in a webworker so that the main thread doesn't become unresponsive and there is virtually no limit to the size of the PDF that you can compress :tada:  

## Run the project

To run the project, simply do the following steps

```bash
git clone git@github.com:laurentmmeyer/ghostscript-pdf-compress.wasm.git
cd ghostscript-pdf-compress.wasm
yarn
yarn dev
```

## Try it online

[https://pdf.pwasuite.com/](https://pdf.pwasuite.com/)

