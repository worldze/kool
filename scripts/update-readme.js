const helper = require('./helper')

let output = {
  countries: [],
 // languages: [],  categories: []
}

function main() {
  console.log(`Parsing index...`)
  parseIndex()
  console.log(`Generating countries table...`)
  generateCountriesTable()
  console.log(`Generating README.md...`)
  generateReadme()
  console.log(`Done.`)
}

function parseIndex() {
  const root = helper.parsePlaylist('index.m3u')

  let countries = {}
 // let languages = {}  let categories = {}
  for(let rootItem of root.items) {
    const playlist = helper.parsePlaylist(rootItem.url)
    const countryName = rootItem.name
    const countryCode = helper.getBasename(rootItem.url).toLowerCase()
    const countryEpg = playlist.header.attrs['x-tvg-url'] ? `<code>${playlist.header.attrs['x-tvg-url']}</code>` : ''

    for(let item of playlist.items) {
      
      // countries
      if(countries[countryCode]) { 
        countries[countryCode].channels++
      } else {
        countries[countryCode] = { 
          country: countryName, 
          channels: 1, 
          playlist: `<code>https://worldze.github.io/Nu/countries/${countryCode}.m3u</code>`, 
          epg: countryEpg
        }
      }

    
      }
    }
  }

  output.countries = Object.values(countries)
 // output.languages = Object.values(languages)  output.categories = Object.values(categories)
}

function generateCountriesTable() {
  const table = helper.generateTable(output.countries, {
    columns: [
      { name: 'Country', align: 'left' },
      { name: 'Channels', align: 'right' },
      { name: 'Playlist', align: 'left', nowrap: true },
      { name: 'EPG', align: 'left' }
    ]
  })

  helper.createFile('./.readme/_countries.md', table)
}



function generateReadme() {
  helper.compileMarkdown('../.readme/config.json')
}

main()
