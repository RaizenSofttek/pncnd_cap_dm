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
    require('./util/pncnd_tablas_maestras')(this, T)
    require('./util/pncnd_aprobadores')(this, T)
    require('./util/pncnd_aprob_x_of_ventas')(this, T)
    require('./util/pncnd_aprob_x_funcion')(this, T)
    require('./util/pncnd_clientes')(this, T)
    require('./util/pncnd_aprob_x_of_ventas_audit')(this, T)
    require('./util/pncnd_aprob_x_funcion_audit')(this, T)
    require('./util/pncnd_clientes_audit')(this, T)
    require('./util/pncnd_cod_concepto')(this, T)
    require('./util/pncnd_tipos_aprob')(this, T)
    require('./util/pncnd_niveles')(this, T)
    require('./util/pncnd_tipo_doc')(this, T)
    require('./util/pncnd_tipo_operacion')(this, T)
    require('./util/pncnd_linea_moa')(this, T)
    require('./util/pncnd_rel_conc_moa')(this, T)
    require('./util/pncnd_rel_conc_tipo_doc')(this, T)
    require('./util/pncnd_rel_conc_moa_audit')(this, T)
    require('./util/pncnd_rel_conc_tipo_doc_audit')(this, T)
    require('./util/pncnd_cod_concepto_audit')(this, T)

    this.on('MisRoles', (req) => {
        const payload = req.user?.tokenInfo?.payload || {}
        return {
            usuario:     payload.email || payload.user_name || req.user?.id || 'desconocido',
            scopes:      payload.scope  || [],
            given_name:  payload.given_name  || '',
            family_name: payload.family_name || '',
            client_id:   payload.client_id   || '',
            zid:         payload.zid         || ''
        }
    })
})
