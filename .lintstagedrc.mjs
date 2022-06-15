const lintStagedConfig = {
  '**/*': 'prettier --write --ignore-unknown --cache',
  '**/*.ts?(x)': (fileNames) =>
    `next lint --max-warnings=0 --file ${fileNames.map((file) => file.split(process.cwd())[1]).join(' --file ')}`,
}

export default lintStagedConfig
