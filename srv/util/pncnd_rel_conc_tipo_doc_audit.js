const { readFromTable } = require('../lib/readFromTable')

module.exports = (srv, T) => {
    srv.on('READ', 'PNCND_REL_CONC_TIPO_DOC_AUDIT', (req) =>
        readFromTable(T('pncnd_rel_conc_tipo_doc_audit'), req))
}
