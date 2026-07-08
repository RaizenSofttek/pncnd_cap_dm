const cds   = require('@sap/cds')
const proxy = require('@cap-js-community/odata-v2-adapter')
const fs    = require('fs')
const path  = require('path')

// @cap-js/postgres pasa ssl.ca directamente a pg.Client, que lo envía a
// tls.connect(). Node TLS espera el contenido del cert, no un file path.
// Si ca es un path relativo, lo resolvemos aquí antes de que el pool arranque.
const ssl = cds.env.requires?.db?.credentials?.ssl
if (ssl?.ca && typeof ssl.ca === 'string' && !ssl.ca.trimStart().startsWith('-----BEGIN')) {
    ssl.ca = fs.readFileSync(path.resolve(process.cwd(), ssl.ca), 'utf8')
}

cds.on('bootstrap', app => {
    app.use(proxy())
    console.log('OData V2 proxy habilitado')
})

module.exports = cds.server
