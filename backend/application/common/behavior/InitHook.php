<?php
namespace app\common\behavior;

class InitHook {

	public function run(&$request) {
		$this->appInit();
	}

	public function appInit(&$params)
    {
    	header('Access-Control-Allow-Origin: *');
		header("Content-type:text/html;charset=utf-8");
		header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, token");
		header('Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS');

        if(request()->isOptions()){
            exit();
        }
    }
}