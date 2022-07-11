<?php

namespace OCA\DrawioWhiteboard;

use OCA\DrawioWhiteboard\AppInfo\Application;


User::checkAdminUser();

$app = new Application();
$container = $app->getContainer();
$response = $container->query("\OCA\DrawioWhiteboard\Controller\SettingsController")->index();

return $response->render();
