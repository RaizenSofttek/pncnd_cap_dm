const { readFromTable } = require('../lib/readFromTable')

module.exports = (srv, T) => {
    srv.on('READ', 'PNCND_TIPO_OPERACION', (req) =>
        readFromTable(T('pncnd_tipo_operacion'), req))
}
