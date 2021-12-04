const lintStagedConfig = {
  '**/*': 'prettier --write --ignore-unknown',
  '**/*.ts?(x)': (filenames) =>
    `next lint --file ${filenames.map((file) => file.split(process.cwd())[1]).join(' --file ')}`,
}

export default lintStagedConfig
