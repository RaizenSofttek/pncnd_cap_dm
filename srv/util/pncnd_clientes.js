const { readFromTable } = require('../lib/readFromTable')

module.exports = (srv, T) => {

    srv.on('READ', 'PNCND_CLIENTES', (req) => readFromTable(T('pncnd_clientes'), req))

    srv.on('CREATE', 'PNCND_CLIENTES', async (req) => {
        const { kunnr, vkorg, vtweg, spart, vkbur, bran2, name1 } = req.data
        const db = await cds.connect.to('db')
        await db.run(
            `INSERT INTO ${T('pncnd_clientes')} (kunnr, vkorg, vtweg, spart, vkbur, bran2, name1)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [kunnr, vkorg, vtweg, spart, vkbur, bran2, name1]
        )
        return req.data
    })

    srv.on('UPDATE', 'PNCND_CLIENTES', async (req) => {
        const { kunnr, vkorg, vtweg, spart, vkbur, bran2, name1 } = req.data
        const db = await cds.connect.to('db')
        await db.run(
            `UPDATE ${T('pncnd_clientes')}
             SET vkorg = $1,
                 vtweg = $2,
                 spart = $3,
                 vkbur = $4,
                 bran2 = $5,
                 name1 = $6
             WHERE kunnr = $7`,
            [vkorg, vtweg, spart, vkbur, bran2, name1, kunnr]
        )
        return req.data
    })

    srv.on('DELETE', 'PNCND_CLIENTES', async (req) => {
        const { kunnr } = req.data
        const db = await cds.connect.to('db')
        await db.run(`DELETE FROM ${T('pncnd_clientes')} WHERE kunnr = $1`, [kunnr])
        return req.data
    })
}
