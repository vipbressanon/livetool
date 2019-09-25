<?php

namespace Vipbressanon\LiveTool;

use Illuminate\Support\ServiceProvider;

class LiveToolServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap the application services.
     *
     * @return void
     */
    public function boot()
    {
        $this->loadRoutesFrom(__DIR__.'/routes.php');           // 路由
        $this->loadMigrationsFrom(__DIR__.'/Database');         // 数据库
        $this->loadViewsFrom(__DIR__ . '/views', 'lcview');  // 视图
        $this->publishes([
            __DIR__.'/Views' => base_path('resources/views/vendor/livetool'),      // 发布视图
            __DIR__.'/Config/livetool.php' => config_path('livetool.php'),        // 发布配置文件
            __DIR__.'/Assets' => public_path('vendor/livetool'),                   // 发布js,css文件
        ]);
    }

    /**
     * Register the application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }
}
