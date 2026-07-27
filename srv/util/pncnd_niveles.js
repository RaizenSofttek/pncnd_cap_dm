const { readFromTable } = require('../lib/readFromTable')

module.exports = (srv, T) => {
    srv.on('READ', 'PNCND_NIVELES', (req) =>
        readFromTable(T('pncnd_niveles'), req))
}
