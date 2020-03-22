const helper = require('./helper')

const ROOT_DIR = './.gh-pages'

let list = {
  all: [],
  countries: {},
///  languages: {}  categories: {}
}

function main() {
  console.log(`Parsing index...`)
  parseIndex()
  console.log('Creating root directory...')
  createRootDirectory()
  console.log('Creating .nojekyll...')
  createNoJekyllFile()
  console.log('Generating index.m3u...')
  generateIndex()
  console.log('Generating index.country.m3u...')
  generateCountryIndex()
  console.log('Generating /countries...')
  generateCountries()
  console.log('Done.\n')

  console.log(`Countries: ${Object.values(list.countries).length}}. Channels: ${list.all.length}.`)
}

function createRootDirectory() {
  helper.createDir(ROOT_DIR)
}

function createNoJekyllFile() {
  helper.createFile(`${ROOT_DIR}/.nojekyll`)
}

function parseIndex() {
  const root = helper.parsePlaylist('index.m3u')

  let countries = {}
//  let languages = {}
//  let categories = {}

  for(let rootItem of root.items) {
    const playlist = helper.parsePlaylist(rootItem.url)
    const countryCode = helper.getBasename(rootItem.url).toLowerCase()
    const countryName = rootItem.name

    for(let item of playlist.items) {
      const channel = helper.createChannel(item)
      channel.countryCode = countryCode
      channel.countryName = countryName
      channel.epg = playlist.header.attrs['x-tvg-url'] || ''

      // all
      list.all.push(channel)

      // country
      if(!countries[countryCode]) {
        countries[countryCode] = []
      }
      countries[countryCode].push(channel)

   
    }
  }

  list.countries = countries
  
}

function generateIndex() {
  const filename = `${ROOT_DIR}/index.m3u`
  helper.createFile(filename, '#EXTM3U\n')

  const channels = helper.sortBy(list.all, ['title', 'url'])
  for(let channel of channels) {
    helper.appendToFile(filename, channel.toString())
  }
}

function generateCountryIndex() {
  const filename = `${ROOT_DIR}/index.country.m3u`
  helper.createFile(filename, '#EXTM3U\n')

  const channels = helper.sortBy(list.all, ['countryName', 'title', 'url'])
  for(let channel of channels) {
    const group = channel.group
    channel.group = channel.countryName
    helper.appendToFile(filename, channel.toString())
    channel.group = group
  }
}


function generateCountries() {
  const outputDir = `${ROOT_DIR}/countries`
  helper.createDir(outputDir)

  for(let cid in list.countries) {
    let country = list.countries[cid]
    const filename = `${outputDir}/${cid}.m3u`
    helper.createFile(filename, '#EXTM3U\n')

    const channels = helper.sortBy(Object.values(country), ['title', 'url'])
    for(let channel of channels) {
      helper.appendToFile(filename, channel.toString())
    }
  }
}

function generateCategories() {
  const outputDir = `${ROOT_DIR}/categories`
  helper.createDir(outputDir)

  for(let cid in list.categories) {
    let category = list.categories[cid]
    const filename = `${outputDir}/${cid}.m3u`
    helper.createFile(filename, '#EXTM3U\n')

    const channels = helper.sortBy(Object.values(category), ['title', 'url'])
    for(let channel of channels) {
      helper.appendToFile(filename, channel.toString())
    }
  }
}



main()
