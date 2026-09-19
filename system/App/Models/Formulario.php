<?php

namespace App\Models;

use PDO;

/**
 * Example user model
 *
 * PHP version 7.0
 */
class Formulario extends \Core\Model
{

    public static function listaFormularios(){
        $db = static::getDB();
        $check = $db->query('SELECT * FROM formularios');
        $result = $check->fetchAll(PDO::FETCH_ASSOC);

        if(empty($result)){
            return false;
        }else{
            return $result;
        }
    }

    public static function nuevoFormulario($data){
        if(isset($data["recibir_comunicaciones"])){
            $alta = 1;
        }else{
            $alta = 0;
        }
        $db = static::getDB();
        $nuevo = $db->query('INSERT INTO `formularios` VALUES (null, "'.$data["formulario"].'", "'.$data["nombre_apellido"].'", "'.$data["email"].'", "'.$data["codigo_postal"].'", "'.$data["telefono"].'","'.$data["telefono"].'", "'.$alta.'", now());');
        return false;
    }

    public static function checkRegistro($email){
        $db = static::getDB();
        $check = $db->query('SELECT * FROM formularios WHERE email = "'.$email.'"');
        $result = $check->fetchAll(PDO::FETCH_ASSOC);

        if(empty($result)){
            return false;
        }else{
            return true;
        }
    }
}
