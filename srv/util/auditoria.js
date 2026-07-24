'use strict'

/**
 * Lee un registro completo de la tabla fuente por clave primaria.
 * Retorna el primer resultado o null si no existe.
 */
async function _leerRegistro(db, tablaFuente, claves, data) {
    const where = claves.map((k, i) => `${k} = $${i + 1}`).join(' AND ')
    const filas = await db.run(
        `SELECT * FROM ${tablaFuente} WHERE ${where}`,
        claves.map(k => data[k])
    )
    return filas?.[0] || null
}

/**
 * Inserta una fila en la tabla de auditoría.
 * Genera dinámicamente las columnas _anterior / _nuevo a partir de `campos`.
 * No incluye `id` — lo genera PostgreSQL (BIGSERIAL).
 */
async function _insertarAudit(db, tablaAudit, campos, anterior, nuevo, accion, usuario) {
    const cols = [
        ...campos.map(c => `${c}_anterior`),
        ...campos.map(c => `${c}_nuevo`),
        'accion', 'fecha_modificacion', 'usuario_modificacion'
    ]
    const vals = [
        ...campos.map(c => anterior?.[c] ?? null),
        ...campos.map(c => nuevo?.[c]     ?? null),
        accion,
        new Date(),
        usuario || 'anonimo'
    ]
    const ph = vals.map((_, i) => `$${i + 1}`).join(', ')
    await db.run(
        `INSERT INTO ${tablaAudit} (${cols.join(', ')}) VALUES (${ph})`,
        vals
    )
}

/**
 * Registra handlers de auditoría para una entidad del servicio CAP.
 *
 * @param {object} srv    Instancia del servicio CAP.
 * @param {object} cfg
 * @param {string}   cfg.entidad      Nombre de la entidad en el servicio (ej: 'PNCND_CLIENTES').
 * @param {string}   cfg.tablaFuente  Tabla origen con schema (ej: T('pncnd_clientes')).
 * @param {string}   cfg.tablaAudit   Tabla audit con schema  (ej: T('pncnd_clientes_audit')).
 * @param {string[]} cfg.claves       Campos que forman la clave primaria.
 * @param {string[]} cfg.campos       Todos los campos a auditar (claves + no-claves).
 */
function registrarAuditoria(srv, { entidad, tablaFuente, tablaAudit, claves, campos }) {

    // ── BEFORE UPDATE / DELETE: capturar estado previo ────────────────────
    srv.before(['UPDATE', 'DELETE'], entidad, async (req) => {
        try {
            const db = await cds.connect.to('db')
            req._auditPrev = await _leerRegistro(db, tablaFuente, claves, req.data)
        } catch (e) {
            req._auditPrev = null
        }
    })

    // ── AFTER CREATE ──────────────────────────────────────────────────────
    srv.after('CREATE', entidad, async (_, req) => {
        const db      = await cds.connect.to('db')
        const usuario = req.user?.id || 'anonimo'
        await _insertarAudit(db, tablaAudit, campos, null, req.data, 'CREAR', usuario)
    })

    // ── AFTER UPDATE ──────────────────────────────────────────────────────
    srv.after('UPDATE', entidad, async (_, req) => {
        const db      = await cds.connect.to('db')
        const usuario = req.user?.id || 'anonimo'
        // Re-leer el estado completo post-update (el PATCH puede ser parcial)
        const nuevo   = await _leerRegistro(db, tablaFuente, claves, req.data)
        await _insertarAudit(db, tablaAudit, campos, req._auditPrev, nuevo, 'MODIFICAR', usuario)
    })

    // ── AFTER DELETE ──────────────────────────────────────────────────────
    srv.after('DELETE', entidad, async (_, req) => {
        const db      = await cds.connect.to('db')
        const usuario = req.user?.id || 'anonimo'
        await _insertarAudit(db, tablaAudit, campos, req._auditPrev, null, 'ELIMINAR', usuario)
    })
}

module.exports = { registrarAuditoria }
