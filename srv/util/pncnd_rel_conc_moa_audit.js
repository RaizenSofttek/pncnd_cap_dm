const { readFromTable } = require('../lib/readFromTable')

module.exports = (srv, T) => {
    srv.on('READ', 'PNCND_REL_CONC_MOA_AUDIT', (req) =>
        readFromTable(T('pncnd_rel_conc_moa_audit'), req))
}
