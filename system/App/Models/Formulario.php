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
        $db = static::getDB();
        $nuevo = $db->prepare('INSERT INTO `formularios` (`nombre`, `email`, `codigo_postal`, `telefono`, `alta_comunicaciones`, `fecha`) VALUES (:nombre, :email, :codigo_postal, :telefono, :alta_comunicaciones, NOW())');
        return $nuevo->execute(array(
            ':nombre' => $data["nombre"],
            ':email' => $data["email"],
            ':codigo_postal' => $data["codigo_postal"],
            ':telefono' => $data["telefono"],
            ':alta_comunicaciones' => isset($data["recibir_comunicaciones"]) ? 1 : 0,
        ));
    }

    public static function checkRegistro($email){
        $db = static::getDB();
        $check = $db->prepare('SELECT 1 FROM formularios WHERE email = :email LIMIT 1');
        $check->execute(array(':email' => $email));
        return $check->fetchColumn() !== false;
    }
}
