<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Laravel</title>
    </head>
    <body>
        <!--可以直接引入视图中的其他文件-->
        @include('lcview::message')
        <div>
            您的ip地址是：123123
        </div>
        <div>
            当前时间是：1231321
        </div>
    </body>
</html>