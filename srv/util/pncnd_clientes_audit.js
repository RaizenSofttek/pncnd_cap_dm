const { readFromTable } = require('../lib/readFromTable')

module.exports = (srv, T) => {
    srv.on('READ', 'PNCND_CLIENTES_AUDIT', (req) =>
        readFromTable(T('pncnd_clientes_audit'), req))
}
