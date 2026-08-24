const { readFromTable } = require('../lib/readFromTable')

module.exports = (srv, T) => {

    srv.on('READ', 'PNCND_REL_CONC_MOA', (req) => readFromTable(T('pncnd_rel_conc_moa'), req))

    srv.on('CREATE', 'PNCND_REL_CONC_MOA', async (req) => {
        const { cod_concepto, id_tipo_op, linea_moa, nombre, clasificacion } = req.data
        const db = await cds.connect.to('db')
        try {
            await db.run(
                `INSERT INTO ${T('pncnd_rel_conc_moa')} (cod_concepto, id_tipo_op, linea_moa, nombre, clasificacion)
                 VALUES ($1, $2, $3, $4, $5)`,
                [cod_concepto, id_tipo_op, linea_moa, nombre ?? null, clasificacion ?? null]
            )
        } catch (e) {
            if (e.code === '23505')
                return req.error(409, `Clave duplicada: ya existe (${cod_concepto}/${id_tipo_op}/${linea_moa})`)
            throw e
        }
        return req.data
    })

    srv.on('UPDATE', 'PNCND_REL_CONC_MOA', async (req) => {
        const { cod_concepto, id_tipo_op, linea_moa, nombre, clasificacion } = req.data
        const db = await cds.connect.to('db')
        await db.run(
            `UPDATE ${T('pncnd_rel_conc_moa')}
             SET nombre        = $1,
                 clasificacion = $2
             WHERE cod_concepto = $3 AND id_tipo_op = $4 AND linea_moa = $5`,
            [nombre ?? null, clasificacion ?? null, cod_concepto, id_tipo_op, linea_moa]
        )
        return req.data
    })

    srv.on('DELETE', 'PNCND_REL_CONC_MOA', async (req) => {
        const { cod_concepto, id_tipo_op, linea_moa } = req.data
        const db = await cds.connect.to('db')
        await db.run(
            `DELETE FROM ${T('pncnd_rel_conc_moa')}
             WHERE cod_concepto = $1 AND id_tipo_op = $2 AND linea_moa = $3`,
            [cod_concepto, id_tipo_op, linea_moa]
        )
        return req.data
    })
}
