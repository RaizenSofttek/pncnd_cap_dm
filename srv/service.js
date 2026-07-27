const { readFromTable } = require('./lib/readFromTable')

const SCHEMA = (() => {
    if (process.env.DB_SCHEMA) return process.env.DB_SCHEMA
    try {
        const creds = cds?.env?.requires?.db?.credentials || {}
        if (creds.schema) return creds.schema
    } catch (e) { /* fallback */ }
    return 'notas'
})()

const T = (tabla) => `${SCHEMA}.${tabla}`

module.exports = cds.service.impl(async function () {

    // ===== PNCND_TABLAS_MAESTRAS =====
    this.on('READ', 'PNCND_TABLAS_MAESTRAS', (req) => readFromTable(T('pncnd_tablas_maestras'), req))

    // ===== PNCND_APROBADORES =====
    this.on('READ', 'PNCND_APROBADORES', (req) => readFromTable(T('pncnd_aprobadores'), req))

    this.on('CREATE', 'PNCND_APROBADORES', async (req) => {
        const { mail, id_tipo_aprob, nombre } = req.data
        const db = await cds.connect.to('db')
        await db.run(
            `INSERT INTO ${T('pncnd_aprobadores')} (mail, id_tipo_aprob, nombre)
             VALUES ($1, $2, $3)`,
            [mail, id_tipo_aprob, nombre]
        )
        return req.data
    })

    this.on('UPDATE', 'PNCND_APROBADORES', async (req) => {
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

    this.on('DELETE', 'PNCND_APROBADORES', async (req) => {
        const { mail } = req.data
        const db = await cds.connect.to('db')
        await db.run(`DELETE FROM ${T('pncnd_aprobadores')} WHERE mail = $1`, [mail])
        return req.data
    })

    // ===== PNCND_APROB_X_OF_VENTAS =====
    this.on('READ', 'PNCND_APROB_X_OF_VENTAS', (req) => readFromTable(T('pncnd_aprob_x_of_ventas'), req))

    this.on('CREATE', 'PNCND_APROB_X_OF_VENTAS', async (req) => {
        const { vkorg, vtweg, spart, id_tipo_aprob, nivel, vkbur, bran2, mail } = req.data
        const db = await cds.connect.to('db')
        try {
            await db.run(
                `INSERT INTO ${T('pncnd_aprob_x_of_ventas')}
                    (vkorg, vtweg, spart, id_tipo_aprob, nivel, vkbur, bran2, mail)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [vkorg, vtweg, spart, id_tipo_aprob, nivel, vkbur, bran2, mail]
            )
        } catch (e) {
            if (e.code === '23505')
                return req.error(409, `Clave duplicada: ya existe (${vkorg}/${vtweg}/${spart}/${id_tipo_aprob}/${nivel}/${vkbur}/${bran2})`)
            throw e
        }
        return req.data
    })

    this.on('UPDATE', 'PNCND_APROB_X_OF_VENTAS', async (req) => {
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

    this.on('DELETE', 'PNCND_APROB_X_OF_VENTAS', async (req) => {
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

    // ===== PNCND_APROB_X_FUNCION =====
    this.on('READ', 'PNCND_APROB_X_FUNCION', (req) => readFromTable(T('pncnd_aprob_x_funcion'), req))

    this.on('CREATE', 'PNCND_APROB_X_FUNCION', async (req) => {
        const { cod_concepto, id_tipo_aprob, nivel, mail } = req.data
        const db = await cds.connect.to('db')
        try {
            await db.run(
                `INSERT INTO ${T('pncnd_aprob_x_funcion')} (cod_concepto, id_tipo_aprob, nivel, mail)
                 VALUES ($1, $2, $3, $4)`,
                [cod_concepto, id_tipo_aprob, nivel, mail]
            )
        } catch (e) {
            if (e.code === '23505')
                return req.error(409, `Clave duplicada: ya existe (${cod_concepto}/${id_tipo_aprob}/${nivel})`)
            throw e
        }
        return req.data
    })

    this.on('UPDATE', 'PNCND_APROB_X_FUNCION', async (req) => {
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

    this.on('DELETE', 'PNCND_APROB_X_FUNCION', async (req) => {
        const { cod_concepto, id_tipo_aprob, nivel } = req.data
        const db = await cds.connect.to('db')
        await db.run(
            `DELETE FROM ${T('pncnd_aprob_x_funcion')}
             WHERE cod_concepto = $1 AND id_tipo_aprob = $2 AND nivel = $3`,
            [cod_concepto, id_tipo_aprob, nivel]
        )
        return req.data
    })
})
