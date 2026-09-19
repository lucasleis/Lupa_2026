<?php

/**
 * Front controller
 *
 * PHP version 7.0
 */

/**
 * Cambiar Password
 * SI QUIERES CAMBIAR LA CONTRASEÑA DEL ADMINISTRADOR
 * CAMBIA EL ESTADO DE false A true
 * UNA VEZ ESTE CAMBIADO EL ESTADO VE AL ARCHIVO /system/App/Controllers/Admin.php Y LINEA 73
 */

define("CHANGEPASSWORD", false);

/**
 * Composer
 */
require __DIR__ . '/system/vendor/autoload.php';

/**
 * Error and Exception handling
 */
error_reporting(E_ALL);
set_error_handler('Core\Error::errorHandler');
set_exception_handler('Core\Error::exceptionHandler');


/**
 * Routing
 */
$router = new Core\Router();


$router->add('/', ['controller' => 'Home', 'action' => 'index']);

// Lupa 2023
$router->add('puerto/', ['controller' => 'Home', 'action' => 'puerto']);
$router->add('queseria/', ['controller' => 'Home', 'action' => 'queseria']);
$router->add('verbena/', ['controller' => 'Home', 'action' => 'verbena']);
$router->add('merendero/', ['controller' => 'Home', 'action' => 'merendero']);
$router->add('huerto/', ['controller' => 'Home', 'action' => 'huerto']);
$router->add('granja/', ['controller' => 'Home', 'action' => 'granja']);
$router->add('comidapopular/', ['controller' => 'Home', 'action' => 'comidapopular']);
$router->add('bar/', ['controller' => 'Home', 'action' => 'bar']);

// Lupa2024
$router->add('fruteria/', ['controller' => 'Home', 'action' => 'fruteria']);
$router->add('carniceria/', ['controller' => 'Home', 'action' => 'carniceria']);
$router->add('pescaderia/', ['controller' => 'Home', 'action' => 'pescaderia']);
$router->add('healthy/', ['controller' => 'Home', 'action' => 'healthy']);
$router->add('horno/', ['controller' => 'Home', 'action' => 'horno']);
$router->add('quesería/', ['controller' => 'Home', 'action' => 'queseria']);
$router->add('despensa/', ['controller' => 'Home', 'action' => 'despensa']);

// Lupa 2025
$router->add('desayuno/', ['controller' => 'Home', 'action' => 'desayuno']);
$router->add('salsas/', ['controller' => 'Home', 'action' => 'salsas']);
$router->add('lácteos/', ['controller' => 'Home', 'action' => 'lacteos']);
$router->add('merienda/', ['controller' => 'Home', 'action' => 'merienda']);
$router->add('platospreparados/', ['controller' => 'Home', 'action' => 'platos-preparados']);
$router->add('registro/', ['controller' => 'Home', 'action' => 'registro']);
$router->add('slider/', ['controller' => 'Home', 'action' => 'slider']);


$router->add('politica-de-privacidad/', ['controller' => 'Home', 'action' => 'politicadeprivacidad']);
$router->add('politica-de-cookies/', ['controller' => 'Home', 'action' => 'politicadecookies']);
$router->add('aviso-legal/', ['controller' => 'Home', 'action' => 'avisolegal']);

$router->add('procesar-formulario/', ['controller' => 'Formularios', 'action' => 'procesar']);
$router->add('ajax-formulario/', ['controller' => 'Formularios', 'action' => 'ajax']);


$router->add('tester/', ['controller' => 'Home', 'action' => 'tester']);


/**
 Panel de administracion
 **/
$router->add('admin-2024/', ['controller' => 'Admin', 'action' => 'indexadmin']);
$router->add('iniciar-sesion/', ['controller' => 'Admin', 'action' => 'login']);
$router->add('admin-2023/salir/', ['controller' => 'Admin', 'action' => 'salir']);
$router->add('panel/', ['controller' => 'Admin', 'action' => 'panel']);
$router->add('crear-tablas/', ['controller' => 'CreateTables', 'action' => 'create']);

if(CHANGEPASSWORD == true){
    $router->add('cambiar-password/', ['controller' => 'Admin', 'action' => 'changepassword']);
}




$router->add('{controller}/{action}/');

try {
    $router->dispatch($_SERVER['QUERY_STRING']);
} catch (Exception $e) {
    $code = $e->getCode() ?: 500;
    $viewPath = dirname(__DIR__) . '/App/Views/' . $code . '.html';

    if (file_exists($viewPath)) {
        http_response_code($code);
        readfile($viewPath);
    } else {
        // Si el archivo no existe, muestra un mensaje simple
        echo "<h1>Error $code</h1><p>Ha ocurrido un error.</p>";
    }
    exit();

}
