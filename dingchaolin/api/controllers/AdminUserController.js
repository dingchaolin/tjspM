/**
 * AdminUserController
 *
 * @description :: Server-side logic for managing Adminusers
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var request = require('request');
var async = require('async');
var moment = require('moment');
var bcrypt = require('bcrypt-nodejs');

module.exports = {

    login: function (req, res) {
        if (req.session.authenticated) {
            return res.redirect('adminuser/userindex');
        }
        return res.view('login', {
            error: req.param('error') || ''
        });
    },
    verify: function (req, res) {
        var password = req.param('password') || '';
        var data = {};
        data.act = "verify";
        data.username = req.param('username') || '';
        data.password = password;
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/admin';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log(err);
                    var userinfo = JSON.parse(body);
                    if (userinfo.length) {
                        if (!bcrypt.compareSync(password, userinfo[0].password)) {
                            res.redirect('login?error=密码不正确');
                        } else {
                            req.session.authenticated = true;
                            req.session.username = userinfo[0].username;
                            req.session.usertype = userinfo[0].roleid;
                            req.session.c_id = userinfo[0].c_id;
                            var datal = {};
                            datal.act = 'loginip';
                            datal.username = data.username;
                            datal.loginip = req.ip;
                            var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/admin';
                            request.post({url: url, form: JSON.stringify(datal)}, function (err, httpResponse, body) {
                                if (err) console.log(err);
                                if (userinfo[0].roleid == 1) {
                                    res.redirect('adminuser/userindex');
                                } else if (userinfo[0].roleid == 3) {
                                    res.redirect('room/index');
                                } else if (userinfo[0].roleid == 2) {
                                    res.redirect('room/auditpaylist');
                                } else if (userinfo[0].roleid == 4) {
                                    res.redirect('room/index');
                                }else if (userinfo[0].roleid == 5) {
                                    res.redirect('room/index');
                                }
                            });
                        }
                    } else {
                        return res.redirect('login?error=用户名不正确');
                    }
                } catch (ex) {
                    console.log(ex);
                }
            }
        );


    },
    /**
     * 添加管理用户
     * @param req
     * @param res
     */
    useradd: function (req, res) {

        res.view('adminuser/add', {
            username: req.session.username,
            usertype: req.session.usertype,
            iusername: '',
            realname: '',
            roleid: '',
            error: req.param('error') || '',
            success: ''
        });


    },
    add: function (req, res) {

        var iusername = req.param('username');
        var password = bcrypt.hashSync(req.param('password'));
        var roleid = req.param('roleid');
        var realname = req.param('realname');
        if (!iusername || !password || !roleid || !realname) return res.redirect('adminuser/useradd?error=请完整填写用户信息');
        var data = {};
        data.act = 'add';
        data.username = iusername;
        data.password = password;
        data.roleid = roleid;
        data.lastloginip = req.ip;
        data.lastlogintime = Date.parse(new Date()) / 1000;
        data.realname = realname;
        data.api = '/TJVideoSVC/admin';
        collector.log(req, req.session.c_id, req.session.username, JSON.stringify(data));
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/admin';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log(err);
                    var result = JSON.parse(body);
                    if (result == 'exist') return res.redirect('adminuser/useradd?error=用户名已存在，请重新输入');
                    return res.view('adminuser/add', {
                        username: req.session.username,
                        usertype: req.session.usertype,
                        iusername: iusername,
                        realname: realname,
                        roleid: roleid,
                        error: '',
                        success: '管理员成功创建'
                    });
                } catch (ex) {
                    console.log(ex);
                    return res.json({err:'请传递正确参数'});
                }
            }
        );
    },
    userindex: function (req, res) {
        var data = {};
        data.act = 'list';
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/admin';
        request.post({url: url, form: JSON.stringify(data)}, function (err, httpResponse, body) {
            try {
                if (err) console.log(err);
                var userlist = JSON.parse(body);
                for (var i = 0; i < userlist.length; i++) {
                    delete userlist[i].password;
                    userlist[i].lastlogintime = moment(userlist[i].lastlogintime * 1000).format('YYYY-MM-DD, HH:mm:ss');
                }
                return res.view('adminuser/userindex', {
                    userlist: userlist,
                    usertype: req.session.usertype,
                    username: req.session.username
                });
            } catch (ex) {
                console.log(ex);
            }
        });


    },
    update: function (req, res) {

        var data = {};
        data.act = 'update';
        data.c_id = req.param('c_id') || '';
        data.username = req.param('username') || '';
        data.realname = req.param('realname') || '';
        data.roleid = req.param('roleid') || '';
        data.api = '/TJVideoSVC/admin';
        collector.log(req, req.session.c_id, req.session.username, JSON.stringify(data));
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/admin';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log(err);
                    var result = JSON.parse(body);
                    if (result == 'ok') return res.send('ok');
                    return res.send('fail');
                } catch (ex) {
                    console.log(ex);
                }
            }
        );


    },
    /**
     * 删除管理用户
     * @param req
     * @param res
     */
    delete: function (req, res) {
        var data = {};
        data.act = 'delete';
        data.c_id = req.param('c_id') || '';
        data.api = '/TJVideoSVC/admin';
        collector.log(req, req.session.c_id, req.session.username, JSON.stringify(data));
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/admin';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log(err);
                    var result = JSON.parse(body);
                    if (result == 'ok') return res.send('ok');
                    return res.send('fail');
                } catch (ex) {
                    console.log(ex);
                }
            }
        );


    },
    reset: function (req, res) {

        var data = {};
        data.act = "reset";
        data.password = bcrypt.hashSync('000000');
        data.c_id = req.param('c_id') || '';
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/admin';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log(err);
                    var result = JSON.parse(body);
                    if (result == 'ok') return res.send('ok');
                    return res.send('fail');
                } catch (ex) {
                    console.log(ex);
                }
            }
        );
    },
    profile: function (req, res) {
        var data = {};
        data.act = "profile";
        data.c_id = req.session.c_id || '';
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/admin';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log(err);
                    var profile = JSON.parse(body);
                    delete profile[0].password;
                    delete profile[0].lastlogintime;
                    delete profile[0].lastloginip;
                    return res.view('adminuser/profile', {
                        profile: profile[0],
                        usertype: req.session.usertype,
                        username: req.session.username
                    })
                } catch (ex) {
                    console.log(ex);
                }
            }
        );


    },
    pupdate: function (req, res) {

        var data = {};
        data.act = "pupdate";
        data.username = req.param('username') || '';
        data.realname = req.param('realname') || '';
        data.c_id = req.param('c_id') || '';
        data.api = '/TJVideoSVC/admin';
        collector.log(req, req.session.c_id, req.session.username, JSON.stringify(data));
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/admin';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log(err);
                    var result = JSON.parse(body);
                    return res.redirect('adminuser/profile');
                } catch (ex) {
                    console.log(ex);
                }
            }
        );


    },
    passreset: function (req, res) {

        var data = {};
        data.act = "passreset";
        data.c_id = req.param('c_id');
        data.password = bcrypt.hashSync(req.param('password'));
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/admin';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log(err);
                    var result = JSON.parse(body);
                    if (result == 'ok') return res.send('ok');
                    return res.send('fail');
                } catch (ex) {
                    console.log(ex);
                }
            }
        );
    },
    logout: function (req, res) {

        req.session.destroy();
        return res.redirect('/login');


    },
    userlock: function (req, res) {
        return res.view('adminuser/lock', {
            error: req.param('error') || '',
            usertype: req.session.usertype,
            username: req.session.username
        });
    },
    userfind: function (req, res) {
        try {
            var uid = req.param('uid');
            var nickname = req.param('nickname');
            if (!nickname) return res.redirect('/adminuser/userlock?error=请输入用户名');
            async.waterfall([
                function (callback) {
                    var url = 'http://svc_s.mfniu.com/mf_userinfo_byname?c_name=' + nickname;
                    request(url, function (err, response, body) {
                        if (err) {
                            return callback(null, []);
                        }
                        var body = JSON.parse(body);
                        if (body.length > 0) {
                            return callback(null, body);
                        } else {
                            return callback(null, []);
                        }
                    });
                },
                function (lockList, callback) {
                    if (lockList.length > 0) {
                        var uid = lockList[0].uid ;
                        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/zj_user_lockfind';
                        var data = {
                            uid: uid
                        };
                        request.post({url: url, form: JSON.stringify(data)},
                            function (err, httpResponse, body) {
                                if (err) return callback(err);
                                lockList[0].operate = 'lock';
                                if (JSON.parse(body).length <= 0) {
                                    lockList[0].operate = 'no_lock'
                                }
                                return callback(null, lockList);
                            }
                        );
                    } else {
                        return callback(null, []);
                    }
                }
            ], function (err, result) {
                if (err) {
                    return res.json({
                        status: 'fail',
                        error: 'SERVER_ERR'
                    });
                }
                if (result.length > 0) {
                    console.log(result);
                    return res.view('adminuser/find', {
                        status: 'ok',
                        userinfo: result[0],
                        usertype: req.session.usertype,
                        username: req.session.username
                    });
                } else {
                    return res.view('error', {
                        error: '用户没有被禁用'
                    });
                }
            });
        } catch (ex) {
            console.log(ex);
        }
    },
    //用户ID查询
    userIDfind: function (req, res) {
        try {
            var uid = req.param('uid');
            if (!uid) return res.redirect('/adminuser/userlock?error=请输入用户ID');
            async.waterfall([
                function (callback) {
                    var url = 'http://soa.mfservice.com/TJCenterSVC/getUserInfo';
                    var data = {};
                    data.pool ='TJCenterSVC';
                    data.db = 'appservice';
                    data.user = {
                        table:'tj_user',
                        where:{
                            uid:uid
                        }
                    };
                    data.expire = 0;
                    request.post({url: url, form: JSON.stringify(data)},
                        function (err, httpResponse, body) {
                        if (err) {
                            return callback(null, []);
                        }
                        var body = JSON.parse(body);
                        if(body.length > 0){
                            return callback(null, body);
                        } else {
                            return callback(null, []);
                        }
                    });
                },
                function (result, callback) {
                    if (result.length > 0) {
                        var uid = result[0].uid ;
                        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/zj_user_lockfind';
                        var data = {
                            uid: uid
                        };
                        request.post({url: url, form: JSON.stringify(data)},
                            function (err, httpResponse, body) {
                                if (err) return callback(err);
                                result[0].operate = 'lock';
                                if (JSON.parse(body).length <= 0) {
                                    result[0].operate = 'no_lock'
                                }
                                return callback(null, result);
                            }
                        );
                    } else {
                        return callback(null, []);
                    }
                }
            ], function (err, result) {
                if (err) {
                    return res.json({
                        status: 'fail',
                        error: 'SERVER_ERR'
                    });
                }
                if (result.length > 0) {
                    return res.view('adminuser/find', {
                        status: 'ok',
                        userinfo: result[0],
                        usertype: req.session.usertype,
                        username: req.session.username
                    });
                } else {
                    return res.view('error', {
                        error: '用户没有被禁用'
                    });
                }

            });

        } catch (ex) {
            console.log(ex);
        }
    },
    lock: function (req, res) {
        try {
            var l_uid = req.param('l_uid');
            async.waterfall([
                function (callback) {
                    var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/zn_user_lock';
                    var data = {
                        l_uid: l_uid
                    };
                    data.api = '/TJVideoSVC/zn_user_lock';
                    collector.log(req, req.session.c_id, req.session.username, JSON.stringify(data));
                    request.post({url: url, form: JSON.stringify(data)},
                        function (err, httpResponse, body) {
                            if (err) callback(err);
                            callback(null, body);
                        }
                    );
                }
            ], function (err, result) {
                if (err) {
                    return res.json({
                        status: 'fail',
                        error: 'SERVER_ERR'
                    });
                }
                return res.json(result);
            });

        } catch (ex) {
            console.log(ex);
        }
    },
    userliftbanfind: function (req, res) {

        var uname = req.param('username');
        var uip = req.param('userip');
        var data = {};
        data.username = uname || "";
        data.userip = uip || "";
        data.current_page = +req.param('current_page') + 1; //current_page
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/zj_user_lift_ban';
        request.post({url: url, form: JSON.stringify(data)}, function (err, response, body) {
            try {
                if (!!err) {
                    return res.json({
                        status: 'fail',
                        error: 'SERVER_ERR'
                    });
                }
                var body = JSON.parse(body);
                if (body.msg.length > 0) {
                    return res.view('adminuser/userbanfind', {
                        status: 'ok',
                        findname: uname,
                        total_pages: body.sum,
                        userList: body.msg || [],
                        usertype: req.session.usertype,
                        username: req.session.username
                    });
                } else {
                    return res.view('error', {
                        error: '用户没有被禁用'
                    });
                }

            } catch (ex) {
                console.log(ex);
            }
        });

    },
    userliftbanfindcount: function (req, res) {

        var uname = req.param('username');
        var uip = req.param('userip');
        var data = {};
        data.username = uname || "";
        data.userip = uip || "";
        data.current_page = +req.param('current_page') + 1; //current_page
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/zj_user_lift_ban';
        request.post({url: url, form: JSON.stringify(data)}, function (err, response, body) {
            try {
                if (!!err) {
                    return res.json({
                        status: 'fail',
                        error: 'SERVER_ERR'
                    });
                }
                var body = JSON.parse(body);
                if (body.msg.length > 0) {
                    return res.json({
                        status: 'ok',
                        total_pages: body.sum
                    });
                } else {
                    return res.json({
                        status: 'fail',
                        total_pages: 0
                    });
                }
            } catch (ex) {
                console.log(ex);
            }
        });

    },
    lockDelete: function (req, res) {

        var uid = req.param('l_uid');
        console.log(uid);
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/zj_user_lockdelete';
        var data = {
            uid: uid
        };
        collector.log(req, req.session.c_id, req.session.username, JSON.stringify(data));
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    return res.json(JSON.parse(body));
                } catch (ex) {
                    console.log(ex);
                }
            }
        );

    },
    user_scoredetail: function (req, res) {
        return res.view('adminuser/scoredetail', {
            error: req.param('error') || '',
            usertype: req.session.usertype,
            username: req.session.username
        });
    },
    user_scoregrant: function (req, res) {
        return res.view('adminuser/scoregrant', {
            error: req.param('error') || '',
            usertype: req.session.usertype,
            username: req.session.username
        });
    },
    scoredetail: function (req, res) {
        /*
         按uid查询：{'condition':'uid','value':2341791,'current_page':1,'type':0,'starttime':1469091158,'endtime':1469154917}
         按nickname查询:{'condition':'username','value':'魔方手机哟','current_page':1,'type':0,'starttime':1469091158,'endtime':1469154917}
         */
        var data = {};
        data.condition = req.param('condition');
        data.value = req.param('value');
        data.current_page = req.param('current_page');
        data.type = req.param('type');
        data.starttime = req.param('starttime');
        data.endtime = req.param('endtime');

        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/dcl_scoresys_TJSP_detail';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log(err);

                    var result = JSON.parse(body);
                    //console.log( result );
                    for (var i = 0; i < result.info.length; i++) {
                        result.info[i].timestamp = moment(result.info[i].timestamp*1000).format('YYYY-MM-DD, HH:mm:ss');
                    }
                    //return res.json(result);

                    return res.json({
                        info: result.info,
                        num: result.num,
                        current_page: result.current_page,
                        usertype: req.session.usertype,
                        username: req.session.username
                    });

                } catch (ex) {
                    console.log(ex);

                }
            }
        );
    },
    scoregrant: function (req, res) {
        /*
         按uid查询：{'findtype':1,'condition':'uid','value':2341791,'current_page':1,'type':0,'starttime':1469154587,'endtime':1469515447}
         按nickname查询:{'findtype':1,'condition':'username','value':'魔方手机哟','current_page':1,'type':0,'starttime':1469154587,'endtime':1469515447}
         */
        var data = {};
        data.findtype = req.param('findtype');
        if( data.findtype == 1 ){//存在用户id或者用户昵称
            data.condition = req.param('condition');
            data.value = req.param('value');
            data.current_page = req.param('current_page');
            data.type = req.param('type');
            data.starttime = req.param('starttime');
            data.endtime = req.param('endtime');
        }else{
            /*
             没有用户名没有昵称
             {'findtype':0,'current_page':1,'type':2,'starttime':1469154587,'endtime':1469515447}
             */
            data.current_page = req.param('current_page');
            data.type = req.param('type');
            data.starttime = req.param('starttime');
            data.endtime = req.param('endtime');
        }
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/dcl_scoresys_grantdetail';
        //console.log("url:=" + url );
        //console.log( "POSTDATA===="+JSON.stringify(data) );
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log("error=" + err);

                    var result = JSON.parse(body);
                    //console.log( "result===" + JSON.stringify(result) );
                    for (var i = 0; i < result.info.length; i++) {

                        result.info[i].timestamp = moment(result.info[i].timestamp*1000).format('YYYY-MM-DD, HH:mm:ss');
                    }
                    //return res.json(result);
                    //console.log( result );
                    return res.json({
                        info: result.info,
                        num: result.num,
                        current_page: result.current_page,
                        usertype: req.session.usertype,
                        username: req.session.username
                    });

                } catch (ex) {
                    console.log(ex);

                }
            }
        );
    },
    scoregrantupdate: function (req, res) {
        var data = {};
        data.uid = req.param('uid');
        data.timestamp = req.param('timestamp');
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/dcl_scoresys_grant';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log(err);
                    var result = JSON.parse(body);
                    return res.json({
                        info: result
                    });

                } catch (ex) {
                    console.log(ex);
                }
            }
        );
    },
    //获取用户等级界面
    growthLevel: function (req, res) {
        return res.view('adminuser/growthLevel', {
            error: req.param('error') || '',
            usertype: req.session.usertype,
            username: req.session.username
        });
    },
    //用户等级查询
    user_growthLevel: function (req, res) {
        var data = {};
        var type = parseInt( req.param( 'type' ) );
        if( 1 == type ){//uid
            data.attr = 'uid';
            data.value = parseInt( req.param('uid') );
        }else {//username
            data.attr = 'username';
            data.value = req.param('nickname');
        }

        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/dcl_growthsys_TJSP_getExpLevel';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log(err);
                    var result = JSON.parse(body);
                    return res.json({
                        info: result
                    });

                } catch (ex) {
                    console.log(ex);
                }
            }
        );
    }

};
