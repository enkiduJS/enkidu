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

const pluginsEntries = globby.sync('src/plugins/**/*.js')
  .map((inputFile) => ({
    input: inputFile,
    output: {
      file: inputFile.replace('src', 'lib'),
      format: 'cjs'
    }
  }));

function addCommonProps(entry) {
  return Object.assign({}, entry, {
    watch: {
      exclude: ['node_modules/**']
    }
  });
}

export default [mainEntry].concat(pluginsEntries).map(addCommonProps);
