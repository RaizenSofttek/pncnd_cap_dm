const { readFromTable }      = require('../lib/readFromTable')
const { registrarAuditoria } = require('./auditoria')

module.exports = (srv, T) => {

    srv.on('READ', 'PNCND_APROBADORES', (req) => readFromTable(T('pncnd_aprobadores'), req))

    srv.on('CREATE', 'PNCND_APROBADORES', async (req) => {
        const { mail, id_tipo_aprob, nombre } = req.data
        const db = await cds.connect.to('db')
        try {
            await db.run(
                `INSERT INTO ${T('pncnd_aprobadores')} (mail, id_tipo_aprob, nombre)
                 VALUES ($1, $2, $3)`,
                [mail, id_tipo_aprob, nombre]
            )
        } catch (e) {
            if (e.code === '23505')
                return req.error(409, `Clave duplicada: ya existe el aprobador '${mail}'`)
            throw e
        }
        return req.data
    })

    srv.on('UPDATE', 'PNCND_APROBADORES', async (req) => {
        const { mail, id_tipo_aprob, nombre } = req.data
        const db = await cds.connect.to('db')
        await db.run(
            `UPDATE ${T('pncnd_aprobadores')}
             SET id_tipo_aprob = $1,
                 nombre        = $2
             WHERE mail = $3`,
            [id_tipo_aprob, nombre, mail]
        )
        return req.data
    })

    srv.on('DELETE', 'PNCND_APROBADORES', async (req) => {
        const { mail } = req.data
        const db = await cds.connect.to('db')
        await db.run(`DELETE FROM ${T('pncnd_aprobadores')} WHERE mail = $1`, [mail])
        return req.data
    })

    // Listo para cuando exista pncnd_aprobadores_audit en PostgreSQL: descomentar.
    // Se deja inactivo a propósito — la auditoría se inserta dentro de la misma
    // transacción que el CRUD, así que apuntar a una tabla inexistente haría
    // fallar todo alta, modificación y baja de aprobadores.
    // registrarAuditoria(srv, {
    //     entidad     : 'PNCND_APROBADORES',
    //     tablaFuente : T('pncnd_aprobadores'),
    //     tablaAudit  : T('pncnd_aprobadores_audit'),
    //     claves      : ['mail'],
    //     campos      : ['mail', 'id_tipo_aprob', 'nombre']
    // })
}
