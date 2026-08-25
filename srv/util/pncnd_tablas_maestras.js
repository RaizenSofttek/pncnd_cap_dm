const { readFromTable } = require('../lib/readFromTable')

module.exports = (srv, T) => {

    srv.on('READ', 'PNCND_TABLAS_MAESTRAS', (req) => readFromTable(T('pncnd_tablas_maestras'), req))
}
