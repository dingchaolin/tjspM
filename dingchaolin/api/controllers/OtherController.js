var request = require('request');
var moment = require('moment');
var async = require('async');
var yczsRoomList = [];
module.exports = {
    blockword: function (req, res) {
        var data = {};
        data.value =  req.param('value');
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_blockword_set';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                if(err) throw err;
                res.json({result:'ok'});
            }
        );
    }
    ,
    blockwordQuery: function (req, res) {
        var data = {};
        data.value =  req.param('value');
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_blockword_query';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                if(err) throw err;
                var resultinfo = JSON.parse(body);
                var result = resultinfo[0].value;
                res.view('other/index.ejs',{
                    username: req.session.username,
                    usertype: req.session.usertype,
                    error: req.param('error') || '',
                    success: req.param('success') || '',
                    result:result
                });
            }
        );
    },
    feedbackQueryGet: function (req, res) {
        var data = {};
        data.value =  req.param('value');
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_feedback_query';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                if(err) throw err;
                var resultinfo = JSON.parse(body);
                res.view('other/feedback.ejs',{
                    username: req.session.username,
                    usertype: req.session.usertype,
                    error: req.param('error') || '',
                    success: req.param('success') || '',
                    result:resultinfo.info,
                    total_pages: resultinfo.num,
                    current_page: resultinfo.current_page
                });
            }
        );
    },
    feedbackQuery: function (req, res) {
        var type = req.param('type');
        var data = {
            "find_starttime": req.param('find_starttime'),
            "find_endtime": req.param('find_endtime')
        };
        data.current_page = (+req.param('current_page') + 1) || 1;
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_feedback_query';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                if(err) throw err;
                var resultinfo = JSON.parse(body);


                for (var i = 0; i < resultinfo.info.length; i++) {
                    resultinfo.info[i].dateTime = moment(resultinfo.info[i].dateTime * 1000).format('YYYY-MM-DD, HH:mm:ss');
                }
                res.json({
                    username: req.session.username,
                    usertype: req.session.usertype,
                    error: req.param('error') || '',
                    success: req.param('success') || '',
                    result:resultinfo.info,
                    total_pages: resultinfo.num,
                    current_page: resultinfo.current_page
                });
            }
        );
    },
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

        //var startTime =0;
        //var endTime =99999999999 ;
        var data = {
            "find_starttime": +startTime,
            "find_endtime": +endTime
        };
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_feedback_download';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {

                    if (!!err) {
                        console.log(err)
                    }
                    var result = JSON.parse(body);
                    var info = result.info;
                    var giftInfo=[];
                    for (var i=0;i < info.length;i++){
                        info[i].dateTime = moment(info[i].dateTime * 1000).format('YYYY-MM-DD, HH:mm:ss');
                        giftInfo.push({'uid': info[i].uid, 'name': info[i].name, 'dateTime': info[i].dateTime,'type':info[i].type,'version':info[i].version,'idea':info[i].idea,'iphone':info[i].iphone});
                    }
                    var cols = [
                        {caption: '用户ID', type: 'number'},
                        {caption: '用户名称', type: 'string'},
                        {caption: '反馈时间', type: 'string'},
                        {caption: '反馈类型', type: 'type'},
                        {caption: '客户端版本', type: 'string'},
                        {caption: '反馈意见', type: 'string'},
                        {caption: '联系方式', type: 'string'}
                    ]
                        , rows = collector.ObjTOArray(giftInfo);
                    var result = collector.excel(cols, rows);
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                    res.setHeader("Content-Disposition", "attachment; filename=" + "feedback.xlsx");
                    res.end(result, 'binary');

            }
        );
    },

    /*
    获取平台违规处理结果
     */
    GetOutoflineDeal : function( req, res ){
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/dcl_GetOutoflineDeal';
        var data = {};
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                if(err) throw err;
                var resultinfo = JSON.parse(body);
                res.view('other/outoflinedeal.ejs',{
                    username: req.session.username,
                    usertype: req.session.usertype,
                    error: req.param('error') || '',
                    success: req.param('success') || '',
                    outoflineinfo: resultinfo
                });

            }
        );
    },


    /**
     * 删除违规单条记录
     */
    indexDel: function (req, res) {

        var id = req.param('id');
        var data = {};
        data.id = id;
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/dcl_outofline_delete';
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
    /*
    添加一条违规记录  界面渲染
     */
    outoflineadd: function (req, res) {
        return res.view('other/addoutofline.ejs', {
            username: req.session.username,
            usertype: req.session.usertype,
            error: req.param('error') || '',
            success: req.param('success') || ''
        });
    },
    /*
    添加一条违规记录中  提交按钮的相应方法
     */
    add: function (req, res) {
        if (req.param('c_name') == null ) return res.redirect('/other/outoflineadd?error=请完整填写信息');
        var data = {};
        data.act = 'add';
        data.c_name = (req.param('c_name')).trim() || '';
        if( req.param('c_nikenameType').trim() == "主播" ){
            data.c_nikenameType = 0;
        }
        else {
            data.c_nikenameType = 1;
        }
        //data.c_nikenameType = (req.param('c_nikenameType')).trim() || '';
        data.c_action = (req.param('c_action')).trim() || '';
        data.c_deal = (req.param('c_deal')).trim() || '';
        //if (data.c_name == '' ) return res.redirect('/other/outoflineadd?error=请完整填写信息');
        data.api = '/TJVideoSVC/zn_region';
        collector.log(req, req.session.c_id, req.session.username, JSON.stringify(data));
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/dcl_outofline_add';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {

                if (err) console.log(err);
                var result = JSON.parse(body);
                if (result.status == 'ok') {
                    return res.redirect('/other/outoflineadd?success=添加成功');
                } else if (result.status == 'fail') {
                    return res.redirect('/other/outoflineadd?error=添加失败');
                }

            }
        );


    },
    qianYanBlockword: function (req, res) {
        var data = {};
        data.value =  req.param('value');
        data.type = "qianyanretui";
        console.log(data);
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_qianyanblockword_set';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                if(err) throw err;
                res.json({result:'ok'});
            }
        );
    }
    ,
    qianYanBlockwordQuery: function (req, res) {
        var data = {};
        data.value =  req.param('value');
        data.type = "qianyanretui";
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_qianyanblockword_query';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                if(err) throw err;
                var resultinfo = JSON.parse(body);
                var result = resultinfo[0].value;
                res.view('other/qianyanReTui.ejs',{
                    username: req.session.username,
                    usertype: req.session.usertype,
                    error: req.param('error') || '',
                    success: req.param('success') || '',
                    result:result
                });
            }
        );
    },
    //提出用户列表中的用户
    kickUserListPOST:function(req,res){
        var data = {};
        data.uid = req.body.uid;
        data.chatname = req.body.chatname;
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_delete_roomuerslist';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                if(err) throw err;
                res.json(body);
            }
        );
    },
    kickUserListGET:function(req,res){
        res.view('other/kickUserList.ejs',{
            username: req.session.username,
            usertype: req.session.usertype,
            error: req.param('error') || '',
            success: req.param('success') || ''
        });
    },

    //版本配置信息GET请求
    versionUrlGet:function(req,res){
        var data = {};
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_versionUrlManage_query';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                var result  = JSON.parse(body);
                if(err) throw err;
                //时间戳转换格式化时间
                for (var i=0;i < result.length;i++){
                    result[i].dateTime = moment(result[i].dateTime * 1000).format('YYYY-MM-DD, HH:mm:ss');
                }
                res.view('other/versionUrlCount.ejs',{
                    username: req.session.username,
                    usertype: req.session.usertype,
                    result:result,
                    error: req.param('error') || '',
                    success: req.param('success') || ''
                });
            }
        );

    },
    //版本配置信息编辑GET
    versionUrlEditGet:function(req,res){
        var data = {};
        res.view('other/versionUrl.ejs',{
            username: req.session.username,
            usertype: req.session.usertype,
            error: req.param('error') || '',
            success: req.param('success') || ''
        });
    },
    //版本配置信息删除
    versionUrlDelete:function(req,res){
        var data = {};
        data.id = req.param('id');
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_versionUrlManage_delete';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                if(err) throw err;
                //时间戳转换格式化时间
               res.json({result:'ok'});
            }
        );
    },
    //版本信息POST请求
    versionUrlPost:function(req,res){
        var data = {};
        data.version = req.body.version || '';
        data.url = req.body.url || '';
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_versionUrl_add';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                if(err) throw err;
                res.json(body);
            }
        );
    },

    getinfoCountGet:function(req,res){
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

        //var startTime =0;
        //var endTime =99999999999 ;
        var data = {
            "find_starttime": +startTime,
            "find_endtime": +endTime
        };
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_getinfoCount_query';
        console.log(data);
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                var result = JSON.parse(body);
                if (err) {
                    return res.json({"msg": "error"});
                } else {
                    return res.view('other/getinfoCount.ejs',{
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
    getinfoCountPost:function(req,res){
        var data = {};
        data.find_starttime = req.param('find_starttime');
        data.find_endtime = req.param('find_endtime');
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_getinfoCount_query';
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
    yczsGet:function(req,res){
        var data = {};
        data.current_page = (+req.param('current_page') + 1) || 1;
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_yczs_query';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log(err);
                    var result = JSON.parse(body);
                    return res.view('other/yczsList.ejs',{
                        username: req.session.username,
                        usertype: req.session.usertype,
                        result: result
                    });
                } catch (ex) {
                    console.log(ex);
                }
            }
        );
    },

    yczsAdd:function(req,res){
        var data = {};
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_yczs_likequery';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                yczsRoomList = JSON.parse(body);
            });
        res.view('other/yczsAdd.ejs',{
            username: req.session.username,
            usertype: req.session.usertype,
            error: req.param('error') || '',
            success: req.param('success') || ''
        });
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
            for (var i = 0; i < yczsRoomList.length; i++) {
                var thisChatN = yczsRoomList[i].c_chatroom_name;
                if (!!thisChatN && thisChatN.indexOf(keyword) >= 0) {
                    queryList.push(yczsRoomList[i]);
                }
            }
            res.json({queryList: queryList});
        } catch (ex) {
            console.log(ex);
        }
    },
    yczsAddPost: function (req, res) {
        var data = {};
        data.c_hash = req.body.c_hash || req.param('c_hash');
        data.c_chatroom_name = req.body.c_chatroom_name || req.param('c_charroom_name');
        data.belong = req.body.belong || req.param('belong');
        data.ranking = req.body.ranking || req.param('ranking');
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_yczs_add';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
               if(err){
                   return res.redirect('/other/outoflineadd?error=添加失败');
               }
                res.redirect('/other/yczsGet');
            });

    },
    //版本配置信息删除
    yczsDelete:function(req,res){
        var data = {};
        data.id = req.param('id');
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/cy_yczs_delete';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                if(err) throw err;
                res.json({result:'ok'});
            }
        );
    }
};
