<?php

namespace App\Controllers;

use \Core\View;
use \PHPMailer\PHPMailer\PHPMailer;
use \PHPMailer\PHPMailer\SMTP;
use \PHPMailer\PHPMailer\Exception;
session_start();

/**
 * Home controller
 *
 * PHP version 7.0
 */
class Formularios extends \Core\Controller
{

    public function procesarAction(){
       if($_POST){
           $create = \App\Models\Formulario::nuevoFormulario($_POST);
           $correoEnviado = $this->enviar_email_ws('Asunto Email', $_POST["email"], $_POST["nombre_apellido"]);
           $data = array("success" => 2, "email_sent" => $correoEnviado);
           echo json_encode($data);
       }

    }

    public function ajax(){
        $email = $_POST["email"];
        $check = \App\Models\Formulario::checkRegistro($email);
        if($check){
            echo json_encode(array('success' => 1));
        }else{
            echo json_encode(array('success' => 0));
        }
    }
    
    public function enviar_email_ws($asunto, $email, $nombre){
        if (\App\Config::MAIL_USER === '') {
            return false;
        }
        try {
            $mail = new PHPMailer(true);
            //Server settings
            $mail->isSMTP();                                            //Send using SMTP
            $mail->Host       = \App\Config::MAIL_HOST;                //Set the SMTP server to send through
            $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
            $mail->SMTPSecure = 'STARTTLS';                             //Enable implicit TLS encryption
            $mail->Port       = \App\Config::MAIL_PORT;                //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`
            $mail->CharSet    = 'UTF-8';        
            $mail->Username   = \App\Config::MAIL_USER;                //SMTP username
            $mail->Password   = \App\Config::MAIL_PASSWORD;            //SMTP password
            
            //Recipients
            $mail->setFrom(\App\Config::MAIL_FROM, \App\Config::MAIL_FROM_NAME);
            $mail->addAddress($email, $nombre);     //Add a recipient
        
            //Content
            $nlTemplate = __DIR__ . '/../Views/email/NL-Lupa-Vales-2025.html';
            $mail->Body = file_get_contents($nlTemplate);

            $mail->isHTML(true);                                  //Set email format to HTML
            //$mail->Subject = $asunto.' - Villalupa';
            $mail->Subject = '¡Aquí están tus descuentos de Buscando con Lupa!';
            
            return $mail->send();
        } catch (Exception $e) {
            error_log("Problemas al enviar email: {$e->getMessage()}");
            return false;
        }
    }

}
