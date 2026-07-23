const { readFromTable } = require('../lib/readFromTable')

module.exports = (srv, T) => {
    srv.on('READ', 'PNCND_TIPOS_APROB', (req) =>
        readFromTable(T('pncnd_tipos_aprob'), req))
}
