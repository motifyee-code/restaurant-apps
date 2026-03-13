const fs = require("fs");
const path = require("path");

function readUtf8(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeUtf8(filePath, contents) {
  fs.writeFileSync(filePath, contents, "utf8");
}

function buildFrom(entryPath) {
  const includeRe = /@@include\(\"([^\"]+)\"\)/g;

  const expand = (filePath, stack = []) => {
    const abs = path.resolve(filePath);
    if (stack.includes(abs)) {
      throw new Error(`Include cycle:\n${[...stack, abs].join("\n")}`);
    }

    const dir = path.dirname(abs);
    const input = readUtf8(abs);
    return input.replace(includeRe, (_, rel) => {
      const child = path.join(dir, rel);
      return expand(child, [...stack, abs]);
    });
  };

  const banner =
    "<!--\n" +
    "  GENERATED FILE.\n" +
    "  Edit `website/src/*` then run: `node website/build.cjs`\n" +
    "-->\n";

  return banner + expand(entryPath);
}

function main() {
  const entry = path.join(__dirname, "src", "index.html");
  const out = path.join(__dirname, "index.html");
  const html = buildFrom(entry);
  writeUtf8(out, html);
  // eslint-disable-next-line no-console
  console.log(`Built: ${path.relative(process.cwd(), out)}`);
}

main();
