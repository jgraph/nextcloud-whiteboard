<?php

/**
 *
 * @author Pawel Rojek <pawel at pawelrojek.com>
 * @author Ian Reinhart Geiser <igeiser at devonit.com>
 *
 * This file is licensed under the Affero General Public License version 3 or later.
 *
 **/

namespace OCA\DrawioWhiteboard\AppInfo;

use OCP\AppFramework\App;
use OCP\Util;

use OCA\DrawioWhiteboard\AppConfig;
use OCA\DrawioWhiteboard\Controller\DisplayController;
use OCA\DrawioWhiteboard\Controller\EditorController;
use OCA\DrawioWhiteboard\Controller\ViewerController;
use OCA\DrawioWhiteboard\Controller\SettingsController;

class Application extends App {

    public $appConfig;

    public function __construct(array $urlParams = [])
    {
        $appName = "drawiowhiteboard";

        parent::__construct($appName, $urlParams);

        $this->appConfig = new AppConfig($appName);


        // Default script and style if configured
        if (!empty($this->appConfig->GetDrawioUrl()) && array_key_exists("REQUEST_URI", \OC::$server->getRequest()->server))
        {
            $url = \OC::$server->getRequest()->server["REQUEST_URI"];

            if (isset($url)) {
                if (preg_match("%/apps/files(/.*)?%", $url)) {
                    Util::addScript($appName, "main");
                    Util::addStyle($appName, "main");
                }
            }
        }
        // Default script and style if configured
        $eventDispatcher = \OC::$server->getEventDispatcher();

        $eventDispatcher->addListener("OCA\Files_Sharing::loadAdditionalScripts",
            function() {
                if (!empty($this->appConfig->GetDrawioUrl()) && array_key_exists("REQUEST_URI", \OC::$server->getRequest()->server) ) {
                    Util::addScript($this->appConfig->GetAppName(), "main");
                    Util::addStyle($this->appConfig->GetAppName(), "main");
                }
            });

        $container = $this->getContainer();

        $container->registerService("L10N", function($c)
        {
            return $c->query("ServerContainer")->getL10N($c->query("AppName"));
        });

        $container->registerService("RootStorage", function($c)
        {
            return $c->query("ServerContainer")->getRootFolder();
        });

        $container->registerService("UserSession", function($c)
        {
            return $c->query("ServerContainer")->getUserSession();
        });

        $container->registerService("Logger", function($c)
        {
            return $c->query("ServerContainer")->getLogger();
        });


        $container->registerService("SettingsController", function($c)
        {
            return new SettingsController(
                $c->query("AppName"),
                $c->query("Request"),
                $c->query("L10N"),
                $c->query("Logger"),
                $this->appConfig
            );
        });


        $container->registerService("EditorController", function($c)
        {
            return new EditorController(
                $c->query("AppName"),
                $c->query("Request"),
                $c->query("RootStorage"),
                $c->query("UserSession"),
                $c->query("ServerContainer")->getURLGenerator(),
                $c->query("L10N"),
                $c->query("Logger"),
                $this->appConfig,
                $c->query("IManager"),
                $c->query("Session")
            );
        });
        
        $container->registerService("ViewerController", function($c)
        {
            return new ViewerController(
                $c->query("AppName"),
                $c->query("Request"),
                $c->query("RootStorage"),
                $c->query("UserSession"),
                $c->query("ServerContainer")->getURLGenerator(),
                $c->query("L10N"),
                $c->query("Logger"),
                $this->appConfig,
                $c->query("IManager"),
                $c->query("Session")
            );
        });        
    }
}
