namespace my.raizen;

@cds.persistence.exists
@cds.persistence.name: 'pncnd_tablas_maestras'
entity PNCND_TABLAS_MAESTRAS {
  key id          : Integer;
      nombre      : String(50);
      descripcion : String(100);
      fecha_inicio: Date;
      fecha_fin   : Date;
}

@cds.persistence.exists
@cds.persistence.name: 'pncnd_aprobadores'
entity PNCND_APROBADORES {
  key mail          : String(50);
      id_tipo_aprob : String(2);
      nombre        : String(100);
}

@cds.persistence.exists
@cds.persistence.name: 'pncnd_aprob_x_of_ventas'
entity PNCND_APROB_X_OF_VENTAS {
  key vkorg         : String(4);
  key vtweg         : String(2);
  key spart         : String(2);
  key id_tipo_aprob : String(2);
  key nivel         : Integer;
  key vkbur         : String(4);
  key bran2         : String(10);
      mail          : String(50);
}

@cds.persistence.exists
@cds.persistence.name: 'pncnd_aprob_x_funcion'
entity PNCND_APROB_X_FUNCION {
  key cod_concepto  : String(18);
  key id_tipo_aprob : String(2);
  key nivel         : Integer;
      mail          : String(50);
}

@cds.persistence.exists
@cds.persistence.name: 'pncnd_clientes'
entity PNCND_CLIENTES {
  key kunnr   : String(10); 
  vkorg       : String(4);
  vtweg       : String(2);
  spart       : String(2);
  vkbur       : String(4);
  bran2       : String(10);
  name1       : String(35);        
}
