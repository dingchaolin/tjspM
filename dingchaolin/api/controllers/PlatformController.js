/**
 * PlatformController
 *
 * @description :: Server-side logic for managing platforms
 * @help        :: See http://links.sailsjs.org/docs/controllers
 * 全平台模块
 */
var request = require('request');
var moment = require('moment');
var async = require('async');
var chartRoomList = [];
module.exports = {
    GetAdInfo: function (req, res) {
        var data = {};
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/zj_ad_find';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log(err);
                    var result = JSON.parse(body);
                    for (var i = 0; i < result.msg.length; i++) {
                        result.msg[i].ad_addtime = moment(+result.msg[i].ad_addtime * 1000).format('YYYY-MM-DD, hh:mm:ss');
                        result.msg[i].ad_updatetime = moment(+result.msg[i].ad_updatetime * 1000).format('YYYY-MM-DD, hh:mm:ss');
                    }
                    return res.view('ad/adList', {
                        username: req.session.username,
                        usertype: req.session.usertype,
                        ads: result.msg || [],
                        total_pages: result.sum,
                        current_page: result.current_page
                    });

                } catch (ex) {
                    console.log(ex);
                }
            }
        );
    },
    GetAdInfoJson: function (req, res) {
        var data = {};
        data.adname = req.param('titlename') || '';
        data.current_page = (+req.param('current_page') + 1) || 1;
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/zj_ad_find';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {

                try {
                    if (err) console.log(err);
                    var result = JSON.parse(body);
                    for (var i = 0; i < result.msg.length; i++) {
                        result.msg[i].ad_addtime = moment(+result.msg[i].ad_addtime * 1000).format('YYYY-MM-DD, hh:mm:ss');
                        result.msg[i].ad_updatetime = moment(+result.msg[i].ad_updatetime * 1000).format('YYYY-MM-DD, hh:mm:ss');
                    }
                    return res.json({
                        username: req.session.username,
                        usertype: req.session.usertype,
                        ads: result.msg || [],
                        total_pages: result.sum,
                        current_page: result.current_page
                    });
                } catch (ex) {
                    console.log(ex);
               }
            }
        );
    },
    GetAddAdPage: function (req, res) {
        return res.view('ad/adAdd', {
            username: req.session.username,
            usertype: req.session.usertype,
            error: req.param('error') || '',
            success: req.param('success') || ''
        });
    },
    AddAdInfo: function (req, res) {
        var data = req.body;
        data.ad_uid = req.session.c_id || 0;
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/zj_ad_add';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, result) {
                try {
                    if (err) console.log(err);
                    var result_json = JSON.parse(result || {status: 'no'});
                    return res.json(result_json);
                } catch (ex) {
                    console.log(ex);
                }
            }
        );
    },
    DeleteAdInfo: function (req, res) {
        var data = {};
        data.ad_id = req.param('ad_id');
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/zj_ad_detele';
        collector.log(req, req.session.c_id, req.session.username, JSON.stringify(data));
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, result) {
                try {
                    if (err) console.log(err);
                    var result_json = JSON.parse(result);
                    return res.json(result_json);
                } catch (ex) {
                    console.log(ex);
                }
            }
        );
    }, CloseAdInfo: function (req, res) {

        var data = {};
        data.ad_id = req.param('ad_id');
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/zj_ad_colse';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, result) {
                try {
                    if (err) console.log(err);
                    var result_json = JSON.parse(result);
                    return res.json(result_json);
                } catch (ex) {
                    console.log(ex);
                }
            }
        );
    }, OpenAdInfo: function (req, res) {
        try {
            var data = {};
            data.ad_id = req.param('ad_id');
            async.waterfall([
                function (callback) {
                    var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/zj_ad_colse_history';
                    request.post({url: url, form: JSON.stringify(data)},
                        function (err, httpResponse, result) {
                            if (err) console.log(err);
                            var colse_json = JSON.parse(result);
                            return callback(null, colse_json)
                        }
                    );
                },
                function (colseResult, callback) {
                    if ('ok' == colseResult.status) {
                        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/zj_ad_open';
                        request.post({url: url, form: JSON.stringify(data)},
                            function (err, httpResponse, result) {

                                if (err) console.log(err);
                                var open_json = JSON.parse(result);
                                return callback(null, open_json)

                            }
                        );
                    } else {
                        return callback(null, colseResult)
                    }
                }
            ], function (err, result) {
                if (err) console.log(err);
                return res.json(result);
            });
        } catch (ex) {
            console.log(ex);
        }
    }
    ,
    /**
     *  礼包领取统计功能实现
     * **/
    GetGiftStatistics: function (req, res) {
        var startTime = req.param('find_starttime') || 0;
        var endTime = req.param('find_endtime') || 9999999999;
        var findName = req.param('find_roomname');
        var type = req.param('type');
        var current_page = (+req.param('current_page') + 1) || 1;
        var data = {
            "find_starttime": +startTime,
            "find_endtime": +endTime,
            "find_roomname": findName,
            "current_page": current_page
        };
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/zj_gift_statistics';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (!!err) {
                        console.log(err)
                    }
                    var result = JSON.parse(body);
                    if ('json' == type) {
                        return res.json({
                            username: req.session.username,
                            usertype: req.session.usertype,
                            giftInfo: result.msg || [],
                            total_pages: result.sum,
                            current_page: result.current_page
                        });
                    } else {
                        return res.view('statistics/giftStatistics', {
                            username: req.session.username,
                            usertype: req.session.usertype,
                            giftInfo: result.msg || [],
                            total_pages: result.sum,
                            current_page: result.current_page
                        });
                    }

                } catch (ex) {
                    console.log(ex);
                }
            }
        );
    }
    ,
    /**
     * 礼包领取统计导出信息
     * **/
    GetGiftStatisticsExcel: function (req, res) {
        var startTime = req.param('find_starttime') || 0;
        var endTime = req.param('find_endtime') || 9999999999;
        var findName = req.param('find_roomname');
        var data = {
            "find_starttime": +startTime,
            "find_endtime": +endTime,
            "find_roomname": findName,
            'timeout': 5000
        };
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/zj_gift_statistics_export';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (!!err) {
                        console.log(err)
                    }
                    var result = JSON.parse(body);
                    var cols = [
                        {caption: '房间hash', type: 'string'},
                        {caption: '房间名称', type: 'string'},
                        {caption: '上传数量', type: 'number'},
                        {caption: '下载数量', type: 'number'}
                    ]
                        , rows = collector.ObjTOArray(result);
                    var result = collector.excel(cols, rows);
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                    res.setHeader("Content-Disposition", "attachment; filename=" + "GiftStatistics.xlsx");
                    res.end(result, 'binary');

                } catch (ex) {
                    console.log(ex);
                }
            }
        );
    }
    ,
    /** 全平台礼包上传功能 **/
    GetGiftAddPage: function (req, res) {

        return res.view('statistics/GiftAdd', {
            username: req.session.username,
            usertype: req.session.usertype,
            error: req.param('error') || '',
            success: req.param('success') || ''
        });
    }
    ,
    AddGiftInfo: function (req, res) {
        var data = req.body;
        var timestamp = (Date.parse(new Date(data.gift_time)) / 1000);
        data.gift_time = timestamp;
        data.gift_c_hash = sails.config.platform_gift_hash || 'tjspplatformgifthash';
        data.gift_uid = req.session.c_id || 0;
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/zn_gift_add';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, result) {
                try {
                    if (err) console.log(err);
                    var result_json = JSON.parse(result);
                    return res.json(result_json);

                } catch (ex) {
                    console.log(ex);
                }
            }
        );
    }
    ,
    GetGiftInfo: function (req, res) {
        var data = {};
        data.gift_c_hash = sails.config.platform_gift_hash || 'tjspplatformgifthash';
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/zn_gift_list';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log(err);
                    var result = JSON.parse(body);
                    for (var i = 0; i < result.length; i++) {
                        result[i].gift_addtime = moment(+result[i].gift_addtime * 1000).format('YYYY-MM-DD, hh:mm:ss');
                        result[i].gift_time = moment(+result[i].gift_time * 1000).format('YYYY-MM-DD, hh:mm:ss');
                    }
                    return res.view('statistics/GiftList', {
                        username: req.session.username,
                        usertype: req.session.usertype,
                        gifts: result || []
                    });
                } catch (ex) {
                    console.log(ex);
                }
            }
        );
    }
    ,
    DeleteGifoInfo: function (req, res) {
        var data = {};
        data.gift_id = req.param('gift_id');
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/zn_gift_delete';
        collector.log(req, req.session.c_id, req.session.username, JSON.stringify(data));
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, result) {
                try {
                    if (err) console.log(err);
                    var result_json = JSON.parse(result);
                    return res.json(result_json);
                } catch (ex) {
                    console.log(ex);
                }
            }
        );
    }
    ,
    /**
     *  平台礼包领取统计功能实现
     * **/
    GetGiftOfficial: function (req, res) {
        var myDate = new Date();
        var stime = myDate.getFullYear() + "/" + (myDate.getMonth() + 1) + "/" + myDate.getDate();
        var etime = myDate.getFullYear() + "/" + (myDate.getMonth() + 1) + "/" + (myDate.getDate() + 1) + ' 23:59:59';
        if (myDate.getDate() + 1 > 31) {
            etime = myDate.getFullYear() + "/" + (myDate.getMonth() + 2) + "/" + 1 + ' 23:59:59';
        }
        var start = new Date(Date.parse(stime)).getTime() / 1000;
        var end = new Date(Date.parse(etime)).getTime() / 1000;
        var startTime = req.param('find_starttime') || start;
        var endTime = req.param('find_endtime') || end;
        var type = req.param('type');
        var data = {
            "find_starttime": +startTime,
            "find_endtime": +endTime
        };
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/zj_gift_Official';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (!!err) {
                        console.log(err)
                    }
                    var result = JSON.parse(body);
                    if ('json' == type) {
                        return res.json({
                            username: req.session.username,
                            usertype: req.session.usertype,
                            giftInfo: result
                        });
                    }
                    return res.view('statistics/giftOfficial', {
                        username: req.session.username,
                        usertype: req.session.usertype,
                        giftInfo: result
                    });
                } catch (ex) {
                    console.log(ex);
                }
            }
        );
    }
    ,
    /**
     * 平台礼包领取统计导出信息
     * **/
    GetGiftOfficialExcel: function (req, res) {
        var myDate = new Date();
        var stime = myDate.getFullYear() + "/" + (myDate.getMonth() + 1) + "/" + myDate.getDate();
        var etime = myDate.getFullYear() + "/" + (myDate.getMonth() + 1) + "/" + (myDate.getDate() + 1) + ' 23:59:59';
        if (myDate.getDate() + 1 > 31) {
            etime = myDate.getFullYear() + "/" + (myDate.getMonth() + 2) + "/" + 1 + ' 23:59:59';
        }
        var start = new Date(Date.parse(stime)).getTime() / 1000;
        var end = new Date(Date.parse(etime)).getTime() / 1000;
        var startTime = req.param('find_starttime') || start;
        var endTime = req.param('find_endtime') || end;
        var data = {
            "find_starttime": +startTime,
            "find_endtime": +endTime,
            'timeout': 5000
        };
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/zj_gift_Official';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (!!err) {
                        console.log(err)
                    }
                    var result = JSON.parse(body);
                    var giftInfo = [
                        {'name': '平台礼包', 'up_num': result.update_gift_num, 'do_wn': result.download_gift_num}
                    ];
                    var cols = [
                        {caption: '名称', type: 'string'},
                        {caption: '上传数量', type: 'number'},
                        {caption: '下载数量', type: 'number'}
                    ]
                        , rows = collector.ObjTOArray(giftInfo);
                    var result = collector.excel(cols, rows);
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                    res.setHeader("Content-Disposition", "attachment; filename=" + "GiftOfficialExcel.xlsx");
                    res.end(result, 'binary');
                } catch (ex) {
                    console.log(ex);
                }
            }
        );
    }
    ,
    /**
     * 房间添加营销QQ功能
     * **/
    marketingQQaddGet: function (req, res) {
        var data = {};
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_room_list';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    chartRoomList = JSON.parse(body);
                    if (err) console.log(err);
                    return res.view('marketing/marketingQQadd', {
                        error: req.param('error') || '',
                        usertype: req.session.usertype,
                        username: req.session.username,
                        error: '',
                        success: '',
                        data: JSON.parse(body)
                    });
                } catch (ex) {
                    console.log(ex);
                }
            }
        );
    }
    ,
    addmarketingQQaddPost: function (req, res) {
        try {
            var data = {};
            data.c_hash = req.body.c_hash || req.param('c_hash');
            data.c_chatroom_name = req.body.c_chatroom_name || req.param('c_charroom_name');
            data.c_text = req.body.r_text || req.param('r_text');
            if( req.param('c_type').trim() == "旧营销脚本" ){
                data.type = 0;
            }
            else {
                data.type = 1;
            }
            console.log(data);
            if (data.c_hash) {
                async.waterfall([
                    function (callback) {
                        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_marketingQQ_update';
                        request.post({url: url, form: JSON.stringify(data)},
                            function (err, httpResponse, body) {
                                if (err) console.log(err);
                                return callback(null, body);
                            }
                        );
                    },
                    function (status, callback) {
                        if (JSON.parse(status)) {
                            var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/zj_marketingQQ_add';
                            request.post({url: url, form: JSON.stringify(data)},
                                function (err, httpResponse, body) {
                                    console.log(body);
                                    if (err) console.log(err);
                                    return callback(null, {ok: true});
                                }
                            );
                        } else {
                            return callback(null, {ok: false});
                        }
                    }
                ], function (err, result) {
                    if (err) {
                        throw err;
                    } else {
                        return res.redirect('/platform/indexGet');
                    }
                });
            } else {
                return res.redirect('/platform/indexGet');
            }

        } catch (ex) {
            console.log(ex);
        }
    }
    ,
    /**
     * 聊天历史记录删除
     ***/
    chatInfoDel: function (req, res) {
        return res.view('statistics/chatPage', {
            error: req.param('error') || '',
            usertype: req.session.usertype,
            username: req.session.username
        });
    }
    ,
    delUserChat: function (req, res) {
        var data = {};
        data.c_hash = req.param('c_hash') || '';
        data.c_name = req.param('c_name') || '';
//      console.log(data);
        collector.log(req, req.session.c_id, req.session.username, JSON.stringify(data));
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/zj_chatlog_detele';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
//                console.log(body)
                if (err) console.log(err);
                return res.json({"status": "ok"});
            }
        );
    }
    ,
    /**
     * 营销QQ首页
     * @param req
     * @param res
     */
    indexGet: function (req, res) {
        //get请求
        var data = {};
        data.current_page = (+req.param('current_page') + 1) || 1;
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_marketingQQ_query';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log(err);
                    var result = JSON.parse(body);
                    return res.view('marketing/marketingQQlist', {
                        username: req.session.username,
                        usertype: req.session.usertype,
                        data: result.info || [],
                        total_pages: result.num,
                        current_page: result.current_page
                    });
                } catch (ex) {
                    console.log(ex);
                }
            }
        );
    }
    ,
    indexPost: function (req, res) {
        //post请求
        var data = {};
        data.current_page = (+req.param('current_page') + 1) || 1;
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_marketingQQ_query';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log(err);
                    var result = JSON.parse(body);
                    return res.json({
                        username: req.session.username,
                        usertype: req.session.usertype,
                        data: result.info || [],
                        total_pages: result.num,
                        current_page: result.current_page
                    });
                } catch (ex) {
                    console.log(ex);
                }
            }
        );
    }
    ,
    /**
     * 删除推广单条记录
     */
    indexDel: function (req, res) {
        var hash = req.param('hash');
        var data = {};
        data.c_hash = hash;
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_marketingQQ_delete';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                if (err) {
                    return res.json({"msg": "error"});
                } else {
                    return res.json({"msg": "ok"});
                }
            }
        )
    }
    ,
    /**
     * 处理结果工厂负责循环结果集，来匹配关键字
     * @param req
     * @param res
     */
    queryFactory: function (req, res) {
        try {
            var keyword = req.param('k');
            var queryList = [];
            var hashList = [];
            for (var i = 0; i < chartRoomList.length; i++) {
                var thisChatN = chartRoomList[i].c_chatroom_name;
                if (!!thisChatN && thisChatN.indexOf(keyword) >= 0) {
                    queryList.push(chartRoomList[i]);
                }
            }
            res.json({queryList: queryList});
        } catch (ex) {
            console.log(ex);
        }
    }
    ,
    //营销QQ列表页，模糊查询
    GetMkQQInfoJson: function (req, res) {
        var data = {};
        data.c_chatroom_name = req.param('keyword');
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_like_query';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                if (err) {
                    return res.json({"msg": "error"});
                } else {
                    return res.json({result: body});
                }
            }
        )
    }
    ,
    //营销QQ列表页，刷新房间名称
    refreshMkQQInfoJson: function (req, res) {
        var data = {};
        data.c_chatroom_name = req.param('keyword');
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_like_query';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                if (err) {
                    return res.json({"msg": "error"});
                } else {
                    return res.json({result: body});
                }
            }
        )
    }
    ,

    /***
     * 统计用户客户端类型
     * @param req
     * @param res
     * @constructor
     */
    CountUser: function (req, res) {
        var data = {};
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_version_query';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                var result = JSON.parse(body);
                console.log(result);
                if (err) {
                    return res.json({"msg": "error"});
                } else {
                    return res.view('userCount/index.ejs',{
                        username: req.session.username,
                        usertype: req.session.usertype,
                        result: result,
                        total_pages: result||[],
                        current_page: result.current_page
                    });
                }
            }
        )
    },
    /***
     * 用户统计添加时间查询
     * @param req
     * @param res
     * @constructor
     */
    CountUserPost: function (req, res) {
        var data = {};
        data.find_starttime = req.param('find_starttime');
        data.find_endtime = req.param('find_endtime');
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_version_query';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                var result = JSON.parse(body);
                if (err) {
                    return res.json({"msg": "error"});
                } else {
                    return res.json({
                        username: req.session.username,
                        usertype: req.session.usertype,
                        result: result
                    });
                }
            }
        )
    },
    /**
     * 房间受限列表GET请求
     * **/
    roomVerifyList: function (req, res) {
        var data = {};
        data.current_page = (+req.param('current_page') + 1) || 1;
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_roomManage_query';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                chartRoomList = JSON.parse(body);
                var result = JSON.parse(body);
                if (err) console.log(err);
                return res.view('userCount/roomVerifyList', {
                    username: req.session.username,
                    usertype: req.session.usertype,
                    data: result.info || [],
                    total_pages: result.num,
                    current_page: result.current_page
                });
            }
        );
    },
    roomVerifyListPOST: function (req, res) {
        var data = {};
        data.current_page = (+req.param('current_page') + 1) || 1;
        data.c_chatroom_name = req.param('keyword');
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_roomManage_query';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    chartRoomList = JSON.parse(body);
                    var result = JSON.parse(body);
                    if (err) console.log(err);
                    return res.json({
                        username: req.session.username,
                        usertype: req.session.usertype,
                        data: result.info || [],
                        total_pages: result.num,
                        current_page: result.current_page
                    });
                } catch (ex) {
                    console.log(ex);
                }
            }
        );
    },
    /**
     * 房间列表查询
     * **/
    roomVerifyAdd: function (req, res) {
        var data = {};
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_room_list';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                chartRoomList = JSON.parse(body);
                if (err) console.log(err);
                return res.view('userCount/roomVerifyAdd', {
                    error: req.param('error') || '',
                    usertype: req.session.usertype,
                    username: req.session.username,
                    error: '',
                    success: '',
                    data: JSON.parse(body)
                });
            }
        );
    },
    roomVerifyAddPost: function (req, res) {
            var data = {};
            data.c_hash = req.body.c_hash || req.param('c_hash');
            data.c_chatroom_name = req.body.c_chatroom_name || req.param('c_charroom_name');
            if (data.c_hash) {
                async.waterfall([
                    function (callback) {
                        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_roomManage_update';
                        request.post({url: url, form: JSON.stringify(data)},
                            function (err, httpResponse, body) {
                                if (err) console.log(err);
                                return callback(null, body);
                            }
                        );
                    },
                    function (status, callback) {
                        if (JSON.parse(status)) {
                            var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_roomManage_add';
                            request.post({url: url, form: JSON.stringify(data)},
                                function (err, httpResponse, body) {
                                    if (err) console.log(err);
                                    return callback(null, {ok: true});
                                }
                            );
                        } else {
                            return callback(null, {ok: false});
                        }
                    }
                ], function (err, result) {
                    if (err) {
                        throw err;
                    } else {
                        return res.redirect('/platform/roomVerifyList');
                    }
                });
            } else {
                return res.redirect('/platform/roomVerifyList');
            }
    },
    /**
     * 删除推广单条记录
     */
    roomManageDel: function (req, res) {
        var hash = req.param('hash');
        var data = {};
        data.c_hash = hash;
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_roomManage_update';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                if (err) {
                    return res.json({"msg": "error"});
                } else {
                    return res.json({"msg": "ok"});
                }
            }
        )
    },
    /***
     * 客户端首页模块点击统计
     * @param req
     * @param res
     * @constructor
     */
    clientCountUser: function (req, res) {
        var data = {};
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_clientCountUser_query';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                var result = JSON.parse(body);
                if (err) {
                    return res.json({"msg": "error"});
                } else {
                    return res.view('other/clientCount.ejs',{
                        username: req.session.username,
                        usertype: req.session.usertype,
                        result: result,
                        total_pages: result||[],
                        current_page: result.current_page
                    });
                }
            }
        )
    },
    /***
     * 客户端首页统计模块加时间查询
     * @param req
     * @param res
     * @constructor
     */
    clientCountUserPost: function (req, res) {
        var data = {};
        data.find_starttime = req.param('find_starttime');
        data.find_endtime = req.param('find_endtime');
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_clientCountUser_query';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                var result = JSON.parse(body);
                if (err) {
                    return res.json({"msg": "error"});
                } else {
                    return res.json({
                        username: req.session.username,
                        usertype: req.session.usertype,
                        result: result
                    });
                }
            }
        )
    }
};
