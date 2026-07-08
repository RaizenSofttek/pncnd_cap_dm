const cds = require('@sap/cds');

// ============================================================
// Patrón estándar de lectura centralizada (ver CAP_Cambios_Frontend_Backend.md).
//
// DESVIACIÓN respecto al patrón original — leer antes de tocar este archivo:
// El patrón de referencia usa SELECT.from(tableName) (el query builder CQN
// de CAP). En este proyecto se probaron 3 variantes de esa vía:
//   1) SELECT.from('tanques.ordenes')   → error: relation "tanques_ordenes"
//   2) SELECT.from('raizen.Ordenes')    → error: relation "raizen_ordenes"
//   3) SELECT.from(entidad resuelta vía cds.entities('raizen'))
//                                        → error: relation "raizen_ordenes"
// Las tres ignoran @cds.persistence.name / @cds.persistence.schema en tiempo
// de ejecución contra Postgres (confirmado con pruebas locales reales, no es
// una suposición). No se pudo determinar la causa exacta sin más acceso al
// entorno. Por eso esta versión arma el SQL a mano, igual que el resto de
// los handlers de este service.js (CREATE/UPDATE/DELETE), que SÍ funcionan
// porque usan SQL crudo con el nombre de tabla calificado literal.
//
// `sQualifiedTable` debe ser el nombre completo y literal de la tabla en
// Postgres, ej. 'tanques.ordenes' — exactamente como aparece en los FROM/
// INSERT/UPDATE/DELETE ya existentes en este archivo.
// ============================================================

// Traduce un array de tokens CQN (req.query.SELECT.where) a una condición
// SQL parametrizada. Soporta comparaciones simples (=, !=, <, >, <=, >=,
// like, between/and), conectores and/or, y grupos entre paréntesis (xpr).
// Los valores SIEMPRE van parametrizados ($1, $2, ...), nunca concatenados,
// para evitar inyección SQL. Los nombres de columna se validan con una
// whitelist de caracteres antes de usarse.
//
// NO soporta funciones OData complejas que no bajen a CQN como comparación
// simple (esto cubre eq/ne/gt/ge/lt/le/between y los filtros tipo Contains/
// StartsWith que SmartFilterBar genera, que CAP normaliza a LIKE). Si en
// algún momento aparece un error "token CQN no soportado", revisar acá.
function whereToSql(tokens, params) {
    let sql = '';
    for (const token of tokens) {
        if (typeof token === 'string') {
            sql += ' ' + token.toUpperCase() + ' ';
        } else if (token.func) {
            // Funciones de texto que genera el SmartFilterBar al filtrar con
            // comodines (*S*, S*, *S) o los operadores Contains/StartsWith/
            // EndsWith. El adaptador OData V2 + CAP las baja como un token
            // { func: 'contains'|'startswith'|'endswith', args: [ {ref}, {val} ] }.
            // Se traducen a LIKE con el % en la posición correcta. El valor va
            // SIEMPRE parametrizado (incluido el %) para evitar inyección.
            sql += _funcToSql(token, params);
        } else if (token.xpr) {
            sql += '(' + whereToSql(token.xpr, params) + ')';
        } else if (token.ref) {
            sql += quoteIdent(token.ref[token.ref.length - 1]);
        } else if (token.val !== undefined) {
            params.push(token.val);
            sql += '$' + params.length;
        } else if (token.list) {
            const placeholders = token.list.map((v) => {
                params.push(v.val);
                return '$' + params.length;
            });
            sql += '(' + placeholders.join(', ') + ')';
        } else {
            throw new Error(`Token CQN no soportado en where: ${JSON.stringify(token)}`);
        }
    }
    return sql;
}

