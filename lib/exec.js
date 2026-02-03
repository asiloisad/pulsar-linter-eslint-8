const { Range } = require("atom");
const config = require("./config");

let ESLint;
function getESLint() {
  if (!ESLint) {
    ESLint = require("eslint").ESLint;
  }
  return ESLint;
}

/**
 *  Generate a range for a lint message position.
 *  @param  {TextEditor}  textEditor
 *  @param  {number}      line    - 0-indexed line number
 *  @param  {number}      column  - 0-indexed column number (optional)
 *  @return {Array}       Range as [[lineStart, colStart], [lineEnd, colEnd]]
 */
function generateRange(textEditor, line, column) {
  const buffer = textEditor.getBuffer();
  const lineMax = buffer.getLineCount() - 1;
  const lineNumber = Math.max(0, Math.min(line, lineMax));
  const lineText = buffer.lineForRow(lineNumber) || "";
  const colEnd = lineText.length;
  let colStart = typeof column === "number" && column > -1 ? column : 0;

  if (colStart > colEnd) {
    colStart = colEnd;
  }

  return [[lineNumber, colStart], [lineNumber, colEnd]];
}

let engine;

function resetEngine() {
  engine = undefined;
}

/**
 *  Lint a single file using ESLint.
 *  @see [ESLint.lintText](https://eslint.org/docs/developer-guide/nodejs-api#-eslintlinttextcode-options)
 */
function exec(filepath, filetext) {
  return config
    .getOptions(atom, filepath, engine)
    .then((options) => {
      if (options) {
        engine = new (getESLint())(options);
      }
      return engine;
    })
    .then((engine) => {
      return engine.lintText(filetext, { filePath: filepath }).then((result) => {
        return { results: result };
      });
    })
    .catch((error) => {
      const msg = String(error.message || error);
      // Silently ignore "no config found" errors — project has no ESLint setup.
      if (msg.includes("No ESLint configuration found") || msg.includes("no-config-found")) {
        return { results: [{ messages: [] }] };
      }
      console.log("*** error ***", error);
      return {
        results: [
          { messages: [{ line: 1, message: error, ruleId: NaN, severity: 2 }] },
        ],
      };
    });
}

/**
 *  Handle the report returned by a linter run.
 */
function handle(texteditor, report) {
  if (!report || !report.results || !report.results.length) {
    return [];
  }

  return report.results[0].messages.map(
    ({ column = 1, line, message, ruleId, severity, fix }) => {
      const fileBuffer = texteditor.getBuffer();
      const lineLength = fileBuffer.lineLengthForRow(line - 1);
      const colStart = column - 1 > lineLength ? lineLength + 1 : column;
      const position = generateRange(texteditor, line - 1, colStart - 1);
      const file = texteditor.getPath();

      return {
        severity: severity === 1 ? "warning" : "error",
        excerpt: `${ruleId || "fatal"}: ${message}`,
        solutions: fix
          ? [
              {
                position: new Range(
                  fileBuffer.positionForCharacterIndex(fix.range[0]),
                  fileBuffer.positionForCharacterIndex(fix.range[1])
                ),
                replaceWith: fix.text,
              },
            ]
          : null,
        location: { file, position },
      };
    }
  );
}

Object.assign(module.exports, { exec, handle, resetEngine });
