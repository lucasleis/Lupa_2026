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
        header('Content-Type: application/json');
        if (empty($_POST)) {
            http_response_code(405);
            $data = array('error' => 'method_not_allowed');
        } else {
            $nombre = isset($_POST['nombre']) && is_string($_POST['nombre']) ? trim($_POST['nombre']) : '';
            $email = isset($_POST['email']) && is_string($_POST['email']) ? trim($_POST['email']) : '';
            $codigoPostal = isset($_POST['codigo_postal']) && is_string($_POST['codigo_postal']) ? trim($_POST['codigo_postal']) : '';
            $telefono = isset($_POST['telefono']) && is_string($_POST['telefono']) ? $_POST['telefono'] : '';
            $nombreLength = preg_match_all('/./us', $nombre, $matches);
            $emailLength = preg_match_all('/./us', $email, $matches);
            $invalidFields = array();

            if ($nombreLength === false || $nombreLength < 2 || $nombreLength > 100 || !preg_match('/^[\p{L}][\p{L}\'’-]*[\p{L}](?:\s+[\p{L}][\p{L}\'’-]*[\p{L}])+$/u', $nombre)) {
                $invalidFields[] = 'nombre';
            }
            if ($email === '' || $emailLength === false || $emailLength > 100 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
                $invalidFields[] = 'email';
            }
            if (!preg_match('/^[0-9]{5}$/D', $codigoPostal)) {
                $invalidFields[] = 'codigo_postal';
            }
            $telefonoSinEspacios = str_replace(' ', '', $telefono);
            if (!preg_match('/^(?:(?:\+34|0034))?[6789][0-9]{8}$/D', $telefonoSinEspacios)) {
                $invalidFields[] = 'telefono';
            }

            if ($invalidFields) {
                http_response_code(422);
                $data = array('success' => 0, 'invalid_fields' => $invalidFields);
            } elseif (\App\Models\Formulario::checkRegistro($email)) {
                $data = array('success' => 1, 'already_registered' => true);
            } else {
                $registro = \App\Models\Formulario::nuevoFormulario(array(
                    'nombre' => $nombre,
                    'email' => $email,
                    'codigo_postal' => $codigoPostal,
                    'telefono' => $telefono,
                ));
                if (!$registro) {
                    http_response_code(500);
                    $data = array('success' => 0, 'error' => 'save_failed');
                } else {
                    $correoEnviado = $this->enviar_email_ws('Asunto Email', $email, $nombre);
                    $data = array('success' => 2, 'email_sent' => $correoEnviado);
                }
            }
        }
        echo json_encode($data);
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
