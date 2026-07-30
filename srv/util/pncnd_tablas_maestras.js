const { readFromTable } = require('../lib/readFromTable')

module.exports = (srv, T) => {

    srv.on('READ', 'PNCND_TABLAS_MAESTRAS', async (req) => {
        const sUrl = req._?.odataReq?._url?.path || req.path || '(unknown)'
        console.log(`[PNCND_LOG] PNCND_TABLAS_MAESTRAS consultada — url: ${sUrl} — usuario: ${req.user?.id || 'anónimo'}`)

        const result = await readFromTable(T('pncnd_tablas_maestras'), req)

        const nRows = Array.isArray(result) ? result.length : '?'
        console.log(`[PNCND_LOG] PNCND_TABLAS_MAESTRAS resultado — filas: ${nRows}${nRows > 0 && nRows !== '?' ? ' — primera: ' + JSON.stringify(result[0]) : ''}`)

        return result
    })
}
