/**
 * Created by Administrator on 2016/1/8.
 */


var request = require('request');
var moment = require('moment');
var async = require('async');
var chartRoomList = [];
module.exports = {
    /**
     * 钱眼推广用添加
     * @param req
     * @param res
     */
    qianYanAdd: function (req, res) {

        if (req.method == 'GET') {
            //获取所有房间名称供用户选择
            var data = {};
            var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_room_list';
            request.post({url: url, form: JSON.stringify(data)},
                function (err, httpResponse, body) {
                    try {
                        if (err) console.log(err);
                        chartRoomList = JSON.parse(body);
                        return res.view('qianYan/qianYanAdd', {
                            error: req.param('error') || '',
                            usertype: req.session.usertype,
                            username: req.session.username,
                            data: JSON.parse(body)
                        });
                    } catch (ex) {
                        console.log(ex);
                    }
                }
            );
        } else {
            var data = {};
            data.c_hash = req.param('c_hash');
            data.c_name = req.param('c_chatroom_name') || '';
            data.spread_num = req.param('spread_num') || 0;
            data.percent = req.param('percent') || 0;
            data.status = req.param('status') || 0;
            if (data.c_hash) {
                var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_qianyanExpand_add';
                request.post({url: url, form: JSON.stringify(data)},
                    function (err, httpResponse, body) {
                        if (err) console.log(err);
                        return res.redirect('/qianYan/indexGet');
                    }
                );
            } else {
                return res.json({err: '没有此房间'});
            }

        }

    },

    //钱眼推广主页
    indexGet: function (req, res) {
        //get请求
        var data = {};
        data.current_page = (+req.param('current_page') + 1) || 1;
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_qianyan_list';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log(err);
                    var result = JSON.parse(body);
                    return res.view('qianYan/qianYanindex', {
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
    indexPost: function (req, res) {
        //post请求
        var data = {};
        data.current_page = (+req.param('current_page') + 1) || 1;
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_qianyan_list';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log(err);
                    var result = JSON.parse(body);
                    for (var i = 0; i < result.info.length; i++) {
                        result.info[i].dateline = moment(+result.info[i].dateline * 1000).format('YYYY-MM-DD,hh:mm:ss');
                    }
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
     * 删除推广单条记录
     */
    indexDel: function (req, res) {

        var hash = req.param('hash');
        var data = {};
        data.c_hash = hash;
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_delete_qianYan';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (body.err) {
                        return res.json({"msg": "error"});
                    } else {
                        return res.json({"msg": "ok"});
                    }
                } catch (ex) {
                    console.log(ex);
                }
            }
        )

    },
    /**
     * 自动like查询
     * @param req
     * @param res
     */
    likeQuery: function (req, res) {

        var data = {};
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_like_query';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) {
                        return res.json({"msg": "error"});
                    } else {
                        chartRoomList = body;
                    }
                } catch (ex) {
                    console.log(ex);
                }
            }
        )
    },

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

};