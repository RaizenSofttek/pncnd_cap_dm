using {pncnd as db} from '../db/schema';

service PncndDmService {
    entity PNCND_APROBADORES       as projection on db.PNCND_APROBADORES;
    entity PNCND_APROB_X_OF_VENTAS as projection on db.PNCND_APROB_X_OF_VENTAS;
    entity PNCND_APROB_X_FUNCION   as projection on db.PNCND_APROB_X_FUNCION;
}
