<?php
return [
    'auth' => 'users',
    'socketurl' => 'http://localhost:2120',
    'course' => [
        'table' => 'course',
        'field' => [
            'id' => 'id',
            'hash_id' => 'hash_id',
            'title' => 'title',
            'teacher_id' => 'teacher_id',
            'status' => 'islive',
            'expectstart' => 'expectstart',
            'starttime' => 'starttime',
            'endtime' => 'endtime',
            'second' => 'second',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at'
        ]
    ],
    'course_users' => [
        'table' => 'course_users',
        'field' => [
            'id' => 'id',
            'course_id' => 'course_id',
            'room_id' => 'room_id',
            'users_id' => 'users_id',
            'zan' => 'zan',
            'speak' => 'speak',
            'hand' => 'hand',
            'platform' => 'platform',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at'
        ]
    ],
    'course_users_log' => [
        'table' => 'course_users_log',
        'field' => [
            'id' => 'id',
            'course_id' => 'course_id',
            'room_id' => 'room_id',
            'users_id' => 'users_id',
            'starttime' => 'starttime',
            'endtime' => 'endtime',
            'total' => 'total',
            'status' => 'status',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at'
        ]
    ],
    'course_file' => [
        'table' => 'course_file',
        'field' => [
            'id' => 'id',
            'course_id' => 'course_id',
            'top_usersid' => 'top_usersid',
            'filename' => 'filename',
            'domain' => 'domain',
            'fileurl' => 'fileurl',
            'filesize' => 'filesize',
            'filesuffix' => 'filesuffix',
            'status' => 'status',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at'
        ]
    ],
    'course_errors' => [
        'table' => 'course_errors',
        'field' => [
            'id' => 'id',
            'course_id' => 'course_id',
            'room_id' => 'room_id',
            'users_id' => 'users_id',
            'platform' => 'platform',
            'type' => 'type',
            'contents' => 'contents',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at'
        ]
    ],
    'users' => [
        'table' => 'users',
        'field' => [
            'id' => 'id',
            'hash_id' => 'hash_id',
            'nickname' => 'nickname',
            'imgurl' => 'imgurl'
        ]
    ],
    'api' => [
        'url' => 'http://zjadmin.xueyoubangedu.com',
        'appid' => 'PQGjEey4eNbzkW2',
        'secret' => 'zu0u56D62jwJMlUTuyMARhkAL8oWMv'
    ]
];