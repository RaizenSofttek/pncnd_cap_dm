const { readFromTable }     = require('../lib/readFromTable')
const { registrarAuditoria } = require('./auditoria')

module.exports = (srv, T) => {
    srv.on('READ', 'PNCND_COD_CONCEPTO', (req) =>
        readFromTable(T('pncnd_cod_concepto'), req))

    srv.on('CREATE', 'PNCND_COD_CONCEPTO', async (req) => {
        const { cod_concepto, descripcion } = req.data
        const db = await cds.connect.to('db')
        try {
            await db.run(
                `INSERT INTO ${T('pncnd_cod_concepto')} (cod_concepto, descripcion) VALUES ($1, $2)`,
                [cod_concepto, descripcion ?? null]
            )
        } catch (e) {
            if (e.code === '23505')
                return req.error(409, `Clave duplicada: ya existe el concepto '${cod_concepto}'`)
            throw e
        }
        return req.data
    })

    srv.on('UPDATE', 'PNCND_COD_CONCEPTO', async (req) => {
        const { cod_concepto, descripcion } = req.data
        const db = await cds.connect.to('db')
        await db.run(
            `UPDATE ${T('pncnd_cod_concepto')} SET descripcion=$1 WHERE cod_concepto=$2`,
            [descripcion ?? null, cod_concepto]
        )
        return req.data
    })

    srv.on('DELETE', 'PNCND_COD_CONCEPTO', async (req) => {
        const { cod_concepto } = req.data
        const db = await cds.connect.to('db')
        await db.run(
            `DELETE FROM ${T('pncnd_cod_concepto')} WHERE cod_concepto=$1`,
            [cod_concepto]
        )
        return req.data
    })

    registrarAuditoria(srv, {
        entidad     : 'PNCND_COD_CONCEPTO',
        tablaFuente : T('pncnd_cod_concepto'),
        tablaAudit  : T('pncnd_cod_concepto_audit'),
        claves      : ['cod_concepto'],
        campos      : ['cod_concepto', 'descripcion']
    })
}
