const { readFromTable }     = require('../lib/readFromTable')
const { registrarAuditoria } = require('./auditoria')

module.exports = (srv, T) => {

    srv.on('READ', 'PNCND_REL_CONC_TIPO_DOC', (req) => readFromTable(T('pncnd_rel_conc_tipo_doc'), req))

    srv.on('CREATE', 'PNCND_REL_CONC_TIPO_DOC', async (req) => {
        const { cod_concepto, id_tipo_op, id_tipo_doc, linea_moa } = req.data
        const db = await cds.connect.to('db')
        try {
            await db.run(
                `INSERT INTO ${T('pncnd_rel_conc_tipo_doc')} (cod_concepto, id_tipo_op, id_tipo_doc, linea_moa)
                 VALUES ($1, $2, $3, $4)`,
                [cod_concepto, id_tipo_op, id_tipo_doc, linea_moa]
            )
        } catch (e) {
            if (e.code === '23505')
                return req.error(409, `Clave duplicada: ya existe (${cod_concepto}/${id_tipo_op}/${id_tipo_doc}/${linea_moa})`)
            throw e
        }
        return req.data
    })

    srv.on('DELETE', 'PNCND_REL_CONC_TIPO_DOC', async (req) => {
        const { cod_concepto, id_tipo_op, id_tipo_doc, linea_moa } = req.data
        const db = await cds.connect.to('db')
        await db.run(
            `DELETE FROM ${T('pncnd_rel_conc_tipo_doc')}
             WHERE cod_concepto = $1 AND id_tipo_op = $2 AND id_tipo_doc = $3 AND linea_moa = $4`,
            [cod_concepto, id_tipo_op, id_tipo_doc, linea_moa]
        )
        return req.data
    })

    registrarAuditoria(srv, {
        entidad     : 'PNCND_REL_CONC_TIPO_DOC',
        tablaFuente : T('pncnd_rel_conc_tipo_doc'),
        tablaAudit  : T('pncnd_rel_conc_tipo_doc_audit'),
        claves      : ['cod_concepto', 'id_tipo_op', 'id_tipo_doc', 'linea_moa'],
        campos      : ['cod_concepto', 'id_tipo_op', 'id_tipo_doc', 'linea_moa']
    })
}
