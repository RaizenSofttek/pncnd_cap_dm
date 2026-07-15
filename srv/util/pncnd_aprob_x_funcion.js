const { readFromTable } = require('../lib/readFromTable')

module.exports = (srv, T) => {

    srv.on('READ', 'PNCND_APROB_X_FUNCION', (req) => readFromTable(T('pncnd_aprob_x_funcion'), req))

    srv.on('CREATE', 'PNCND_APROB_X_FUNCION', async (req) => {
        const { cod_concepto, id_tipo_aprob, nivel, mail } = req.data
        const db = await cds.connect.to('db')
        await db.run(
            `INSERT INTO ${T('pncnd_aprob_x_funcion')} (cod_concepto, id_tipo_aprob, nivel, mail)
             VALUES ($1, $2, $3, $4)`,
            [cod_concepto, id_tipo_aprob, nivel, mail]
        )
        return req.data
    })

    srv.on('UPDATE', 'PNCND_APROB_X_FUNCION', async (req) => {
        const { cod_concepto, id_tipo_aprob, nivel, mail } = req.data
        const db = await cds.connect.to('db')
        await db.run(
            `UPDATE ${T('pncnd_aprob_x_funcion')}
             SET mail = $1
             WHERE cod_concepto = $2 AND id_tipo_aprob = $3 AND nivel = $4`,
            [mail, cod_concepto, id_tipo_aprob, nivel]
        )
        return req.data
    })

    srv.on('DELETE', 'PNCND_APROB_X_FUNCION', async (req) => {
        const { cod_concepto, id_tipo_aprob, nivel } = req.data
        const db = await cds.connect.to('db')
        await db.run(
            `DELETE FROM ${T('pncnd_aprob_x_funcion')}
             WHERE cod_concepto = $1 AND id_tipo_aprob = $2 AND nivel = $3`,
            [cod_concepto, id_tipo_aprob, nivel]
        )
        return req.data
    })
}
