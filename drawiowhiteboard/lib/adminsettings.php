<?php

/**
 *
 * @author Pawel Rojek <pawel at pawelrojek.com>
 * @author Ian Reinhart Geiser <igeiser at devonit.com>
 *
 * This file is licensed under the Affero General Public License version 3 or later.
 *
 **/

namespace OCA\DrawioWhiteboard;

use OCP\Settings\ISettings;

use OCA\DrawioWhiteboard\AppInfo\Application;


class AdminSettings implements ISettings {

    public function __construct()
    {
    }

    public function getForm()
    {
        $app = new Application();
        $container = $app->getContainer();
        $response = $container->query("\OCA\DrawioWhiteboard\Controller\SettingsController")->index();
        return $response;
    }

    public function getSection()
    {
        return "additional";
    }

    public function getPriority()
    {
        return 60;
    }
}
