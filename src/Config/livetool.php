<?php
return [
    'auth' => 'users',                                      // auth认证
    'domainurl' => 'https://zjclass.xueyoubangedu.com',     // 网站地址
    'socketurl' => 'http://localhost:2120',                 // socket地址
    'loginurl' => '/live/login',                            // 登录地址
    'fileurl' => '/course/file/save',                       // 课件上传地址
    'error_status' => true,                                 // 是否记录错误信息
    'course' => [                                           // 课程表
        'table' => 'course',                                // 表名称
        'field' => [                                        // 字段名
            'id' => 'id',                                   // 编号
            'hash_id' => 'hash_id',                         // 课程hash
            'top_usersid' => 'top_usersid',                 // 顶级用户
            'title' => 'title',                             // 课程标题
            'teacher_id' => 'teacher_id',                   // 讲师编号
            'status' => 'islive',                           // 课程状态
            'expectstart' => 'expectstart',                 // 预计开始时间
            'starttime' => 'starttime',                     // 实际开始时间
            'endtime' => 'endtime',                         // 实际结束时间
            'second' => 'second',                           // 课程耗时
            'invite_type' => 'invite_type',                 // 邀请方式
            'created_at' => 'created_at',                   // 创建时间
            'updated_at' => 'updated_at'                    // 更新时间
        ]
    ],
    'course_users' => [                                     // 课程用户表
        'table' => 'course_users',                          // 表名称
        'field' => [                                        // 字段名
            'id' => 'id',                                   // 编号
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
            'endtime' => 'endtime',                         // 退出房间时间
            'total' => 'total',                             // 本次耗时
            'status' => 'status',                           // 用户是否在房间
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
    'course_word' => [                                      // 课程口令表
        'table' => 'course_word',                           // 表名称
        'field' => [                                        // 字段名
            'id' => 'id',                                   // 编号
            'course_id' => 'course_id',                     // 课程编号
            'word' => 'word',                               // 口令内容
            'type' => 'type'                                // 讲师或学生
        ]
    ],
    'course_word_white' => [                                // 课程口令白名单表
        'table' => 'course_word_white',                     // 表名称
        'field' => [                                        // 字段名
            'id' => 'id',                                   // 编号
            'course_id' => 'course_id',                     // 课程编号
            'users_id' => 'users_id',                       // 用户编号
            'created_at' => 'created_at',                   // 创建时间
            'updated_at' => 'updated_at'                    // 更新时间
        ]
    ],
    'api' => [                                              // 接口控制台
        'url' => 'http://zjadmin.xueyoubangedu.com',        // 访问地址
        'appid' => 'PQGjEey4eNbzkW2',                       // 分配的项目编号
        'secret' => 'zu0u56D62jwJMlUTuyMARhkAL8oWMv'        // 分配的项目密码
    ]
];