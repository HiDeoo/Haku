const lintStagedConfig = {
  '**/*': 'prettier --write --ignore-unknown',
  '**/*.ts?(x)': (fileNames) =>
    `next lint --file ${fileNames.map((file) => file.split(process.cwd())[1]).join(' --file ')}`,
}

export default lintStagedConfig
