# livetool

## 安装

1. 请使用composer安装直播插件。

```shell
composer require vipbressanon/livetool
```

2. 安装直播插件依赖phpsocketio。

```shell
composer require workerman/phpsocket.io
```

## 配置

1. 在 `config/app.php` 注册 ServiceProvider 和 Facade (Laravel 5.5 + 无需手动注册)。
```php
'providers' => [
    // ...
    Vipbressanon\LiveTool\LiveToolServiceProvider::class,
],
'aliases' => [
    // ...
    'LiveTool' => Vipbressanon\LiveTool\Facades\LiveTool::class,
],
```

2. 发布视图，样式，脚本，配置等文件：
```shell
php artisan vendor:publish --provider="Vipbressanon\LiveTool\LiveToolServiceProvider"
```

3. 复制根目录.env.example到根目录并改名为.env，连接数据库。
```php
DB_CONNECTION=mysql
DB_HOST=***
DB_PORT=3306
DB_DATABASE=***
DB_USERNAME=***
DB_PASSWORD=***
```

4. 导入直播相关数据表结构。
```shell
php artisan migrate:refresh
```

5. 在 `App\Console\Kernel.php` 文件中，`$commands` 加入：
```php
protected $commands = [
    // ...
    \Vipbressanon\LiveTool\Commands\MsgPush::class
];
```

6. 打开项目根目录下的命令行，执行：
```shell
php artisan wk start
```