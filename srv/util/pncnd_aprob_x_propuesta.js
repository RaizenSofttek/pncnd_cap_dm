const { readFromTable }     = require('../lib/readFromTable')
const { registrarAuditoria } = require('./auditoria')

module.exports = (srv, T) => {

    srv.on('READ', 'PNCND_APROB_X_PROPUESTA', (req) => readFromTable(T('pncnd_aprob_x_propuesta'), req))

    // Evita que el front descargue todos los pendientes solo para extraer los
    // mails distintos del filtro: el DISTINCT se resuelve en la base.
    srv.on('getMailsPendientes', async (req) => {
        try {
            const rows = await cds.db.run(
                `SELECT DISTINCT LOWER(RTRIM(mail)) AS mail
                 FROM ${T('pncnd_aprob_x_propuesta')}
                 WHERE aprobado = 'N'
                   AND mail IS NOT NULL
                   AND RTRIM(mail) <> ''
                 ORDER BY mail`
            )
            return rows || []
        } catch (error) {
            return req.error(500, `Error al obtener mails pendientes: ${error.message}`)
        }
    })


    // Un solo UPDATE por lote en lugar de una request por registro. CAP envuelve
    // cada handler en su propia transacción, así que el lote es todo o nada.
    srv.on('modificarAprobadoresMasivo', async (req) => {
        const { claves, mail } = req.data

        if (!claves || !mail) {
            return req.error(400, 'Faltan parámetros requeridos')
        }

        const aClaves = claves
            .split(';')
            .filter(Boolean)
            .map((sClave) => sClave.split('-').map(Number))

        if (!aClaves.length) {
            return req.error(400, 'No se recibieron claves')
        }

        const bInvalidas = aClaves.some(
            (a) => a.length !== 4 || a.some((n) => !Number.isInteger(n))
        )
        if (bInvalidas) {
            return req.error(400, 'Formato de claves inválido')
        }

        const fecha_mod = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Argentina/Buenos_Aires',
            year:     'numeric',
            month:    '2-digit',
            day:      '2-digit'
        }).format(new Date())

        // $1 es el mail; las claves ocupan de $2 en adelante. fecha_mod va al final
        // y solo en el UPDATE: PostgreSQL falla con "could not determine data type"
        // si una consulta recibe un parámetro que nunca referencia.
        const aClavesPlanas = []
        const sTuplas = aClaves.map((aClave) => {
            aClavesPlanas.push(...aClave)
            const i = aClavesPlanas.length + 1
            return `($${i - 3}::int, $${i - 2}::int, $${i - 1}::int, $${i}::int)`
        }).join(', ')

        // Misma condición para contar y para actualizar
        const sWhere = `WHERE (id_propuesta, id_lote, nivel, orden) IN (${sTuplas})
                          AND RTRIM(mail) <> $1`

        const aParamsConteo = [mail, ...aClavesPlanas]
        const aParamsUpdate = [...aParamsConteo, fecha_mod]

        try {
            // db.run sobre un UPDATE crudo no devuelve un contador confiable, así que
            // el conteo sale de un SELECT previo. Ambas corren en la transacción que
            // CAP abre por request, de modo que nadie puede modificar nada en el medio.
            const aConteo = await cds.db.run(
                `SELECT COUNT(*) AS cnt FROM ${T('pncnd_aprob_x_propuesta')} ${sWhere}`,
                aParamsConteo
            )
            const iModificados = parseInt(aConteo?.[0]?.cnt, 10) || 0

            // mail_mod toma el valor previo de la propia columna; el <> filtra
            // los que ya tenían ese aprobador sin necesidad de chequearlo antes
            await cds.db.run(
                `UPDATE ${T('pncnd_aprob_x_propuesta')}
                 SET mail_mod  = mail,
                     mail      = $1,
                     fecha_mod = $${aParamsUpdate.length}
                 ${sWhere}`,
                aParamsUpdate
            )

            return {
                modificados: iModificados,
                sinCambios : aClaves.length - iModificados
            }

        } catch (error) {
            return req.error(500, `Error al modificar el lote: ${error.message}`)
        }
    })

    srv.on('modificarAprobador', async (req) => {
        const { id_propuesta, id_lote, nivel, orden, mail, mail_mod } = req.data;
    
        if (!id_propuesta || !id_lote || nivel === undefined || orden === undefined || !mail || !mail_mod) {
            return req.error(400, 'Faltan parámetros requeridos');
        }
    
        const now = new Date();
    
        const fecha_mod = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/Argentina/Buenos_Aires',
            year:     'numeric',
            month:    '2-digit',
            day:      '2-digit'
        }).format(now);
    
        try {
            const result = await cds.db.run(
                `UPDATE PNCND_APROB_X_PROPUESTA
                 SET mail_mod  = $1,
                     mail      = $2,
                     fecha_mod = $3
                 WHERE id_propuesta = $4::int
                   AND id_lote      = $5::int
                   AND nivel        = $6::int
                   AND orden        = $7::int`,
                [mail_mod, mail, fecha_mod, id_propuesta, id_lote, nivel, orden]
            );
    
            if (result === 0) {
                return req.error(404, 'No se encontró el registro a modificar');
            }
    
            return { mensaje: 'Aprobador modificado con éxito' };
    
        } catch (error) {
            console.error('Error en modificarAprobador:', error);
            return req.error(500, 'Error interno al modificar el aprobador');
        }
    })

}
