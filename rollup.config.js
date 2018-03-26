import globby from 'globby';

const mainEntry = {
  input: 'src/index.js',
  external: ['events'],
  output: [
    {
      file: 'lib/index.js',
      format: 'cjs'
    }
  ]
};

function globEntries(pattern) {
  return globby.sync('src/' + pattern)
    .map((inputFile) => ({
      input: inputFile,
      output: {
        file: inputFile.replace('src', 'lib'),
        format: 'cjs'
      }
    }));
}

const runnersEntries = globEntries('runners/**/*.js');

const pluginsEntries = globEntries('plugins/**/*.js');

function addCommonProps(entry) {
  return Object.assign({}, entry, {
    watch: {
      exclude: ['node_modules/**']
    }
  });
}

export default [mainEntry].concat(runnersEntries).concat(pluginsEntries).map(addCommonProps);
