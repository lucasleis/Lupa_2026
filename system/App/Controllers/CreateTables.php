<?php

namespace App\Controllers;

use \Core\View;

/**
 * Home controller
 *
 * PHP version 7.0
 */
class CreateTables extends \Core\Controller
{

    public function createAction()
    {
        $create = \App\Models\Migrations::createTablesLupa();
        echo "Tablas creadas con éxito. <br><br> Vuelve al panel de control haciendo <a href='/buscandoconlupa/admin-2024'>click aquí</a>";
    }


}
