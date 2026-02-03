const { exec } = require("child_process");
const os = require("os");
const path = require("path");

let nodelibpath;
exec("npm root -g", (error, stdout) => {
  if (!error) {
    nodelibpath = path.normalize(stdout.split(os.EOL)[0]);
  }
});

/**
 *  Build an array of resolved paths from a directory string.
 *  Handles absolute paths, relative paths (resolved against project dirs), and ~ paths.
 */
function buildPaths(directory, projectpaths, patharray = []) {
  if (!directory) {
    return patharray;
  } else if (!path.isAbsolute(directory)) {
    if (!directory.startsWith("~")) {
      projectpaths = projectpaths || [];
      const dirs = projectpaths.map((projectdir) => {
        return path.resolve(projectdir, directory);
      });
      if (dirs.length > 0) {
        patharray.push(...dirs);
      }
    } else {
      patharray.push(path.resolve(os.homedir(), directory.replace("~", ".")));
    }
  } else {
    patharray.push(path.resolve(directory));
  }
  return patharray;
}

/**
 *  Build an array of absolute paths to locate custom linter rules.
 */
function buildRulePaths(directories, projectpaths) {
  const rulepaths = [];
  directories = directories || [];
  projectpaths = projectpaths || [];
  directories.forEach((directory) => {
    buildPaths(directory, projectpaths, rulepaths);
  });
  return rulepaths;
}

/**
 *  Build an absolute filepath to an .eslintrc.* configuration file.
 */
function buildConfigFilePath(filepath, projectpath) {
  if (filepath && projectpath) {
    const paths = buildPaths(filepath, [projectpath]);
    return paths.length > 0 ? paths[0] : null;
  }
  return null;
}

/**
 *  Select the best matching project directory for a file path.
 */
function getProjectPath(filepath = "/", directories = []) {
  if (directories.length !== 1) {
    directories = directories.filter((directory) => {
      return filepath.startsWith(directory.path);
    });

    const result = directories.reduce((accumulator, directory) => {
      return accumulator.length > directory.path.length
        ? accumulator
        : directory.path;
    }, "");

    return result === "" ? path.dirname(filepath) : result;
  }
  return directories[0].path;
}

module.exports = {
  buildConfigFilePath,
  buildPaths,
  buildRulePaths,
  getProjectPath,
  get nodelibpath() {
    return nodelibpath;
  },
};
