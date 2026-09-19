<?php

namespace App\Controllers;

use \Core\View;
use \PHPMailer\PHPMailer\PHPMailer;
use \PHPMailer\PHPMailer\SMTP;
use \PHPMailer\PHPMailer\Exception;

/**
 * Home controller
 *
 * PHP version 7.0
 */
class Home extends \Core\Controller
{

    public function emailAction(){
        

    }
    public function indexAction()
    {
        View::render('base.html');
    }

    // ---- Lupa 2024

    public function fruteriaAction()
    {
        View::render('fruteria.html');
    }

    public function carniceriaAction()
    {
        View::render('carniceria.html');
    }

    public function pescaderiaAction()
    {
        View::render('pescaderia.html');
    }

    public function healthyAction()
    {
        View::render('healthy.html');
    }

    public function hornoAction()
    {
        View::render('horno.html');
    }

    public function queseriaAction()
    {
        View::render('queseria.html');
    }

    public function despensaAction()
    {
        View::render('despensa.html');
    }

    public function desayunoAction()
    {
        View::render('desayuno.html');
    }

    public function salsasAction()
    {
        View::render('salsas.html');
    }

    public function lacteosAction()
    {
        View::render('lacteos.html');
    }
        
    public function meriendaAction()
    {
        View::render('merienda.html');
    }
    
    public function platosPreparadosAction()
    {
        View::render('platos_preparados.html');
    }

    public function registro()
    {
        View::render('registro.html');
    }

    // Otros
    
    public function politicadeprivacidadAction()
    {
        View::render('politica-de-privacidad.html');
    }
    
    public function politicadecookiesAction()
    {
        View::render('politica-de-cookies.html');
    }
    
    public function avisolegalAction()
    {
        View::render('aviso-legal.html');
    }

    public function tester()
    {
        View::render('tester.html');
    }

    public function slider()
    {
        View::render('slider.html');
    }

}
