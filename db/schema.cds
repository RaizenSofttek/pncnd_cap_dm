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

@cds.persistence.exists
@cds.persistence.name: 'pncnd_cod_concepto'
entity PNCND_COD_CONCEPTO {
  key cod_concepto  : String(18); 
  descripcion       : String(40);
}

@cds.persistence.exists
@cds.persistence.name: 'pncnd_tipos_aprob'
entity PNCND_TIPOS_APROB {
  key id_tipo_aprob   : String(2);
  descripcion         : String(40);
}

@cds.persistence.exists
@cds.persistence.name: 'pncnd_niveles'
entity PNCND_NIVELES {
  key nivel     : Integer; 
  descripcion   : String(50);
}

@cds.persistence.exists
@cds.persistence.name: 'pncnd_rel_conc_moa'
entity PNCND_REL_CONC_MOA {
  key cod_concepto    : String(18);
  key id_tipo_op      : String(14); 
  key linea_moa       : String(10);  
      nombre          : String(40); 
      clasificacion   : String(40); 
}

@cds.persistence.exists
@cds.persistence.name: 'pncnd_rel_conc_tipo_doc'
entity PNCND_REL_CONC_TIPO_DOC {
  key cod_concepto  : String(18);
  key id_tipo_op    : String(14);
  key id_tipo_doc   : String(2);
  key linea_moa     : String(10); 
}

@cds.persistence.exists
@cds.persistence.name: 'pncnd_aprob_x_of_ventas_audit'
entity PNCND_APROB_X_OF_VENTAS_AUDIT {
  key id                   : Integer64;
      vkorg_anterior       : String(4);
      vtweg_anterior       : String(2);
      spart_anterior       : String(2);
      id_tipo_aprob_anterior: String(2);
      nivel_anterior       : Integer;
      vkbur_anterior       : String(4);
      bran2_anterior       : String(10);
      mail_anterior        : String(50);
      vkorg_nuevo          : String(4);
      vtweg_nuevo          : String(2);
      spart_nuevo          : String(2);
      id_tipo_aprob_nuevo  : String(2);
      nivel_nuevo          : Integer;
      vkbur_nuevo          : String(4);
      bran2_nuevo          : String(10);
      mail_nuevo           : String(50);
      accion               : String(10);
      fecha_modificacion   : Timestamp;
      usuario_modificacion : String(100);
}

@cds.persistence.exists
@cds.persistence.name: 'pncnd_aprob_x_funcion_audit'
entity PNCND_APROB_X_FUNCION_AUDIT {
  key id                    : Integer64;
      cod_concepto_anterior : String(18);
      id_tipo_aprob_anterior: String(2);
      nivel_anterior        : Integer;
      mail_anterior         : String(50);
      cod_concepto_nuevo    : String(18);
      id_tipo_aprob_nuevo   : String(2);
      nivel_nuevo           : Integer;
      mail_nuevo            : String(50);
      accion                : String(10);
      fecha_modificacion    : Timestamp;
      usuario_modificacion  : String(100);
}

@cds.persistence.exists
@cds.persistence.name: 'pncnd_clientes_audit'
entity PNCND_CLIENTES_AUDIT {
  key id                   : Integer64;
      kunnr_anterior       : String(10);
      vkorg_anterior       : String(4);
      vtweg_anterior       : String(2);
      spart_anterior       : String(2);
      vkbur_anterior       : String(4);
      bran2_anterior       : String(10);
      name1_anterior       : String(35);
      kunnr_nuevo          : String(10);
      vkorg_nuevo          : String(4);
      vtweg_nuevo          : String(2);
      spart_nuevo          : String(2);
      vkbur_nuevo          : String(4);
      bran2_nuevo          : String(10);
      name1_nuevo          : String(35);
      accion               : String(10);
      fecha_modificacion   : Timestamp;
      usuario_modificacion : String(100);
}

@cds.persistence.exists
@cds.persistence.name: 'pncnd_rel_conc_moa_audit'
entity PNCND_REL_CONC_MOA_AUDIT {
  key id                     : Integer64;
      cod_concepto_anterior  : String(18);
      id_tipo_op_anterior    : String(14);
      linea_moa_anterior     : String(10);
      nombre_anterior        : String(40);
      clasificacion_anterior : String(40);
      cod_concepto_nuevo     : String(18);
      id_tipo_op_nuevo       : String(14);
      linea_moa_nuevo        : String(10);
      nombre_nuevo           : String(40);
      clasificacion_nuevo    : String(40);
      accion                 : String(10);
      fecha_modificacion     : Timestamp;
      usuario_modificacion   : String(100);
}

@cds.persistence.exists
@cds.persistence.name: 'pncnd_rel_conc_tipo_doc_audit'
entity PNCND_REL_CONC_TIPO_DOC_AUDIT {
  key id                     : Integer64;
      cod_concepto_anterior  : String(18);
      id_tipo_op_anterior    : String(14);
      id_tipo_doc_anterior   : String(2);
      linea_moa_anterior     : String(10);
      cod_concepto_nuevo     : String(18);
      id_tipo_op_nuevo       : String(14);
      id_tipo_doc_nuevo      : String(2);
      linea_moa_nuevo        : String(10);
      accion                 : String(10);
      fecha_modificacion     : Timestamp;
      usuario_modificacion   : String(100);
}

@cds.persistence.exists
@cds.persistence.name: 'pncnd_cod_concepto_audit'
entity PNCND_COD_CONCEPTO_AUDIT {
  key id                     : Integer64;
      cod_concepto_anterior  : String(18);
      descripcion_anterior   : String(40);
      cod_concepto_nuevo     : String(18);
      descripcion_nuevo      : String(40);
      accion                 : String(10);
      fecha_modificacion     : Timestamp;
      usuario_modificacion   : String(100);
}