<?php

namespace App\Controllers;

use \Core\View;
session_start();

/**
 * Home controller
 *
 * PHP version 7.0
 */
class Admin extends \Core\Controller
{

    public function indexadminAction()
    {
        if (!isset($_SESSION['user_id'])) {
            View::render('login.html');
        }else{
            header('Location: ' . BASE . 'panel/');
            exit;
        }
    }

    public function loginAction()
    {
        if(isset($_POST["password"])){
            $usuario     = $_POST["usuario"];
            $password    = $_POST["password"];
            error_log($usuario);
            error_log($password);
            error_log(md5($password));
            $check = \App\Models\User::loginCheck($usuario, $password);
            if($check == true){
                $_SESSION['user_id'] = $usuario;
                header('Location: ' . BASE . 'panel/');
            }else{
                header('Location: ' . BASE);
            }
        }else{
            header('Location: ' . BASE);
            exit;
        }

    }

    public function panelAction()
    {
        if(isset($_SESSION['user_id'])){
            $formularios = \App\Models\Formulario::listaFormularios();
            View::renderTemplate('panel.html', ["formularios" => $formularios, "base" => BASE]);
        }else{
            header('Location: ' . BASE . 'admin-2024/');
            exit;
        }

    }

    public function salirAction(){
        session_unset();
        header('Location: ' . BASE . 'admin-2024/');
        exit;
    }

    public function changepasswordAction(){

        /**
         * POR FAVOR SOLAMENTE INTRODUCE LA NUEVA CONTRASEÑA
         * DENTRO DE LAS COMILLAS.
         */
        $password = "2024";
        /**
         * FIN DE LA CONFIGURACIÓN
         */

        $check = \App\Models\User::changepass(md5($password));
        header('Location: /');
        exit;
    }

}
