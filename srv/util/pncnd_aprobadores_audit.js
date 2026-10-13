const { readFromTable } = require('../lib/readFromTable')

module.exports = (srv, T) => {
    srv.on('READ', 'PNCND_APROBADORES_AUDIT', (req) =>
        readFromTable(T('pncnd_aprobadores_audit'), req))
}
