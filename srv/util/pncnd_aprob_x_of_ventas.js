const { readFromTable }     = require('../lib/readFromTable')
const { registrarAuditoria } = require('./auditoria')

module.exports = (srv, T) => {

    srv.on('READ', 'PNCND_APROB_X_OF_VENTAS', (req) => readFromTable(T('pncnd_aprob_x_of_ventas'), req))

    srv.on('CREATE', 'PNCND_APROB_X_OF_VENTAS', async (req) => {
        const { vkorg, vtweg, spart, id_tipo_aprob, nivel, vkbur, bran2, mail } = req.data
        const db = await cds.connect.to('db')
        await db.run(
            `INSERT INTO ${T('pncnd_aprob_x_of_ventas')}
                (vkorg, vtweg, spart, id_tipo_aprob, nivel, vkbur, bran2, mail)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [vkorg, vtweg, spart, id_tipo_aprob, nivel, vkbur, bran2, mail]
        )
        return req.data
    })

    srv.on('UPDATE', 'PNCND_APROB_X_OF_VENTAS', async (req) => {
        const { vkorg, vtweg, spart, id_tipo_aprob, nivel, vkbur, bran2, mail } = req.data
        const db = await cds.connect.to('db')
        await db.run(
            `UPDATE ${T('pncnd_aprob_x_of_ventas')}
             SET mail = $1
             WHERE vkorg = $2 AND vtweg = $3 AND spart = $4
               AND id_tipo_aprob = $5 AND nivel = $6
               AND vkbur = $7 AND bran2 = $8`,
            [mail, vkorg, vtweg, spart, id_tipo_aprob, nivel, vkbur, bran2]
        )
        return req.data
    })

    srv.on('DELETE', 'PNCND_APROB_X_OF_VENTAS', async (req) => {
        const { vkorg, vtweg, spart, id_tipo_aprob, nivel, vkbur, bran2 } = req.data
        const db = await cds.connect.to('db')
        await db.run(
            `DELETE FROM ${T('pncnd_aprob_x_of_ventas')}
             WHERE vkorg = $1 AND vtweg = $2 AND spart = $3
               AND id_tipo_aprob = $4 AND nivel = $5
               AND vkbur = $6 AND bran2 = $7`,
            [vkorg, vtweg, spart, id_tipo_aprob, nivel, vkbur, bran2]
        )
        return req.data
    })

    registrarAuditoria(srv, {
        entidad     : 'PNCND_APROB_X_OF_VENTAS',
        tablaFuente : T('pncnd_aprob_x_of_ventas'),
        tablaAudit  : T('pncnd_aprob_x_of_ventas_audit'),
        claves      : ['vkorg', 'vtweg', 'spart', 'id_tipo_aprob', 'nivel', 'vkbur', 'bran2'],
        campos      : ['vkorg', 'vtweg', 'spart', 'id_tipo_aprob', 'nivel', 'vkbur', 'bran2', 'mail']
    })
}
