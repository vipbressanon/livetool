<?php
return [
    'auth' => 'users',                                      // auth认证
    'domainurl' => 'https://zjclass.xueyoubangedu.com',     // 网站地址
    'socketurl' => env('SOCKETURL'),                        // socket地址
    'loginurl' => '/live/login',                            // 登录地址
    'fileurl' => '/course/file/save',                       // 课件上传地址
    'fileurl_delete' => '/course/file/delete',              // 课件删除地址
    'intervaltime' => 600,                                  // 结算的间隔时间,单位秒
    'fee' => -200,                                          // 欠费达到指定金额,停止直播,单位元
    'fate' =>   0.0067 ,                                     //收费标准 （流/分钟）
    'error_status' => true,                                 // 是否记录错误信息
    'course' => [                                           // 课程表
        'table' => 'course',                                // 表名称
        'field' => [                                        // 字段名
            'id' => 'id',                                   // 编号
            'hash_id' => 'hash_id',                         // 课程hash
            'top_usersid' => 'top_usersid',                 // 顶级用户
            'team_id' => 'team_id',                         // 团队编号
            'title' => 'title',                             // 课程标题
            'type' => 'type',                               // 课程类型，1是标准课，2是公开课
            'teacher_id' => 'teacher_id',                   // 讲师编号
            'status' => 'islive',                           // 课程状态
            'expectstart' => 'expectstart',                 // 预计开始时间
            'expectend' => 'expectend',                     // 预计结束时间
            'starttime' => 'starttime',                     // 实际开始时间
            'expectendtime' => 'expectendtime',             // 根据实际开始时间 预计的实际结束时间
            'endtime' => 'endtime',                         // 实际结束时间
            'second' => 'second',                           // 课程耗时
            'invite_type' => 'invite_type',                 // 邀请方式
            'code_url' => 'code_url',                       // 二维码
            'up_top' => 'up_top',                           // 学生最大上台人数
            'down_top' => 'down_top',                       // 台下学生人数上限
            'created_at' => 'created_at',                   // 创建时间
            'updated_at' => 'updated_at'                    // 更新时间
        ]
    ],
    'course_users' => [                                     // 课程用户表
        'table' => 'course_users',                          // 表名称
        'field' => [                                        // 字段名
            'id' => 'id',                                   // 编号
            'team_id'=>'team_id',                           // 团队编号
            'course_id' => 'course_id',                     // 课程编号
            'room_id' => 'room_id',                         // 房间编号
            'users_id' => 'users_id',                       // 用户编号
            'zan' => 'zan',                                 // 点赞次数
            'speak' => 'speak',                             // 上台次数
            'hand' => 'hand',                               // 举手次数
            'platform' => 'platform',                       // 来源
            'created_at' => 'created_at',                   // 创建时间
            'updated_at' => 'updated_at'                    // 更新时间
        ]
    ],
    'course_users_log' => [                                 // 课程用户记录表
        'table' => 'course_users_log',                      // 表名称
        'field' => [                                        // 字段名
            'id' => 'id',                                   // 编号
            'course_id' => 'course_id',                     // 课程编号
            'room_id' => 'room_id',                         // 房间编号
            'users_id' => 'users_id',                       // 用户编号
            'starttime' => 'starttime',                     // 进入房间时间
            'balancetime' => 'balancetime',                 // 结算时的时间
            'endtime' => 'endtime',                         // 退出房间时间
            'total' => 'total',                             // 本次耗时
            'status' => 'status',                           // 用户是否在房间
            'created_at' => 'created_at',                   // 创建时间
            'updated_at' => 'updated_at'                    // 更新时间
        ]
    ],
    'course_record' => [
        'table' => 'course_record',                         // 表名称
        'field' => [                                        // 字段名
            'id' => 'id',                                   // 编号
            'course_id' => 'course_id',                     // 课程编号
            'room_id' => 'room_id',                         // 房间编号
            'team_id' => 'team_id',                         // 团队id
            'fileurl' => 'fileurl',                         // 文件路径
            'fileid'=> 'fileid',                            // 文件id
            'filesize' => 'filesize',                       // 文件大小 字节
            'filesize_m' => 'filesize_m',                   // 文件大小 M
            'status' => 'status',                           // 上传状态
            'file_type' => 'file_type',                     // 视频流类型
            'starttime' => 'starttime',                     // 开始录制时间
            'endtime' => 'endtime',                         // 结束录制时间
            'finish_reason' => 'finish_reason',             // 结束原因
            'file_duration' => 'file_duration',             // 视频时长
            'file_duration_str' => 'file_duration_str',     // 视频时长字符串 显示
            'created_at' => 'created_at',                   // 创建时间
            'updated_at' => 'updated_at'                    // 更新时间
        ]
    ],
    'course_errors' => [                                    // 课程报错记录表
        'table' => 'course_errors',                         // 表名称
        'field' => [                                        // 字段名
            'id' => 'id',                                   // 编号
            'course_id' => 'course_id',                     // 课程编号
            'room_id' => 'room_id',                         // 房间编号
            'users_id' => 'users_id',                       // 用户编号
            'platform' => 'platform',                       // 来源
            'type' => 'type',                               // 报错位置
            'contents' => 'contents',                       // 报错内容
            'created_at' => 'created_at',                   // 创建时间
            'updated_at' => 'updated_at'                    // 更新时间
        ]
    ],
    'users' => [                                            // 用户表
        'table' => 'users',                                 // 表名称
        'field' => [                                        // 字段名
            'id' => 'id',                                   // 编号
            'hash_id' => 'hash_id',                         // 用户hash
            'nickname' => 'nickname',                       // 昵称
            'imgurl' => 'imgurl'                            // 头像
        ]
    ],
    'users_from' => [                                       // 用户关系表
        'table' => 'users_from',                            // 表名称
        'field' => [                                        // 字段名
            'users_id' => 'users_id',                       // 用户id
            'team_id' => 'team_id',                         // 团队id
            'nickname' => 'nickname',                       // 昵称
            'display'=> 'display',                          // 状态
            'deleted_at' => 'deleted_at'
        ]
    ],
    'share' => [                                            // 课程分享视图
        'table' => 'view_course_share',                     // 视图名称
        'field' => [                                        // 字段名
            'id' => 'id',                                   // 编号
            'title' => 'title',                             // 课程名称
            'invite_type' => 'invite_type',                 // 邀请方式
            'content' => 'content'                          // 口令内容或白名单内容
        ]
    ],
    'white' => [                                            // 白名单视图
        'table' => 'view_course_white',                     // 视图名称
        'field' => [                                        // 字段名
            'course_id' => 'course_id',                     // 课程编号
            'users_id' => 'users_id',                       // 用户编号
            'type' => 'type'                                // 讲师或学生
        ]
    ],
    'team' => [                                             // 团队表
        'table' => 'team',                                  // 表名称
        'field' => [                                        // 字段名
            'id' => 'id',                                   // 编号
            'amount_money' => 'amount_money',               // 账户余额
            'amount_time' => 'amount_time',                 // 剩余分钟数
            'amount_play' => 'amount_play',                 // 剩余点播流量（M）
            'amount_space' => 'amount_space',               // 使用存储空间（M）
            'amount_space_z'=> 'amount_space_z',            // 存储容量
            'cash_id' => 'cash_id',                         // 收费套餐编号
            'created_at' => 'created_at',                   // 创建时间
            'updated_at' => 'updated_at'                    // 更新时间
        ]
    ],
    'cash_desc' => [                                        // 收费单价表
        'table' => 'cash_desc',                             // 表名称
        'field' => [                                        // 字段名
            'id' => 'id',                                   // 编号
            'live' => 'live'                                // 直播单价
        ]
    ],
    'orders' => [                                           // 收费单价表
        'table' => 'orders',                                // 表名称
        'field' => [                                        // 字段名
            'id' => 'id',                                   // 编号
            'team_id' => 'team_id',                         // 团队编号
            'top_usersid' => 'top_usersid',                 // 超管编号
            'course_id' => 'course_id',                     // 课程编号
            'consume_money' => 'consume_money',             // 消耗的账户余额
            'consume_time' => 'consume_time',               // 消耗的剩余分钟
            'consume_play' => 'consume_play',               // 消耗的剩余点播
            'consume_space' => 'consume_space',             // 消耗的剩余空间数
            'created_at' => 'created_at',                   // 创建时间
            'updated_at' => 'updated_at'                    // 更新时间
        ]
    ],
    'orders_log' => [                                       // 订单记录表
        'table' => 'orders_log',                            // 表名称
        'field' => [                                        // 字段名
            'id' => 'id',                                   // 编号
            'team_id' => 'team_id',                         // 团队编号
            'course_id' => 'course_id',                     // 课程编号
            'from' => 'from',                               // 消耗来源
            'consume' => 'consume',                         // 消耗套餐分钟数
            'consume_money' => 'consume_money',             // 消耗账户余额
            'price' => 'price',                             // 单价
            'consume_z' => 'consume_z',                     // 总耗时
            'amount_money' => 'amount_money',               // (后)账户余额(充值)
            'amount_time' => 'amount_time',                 // (后)剩余分钟数（分
            'amount_play' => 'amount_play',                 // (后)剩余点播（M）
            'amount_space' => 'amount_space',               // (后)空间数 (M) 剩余
            'created_at' => 'created_at',                   // 创建时间
            'updated_at' => 'updated_at'                    // 更新时间
        ]
    ],
    'orders_space_log' => [                                 // 订单空间消耗记录表
        'table' => 'orders_space_log',                      // 表名称
        'field' => [                                        // 字段名
            'id' => 'id',                                   // 编号
            'team_id' => 'team_id',                         // 团队编号
            'course_id' => 'course_id',                     // 课程编号
            'course_record_id' => 'course_record_id',       // 录制文件来源
            'type' => 'type',                               // 类型 1消耗 2收入(退费)
            'consume_z' => 'consume_z',                     // 总耗时
            'amount_money' => 'amount_money',               // (后)账户余额(充值)
            'amount_time' => 'amount_time',                 // (后)剩余分钟数（分
            'amount_play' => 'amount_play',                 // (后)剩余点播（M）
            'amount_space' => 'amount_space',               // (后)空间数 (M) 剩余
            'created_at' => 'created_at',                   // 创建时间
            'updated_at' => 'updated_at'                    // 更新时间
        ]
    ],
    'usersinfo' => [                                        // 课程用户信息表
        'table' => 'view_course_usersinfo',                 // 表名称
        'field' => [                                        // 字段名
            'room_id' => 'room_id',                         // 房间编号
            'users_id' => 'users_id',                       // 用户编号
            'zan' => 'zan',                                 // 点赞数
            'platform' => 'platform',                       // 来源
            'nickname' => 'nickname',                       // 用户昵称
            'imgurl' => 'imgurl',                           // 用户头像
            'hash_id' => 'hash_id'                          // 用户哈希编号
        ]
    ],
    'api' => [                                              // 接口控制台
        'url' => 'http://zjadmin.xueyoubangedu.com',        // 访问地址
        'appid' => env('ZJADMIN_APPID'),                    // 分配的项目编号
        'secret' => env('ZJADMIN_SECRET')                   // 分配的项目密码
    ]
];