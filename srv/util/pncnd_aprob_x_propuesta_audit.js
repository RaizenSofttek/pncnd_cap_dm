const { readFromTable } = require('../lib/readFromTable')

module.exports = (srv, T) => {
    srv.on('READ', 'PNCND_APROB_X_PROPUESTA_AUDIT', (req) =>
        readFromTable(T('pncnd_aprob_x_propuesta_audit'), req))
}
