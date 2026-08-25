const { readFromTable } = require('../lib/readFromTable')

module.exports = (srv, T) => {
    srv.on('READ', 'PNCND_COD_CONCEPTO_AUDIT', (req) =>
        readFromTable(T('pncnd_cod_concepto_audit'), req))
}
