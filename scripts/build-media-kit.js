#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const photos = ["alba", "giorno", "tramonto", "notte"].flatMap((phase) =>
  ["jpg", "png"].map((format) => `img/piazza-duomo-${phase}.${format}`),
);
photos.push("img/piazza-duomo-kuhnmi-original.jpg");
const logos = fs.readdirSync(path.join(root, "assets/media-kit/logos"))
  .filter((name) => /\.(svg|png|jpg)$/.test(name))
  .sort()
  .map((name) => `assets/media-kit/logos/${name}`);

for (const file of [...photos, ...logos]) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing media-kit asset: ${file}`);
}

// Build new archives instead of updating ZIPs: retired entries cannot linger.
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "icaif-media-kit-"));
try {
  for (const [name, files] of [
    ["icaif-2026-hero-images.zip", photos],
    ["icaif-2026-media-kit.zip", [...logos, ...photos]],
  ]) {
    const archive = path.join(temp, name);
    execFileSync("zip", ["-j", "-q", archive, ...files], { cwd: root });
    execFileSync("unzip", ["-t", archive]);
    fs.copyFileSync(archive, path.join(root, "assets/media-kit/downloads", name));
    fs.unlinkSync(archive);
    console.log(`${name}: ${files.length} files`);
  }
} finally {
  // This directory was created exclusively by this invocation.
  fs.rmSync(temp, { recursive: true, force: true });
}
