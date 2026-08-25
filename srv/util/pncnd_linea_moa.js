const { readFromTable } = require('../lib/readFromTable')

module.exports = (srv, T) => {
    srv.on('READ', 'PNCND_LINEA_MOA', (req) =>
        readFromTable(T('pncnd_linea_moa'), req))
}
