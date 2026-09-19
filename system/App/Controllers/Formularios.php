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
           $this->enviar_email_ws('email-lupa   ', 'Asunto Email', $_POST["email"], $_POST["nombre_apellido"]);
           $data = array("success" => 2);
           echo json_encode($data);
                /*
               switch ($_POST["formulario"]){
                   
                case 'fruteria':
                       $this->enviar_email_ws('email-fruteria', 'Asunto Email Fruteria', $_POST["email"], $_POST["nombre_apellido"]);
                       $data = array("success" => 2);
                       echo json_encode($data);
                       break;
               
                case 'carniceria':
                       $this->enviar_email_ws('email-carniceria', 'Asunto Email Carniceria', $_POST["email"], $_POST["nombre_apellido"]);
                       $data = array("success" => 2);
                       echo json_encode($data);
                       break;
                       
                case 'healthy':
                       $this->enviar_email_ws('email-healthy', 'Asunto Email Healthy', $_POST["email"], $_POST["nombre_apellido"]);
                       $data = array("success" => 2);
                       echo json_encode($data);
                       break;
                       
                case 'horno':
                       $this->enviar_email_ws('email-horno', 'Asunto Email Horno', $_POST["email"], $_POST["nombre_apellido"]);
                       $data = array("success" => 2);
                       echo json_encode($data);
                       break;
                       
                case 'queseria':
                       $this->enviar_email_ws('email-queseria', 'Asunto Email Queseria', $_POST["email"], $_POST["nombre_apellido"]);
                       $data = array("success" => 2);
                       echo json_encode($data);
                       break;
                       
                case 'pescaderia':
                       $this->enviar_email_ws('email-pescaderia', 'Asunto Email Pescaderia', $_POST["email"], $_POST["nombre_apellido"]);
                       $data = array("success" => 2);
                       echo json_encode($data);
                       break;
                       
                case 'despensa':
                       $this->enviar_email_ws('email-despensa', 'Asunto Email Despensa', $_POST["email"], $_POST["nombre_apellido"]);
                       $data = array("success" => 2);
                       echo json_encode($data);
                       break;
                       
               }*/
        
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
    
    public function enviar_email_ws($formulario, $asunto, $email, $nombre){
        $mail = new PHPMailer(true);

        try {
            //Server settings
            $mail->isSMTP();                                            //Send using SMTP
            $mail->Host       = 'smtp.office365.com';                   //Set the SMTP server to send through
            $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
            $mail->SMTPSecure = 'STARTTLS';                             //Enable implicit TLS encryption
            $mail->Port       = 587;                                    //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`
            $mail->CharSet    = 'UTF-8';        
            
            // Usuario/pass del 2022. Comentar este o el de 2023:
            
            $mail->Username   = 'buscandoconlupa@semark.com';                       //SMTP username
            $mail->Password   = 'gIBkAFJLok.';                                      //SMTP password
            //$mail->Username   = 'misteriosdelupa@semark.com';                     //SMTP username
            //$mail->Password   = 'Semark2024';                                     //SMTP password
            
            // Usuario/pass del 2022. Comentar este o el de 2022:
            
            //$mail->Username   = 'villalupa@semark.com';                     //SMTP username
            //$mail->Password   = 'Semark2023';                               //SMTP password
            
            
            //Recipients
            $mail->setFrom('buscandoconlupa@semark.com', 'Lupa');
            $mail->addAddress($email, $nombre);     //Add a recipient
        
            //Content
            // $mail->Body = file_get_contents('system/App/Views/email/'.$formulario.'.html');

            $nlTemplate = __DIR__ . '/../Views/email/NL-Lupa-Vales-2025.html';
            $mail->Body = file_get_contents($nlTemplate);

            $mail->isHTML(true);                                  //Set email format to HTML
            //$mail->Subject = $asunto.' - Villalupa';
            $mail->Subject = '¡Aquí están tus descuentos de Buscando con Lupa!';
            
            $mail->send();
        } catch (Exception $e) {
            echo "Problemas al enviar email. Contactar con soporte@semark.com - Error: {$mail->ErrorInfo}";
        }
    }

}
