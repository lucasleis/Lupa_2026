<?php

namespace App\Models;

use PDO;

/**
 * Example user model
 *
 * PHP version 7.0
 */
class User extends \Core\Model
{

    public static function loginCheck($usuario, $password){
        $db = static::getDB();
        $check = $db->query('SELECT * FROM usuarios WHERE usuario = "'.$usuario.'"');
        $result = $check->fetchAll(PDO::FETCH_ASSOC);

        if(empty($result)){
            return false;
        }else{
            if(md5($password) == $result[0]["password"]){
                return true;
            }else{
                return false;
            }
        }
    }

    public static function changepass($password){
        $db = static::getDB();
        $check = $db->query('UPDATE usuarios SET password = "'.$password.'" WHERE usuario = "lupa"');
    }

}
