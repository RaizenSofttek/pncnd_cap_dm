using {my.raizen as db} from '../db/schema';

service RaizenService {
    entity PNCND_TABLAS_MAESTRAS          as projection on db.PNCND_TABLAS_MAESTRAS;
    entity PNCND_APROBADORES              as projection on db.PNCND_APROBADORES;
    entity PNCND_APROB_X_OF_VENTAS        as projection on db.PNCND_APROB_X_OF_VENTAS;
    entity PNCND_APROB_X_FUNCION          as projection on db.PNCND_APROB_X_FUNCION;
    entity PNCND_CLIENTES                 as projection on db.PNCND_CLIENTES;
    @readonly entity PNCND_APROB_X_OF_VENTAS_AUDIT as projection on db.PNCND_APROB_X_OF_VENTAS_AUDIT;
    @readonly entity PNCND_APROB_X_FUNCION_AUDIT   as projection on db.PNCND_APROB_X_FUNCION_AUDIT;
    @readonly entity PNCND_CLIENTES_AUDIT          as projection on db.PNCND_CLIENTES_AUDIT;
    @readonly entity PNCND_COD_CONCEPTO            as projection on db.PNCND_COD_CONCEPTO;
    @readonly entity PNCND_TIPOS_APROB             as projection on db.PNCND_TIPOS_APROB;
    @readonly entity PNCND_NIVELES                 as projection on db.PNCND_NIVELES;
    entity PNCND_REL_CONC_MOA                      as projection on db.PNCND_REL_CONC_MOA;
    entity PNCND_REL_CONC_TIPO_DOC                 as projection on db.PNCND_REL_CONC_TIPO_DOC;

    @open type UserInfo {};
    function MisRoles() returns UserInfo;
}
