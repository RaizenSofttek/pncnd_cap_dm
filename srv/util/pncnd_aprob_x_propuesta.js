const { readFromTable }     = require('../lib/readFromTable')
const { registrarAuditoria } = require('./auditoria')

module.exports = (srv, T) => {

    srv.on('READ', 'PNCND_APROB_X_PROPUESTA', (req) => readFromTable(T('pncnd_aprob_x_propuesta'), req))
    
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