// Traduce un token función de texto (contains/startswith/endswith) a una
// condición LIKE parametrizada y case-insensitive (ILIKE en Postgres).
// args[0] = { ref: [columna] }, args[1] = { val: 'texto' }.
function _funcToSql(token, params) {
    const sFunc = String(token.func).toLowerCase();
    const aArgs = token.args || [];

    // Localizar la referencia a columna y el valor entre los argumentos
    // (normalmente vienen en ese orden, pero no se asume).
    const oRefArg = aArgs.find((a) => a && a.ref);
    const oValArg = aArgs.find((a) => a && a.val !== undefined);

    if (!oRefArg || !oValArg) {
        throw new Error(`Función de texto sin args válidos: ${JSON.stringify(token)}`);
    }

    const sCol = quoteIdent(oRefArg.ref[oRefArg.ref.length - 1]);
    let sPattern;
    switch (sFunc) {
        case 'contains':
        case 'substringof':
            sPattern = '%' + oValArg.val + '%';
            break;
        case 'startswith':
            sPattern = oValArg.val + '%';
            break;
        case 'endswith':
            sPattern = '%' + oValArg.val;
            break;
        default:
            throw new Error(`Función de texto no soportada: ${sFunc}`);
    }

    params.push(sPattern);
    // ILIKE = LIKE case-insensitive en Postgres, para que *s* matchee 'S100'.
    return `${sCol} ILIKE $${params.length}`;
}

function orderByToSql(orderBy) {
    return orderBy
        .map((o) => `${quoteIdent(o.ref[o.ref.length - 1])} ${o.sort === 'desc' ? 'DESC' : 'ASC'}`)
        .join(', ');
}

// Whitelist defensiva — evita inyección SQL vía nombres de columna.
function quoteIdent(name) {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
        throw new Error(`Nombre de columna inválido: ${name}`);
    }
    return `"${name}"`;
}

const readFromTable = async (sQualifiedTable, req) => {
    try {
        const db = await cds.connect.to('db');
        const params = [];

        let sql = `SELECT * FROM ${sQualifiedTable}`;

        if (req.query?.SELECT?.where) {
            sql += ' WHERE ' + whereToSql(req.query.SELECT.where, params);
        }

        if (req.query?.SELECT?.orderBy) {
            sql += ' ORDER BY ' + orderByToSql(req.query.SELECT.orderBy);
        }

        if (req.query?.SELECT?.limit) {
            const { rows, offset } = req.query.SELECT.limit;
            if (rows?.val != null) sql += ` LIMIT ${parseInt(rows.val, 10)}`;
            if (offset?.val != null) sql += ` OFFSET ${parseInt(offset.val, 10)}`;
        }

        // $count / $inlinecount: detectar ANTES de armar limit/orderby, porque
        // el conteo debe ser sobre el total que matchea el WHERE, ignorando
        // paginación (LIMIT/OFFSET) y orden.
        //
        // La detección cubre TRES formas en que puede llegar un count, porque
        // el adaptador OData V2 las normaliza distinto según haya o no $filter:
        //   1) req.query.SELECT.count === true     → flag estándar de CQN.
        //   2) columns con func 'count'            → CAP traduce GET .../$count
        //      (incluido el caso CON $filter) a un SELECT cuya única columna es
        //      la función count(). ESTE es el caso que crasheaba: un /$count con
        //      filtro no siempre trae '/$count' en el path ni count===true, pero
        //      SÍ aparece como columna func 'count'.
        //   3) el path crudo incluye '/$count'     → respaldo defensivo.
        const aCols = req.query?.SELECT?.columns;
        const bCountFunc = Array.isArray(aCols) && aCols.some(
            (c) => c && (c.func === 'count' || c.func === 'COUNT' ||
                   (typeof c.as === 'string' && c.as === '$count'))
        );
        const bIsCount =
            req.query?.SELECT?.count === true ||
            bCountFunc ||
            req._?.odataReq?._url?.path?.includes('/$count');

        if (bIsCount) {
            // Contar el total real con el mismo WHERE pero sin LIMIT/OFFSET/ORDER.
            const countParams = [];
            let countSql = `SELECT COUNT(*) AS cnt FROM ${sQualifiedTable}`;
            if (req.query?.SELECT?.where) {
                countSql += ' WHERE ' + whereToSql(req.query.SELECT.where, countParams);
            }
            const countRows = await db.run(countSql, countParams);
            const iTotal = parseInt(countRows[0].cnt, 10) || 0;
            // Formato esperado por @sap/cds para inline/explicit count:
            // [{ counted: <n> }] → llena @odata.count / d.__count.
            return [{ counted: iTotal }];
        }

        const data = await db.run(sql, params);

        return data;
    } catch (error) {
        req.error(500, `Error al obtener datos de ${sQualifiedTable}: ${error.message}`);
    }
};

module.exports = { readFromTable };