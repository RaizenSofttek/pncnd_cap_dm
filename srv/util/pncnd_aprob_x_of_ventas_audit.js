const { readFromTable } = require('../lib/readFromTable')

module.exports = (srv, T) => {
    srv.on('READ', 'PNCND_APROB_X_OF_VENTAS_AUDIT', (req) =>
        readFromTable(T('pncnd_aprob_x_of_ventas_audit'), req))
}
