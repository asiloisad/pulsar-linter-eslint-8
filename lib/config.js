const fs = require("fs");
const path = require("path");
const lint = require("./lint");

const CONFIG_FILENAME = "eslint-8.default.js";

const DEFAULT_CONTENT = `\
/**
 *  Default ESLint configuration.
 *  Used as baseConfig for all projects. Project .eslintrc.* files
 *  will extend/override these settings.
 *
 *  @see https://eslint.org/docs/latest/use/configure/
 */
module.exports = {
  // extends: ["eslint:recommended"],
  // env: {},
  // rules: {},
};
`;

const context = {
  resetEngine: false,
  configPath: null,
};

/**
 *  Returns the path to the config file in Pulsar's config directory.
 */
function getConfigPath() {
  if (!context.configPath) {
    context.configPath = path.join(atom.getConfigDirPath(), CONFIG_FILENAME);
  }
  return context.configPath;
}

/**
 *  Load the baseConfig from the user's config file.
 *  Returns empty config if file doesn't exist.
 */
function loadBaseConfig() {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) {
    return {};
  }
  try {
    delete require.cache[require.resolve(configPath)];
    return require(configPath);
  } catch (error) {
    console.log("linter-eslint-8: error loading config", error);
    return {};
  }
}

/**
 *  Returns ESLint constructor options.
 */
function getOptions(atom, filepath, engine) {
  return new Promise((resolve) => {
    const resetEngine = context.resetEngine;
    context.resetEngine = false;

    if (resetEngine || atom.project.rootDirectories.length > 1 || !engine) {
      resolve({ baseConfig: loadBaseConfig() });
    } else {
      resolve(undefined);
    }
  });
}

/**
 *  Open the config file in the editor. Creates it if it doesn't exist.
 */
function openConfig() {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, DEFAULT_CONTENT, "utf8");
  }
  atom.workspace.open(configPath);
}

/**
 *  Setup option handling on package activation.
 */
function onActivate(atom, config, emitter, disposables) {
  if (!config.packagename) {
    throw Error("Missing packagename");
  }
  const grammarKey = config.packagename + ".grammarScopes";

  disposables.add(
    emitter,
    atom.project.onDidChangePaths(() => {
      context.resetEngine = true;
      emitter.emit("should-lint", config.grammarScopes);
    }),
    atom.config.observe(grammarKey, (grammar) => {
      config.grammarScopes = grammar;
      emitter.emit("should-lint", config.grammarScopes);
    })
  );
  emitter.on("should-lint", lint.triggerReLint);
}

Object.assign(module.exports, { getOptions, onActivate, openConfig });
