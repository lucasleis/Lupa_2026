<?php

namespace App\Models;

use PDO;

/**
 * Example user model
 *
 * PHP version 7.0
 */
class Migrations extends \Core\Model
{

    public static function createTablesLupa()
    {
        $db = static::getDB();
        $password = md5("adminlupa2024");
        $stmt = $db->query('CREATE TABLE IF NOT EXISTS `usuarios` (`id` INT NOT NULL AUTO_INCREMENT,`usuario` VARCHAR(50),`password` TEXT, PRIMARY KEY (`id`)) ENGINE=InnoDB;');

        $check = $db->query('SELECT * FROM usuarios WHERE usuario = "lupa"');
        $result = $check->fetchAll(PDO::FETCH_ASSOC);

        if(empty($result)){
            $user = $db->query('INSERT INTO `usuarios` VALUES (null, "lupa", "'.$password.'");');
        }

        $forms = $db->query('CREATE TABLE IF NOT EXISTS `formularios` (`id` INT NOT NULL AUTO_INCREMENT, `formulario` VARCHAR(30), `nombre` VARCHAR(100), `email` VARCHAR(100), `codigo_postal` VARCHAR(15), `municipio_localidad` VARCHAR(100), `telefono` VARCHAR(18),`alta_comunicaciones` INT, `fecha` DATETIME, PRIMARY KEY (`id`));');
        return true;
    }
}
