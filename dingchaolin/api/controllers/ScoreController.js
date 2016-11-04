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

    awardrecord: function (req, res) {
        res.view('awardrecord/addaward', {
            username: req.session.username,
            usertype: req.session.usertype,
            error: req.param('error') || '',
            success: ''
        });


    },
    editaward: function (req, res) {
        //console.log( req.query );
        //获取奖品码  拼接字符串
        var awardinfo = req.query;//GET 请求

        var data= {};
        data.type = req.query.type;
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/dcl_scoresys_getAwardCodes';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log(err);
                    var codes = JSON.parse(body);
                    awardinfo.code = "";
                    var totalCount = codes.length;
                    var greenCode = 0;
                    codes.info.forEach( function( item ){
                        awardinfo.code = awardinfo.code + item.code + ",";
                        /*
                        if( item.status = 1 ){//可用
                            greenCode++;
                            awardinfo.code = awardinfo.code + '<span style="color:green">' +item.code + '</span>&nbsp;&nbsp;&nbsp;&nbsp;';
                        }else{//不可用
                            awardinfo.code = awardinfo.code + '<span style="color:red">' +item.code + '</span>&nbsp;&nbsp;&nbsp;&nbsp;';
                        }*/
                    });
                    //console.log( "codes="+JSON.stringify( body ) );
                    //res.json(body)

                    res.view('awardrecord/editaward', {
                        username: req.session.username,
                        usertype: req.session.usertype,
                        error: req.param('error') || '',
                        success: '',
                        awardinfo:awardinfo
                    });
                } catch (ex) {
                    console.log(ex);
                }
            }
        );
        /*
        res.view('awardrecord/editaward', {
            username: req.session.username,
            usertype: req.session.usertype,
            error: req.param('error') || '',
            success: '',
            awardinfo:req.query
        });
        */

    },
    showHideAward: function (req, res) {
        var data= req.body;//POST 请求
        //console.log( data );
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/dcl_scoresys_awardShowHide';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log(err);
                    res.json(body)

                } catch (ex) {
                    console.log(ex);
                }
            }
        );


    },
    saveEditAward: function (req, res) {
        var data= req.body;//POST 请求
        //console.log( data );
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/dcl_scoresys_editAward';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log(err);
                    res.json(body)

                } catch (ex) {
                    console.log(ex);
                }
            }
        );


    },
    updateAwardStatus: function (req, res) {
        var data= req.body;//POST 请求
        //console.log( data );
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/dcl_scoresys_updateAwarwStatus';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log(err);
                    res.json(body)

                } catch (ex) {
                    console.log(ex);
                }
            }
        );


    },
    awardlist: function (req, res) {

        res.view('awardrecord/awardlist', {
            username: req.session.username,
            usertype: req.session.usertype,
            error: req.param('error') || '',
            success: ''
        });


    },
    getAwardList: function (req, res) {
        //console.log( "==================" );
        var data = req.body;
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/dcl_scoresys_getAwardList';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log(err);
                    //var type = JSON.parse(body);
                    //console.log( "接口="+type );
                    res.json(body)
                } catch (ex) {
                    console.log(ex);
                }
            }
        );
    },

    openAward: function (req, res) {
    //console.log( "==================" );
    var data = req.body;
    var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/dcl_scoresys_openAward';
    request.post({url: url, form: JSON.stringify(data)},
        function (err, httpResponse, body) {
            try {
                if (err) console.log(err);
                //var type = JSON.parse(body);
                //console.log( "接口="+type );
                res.json(body)
            } catch (ex) {
                console.log(ex);
            }
        }
    );
},
    closeAward: function (req, res) {
        //console.log( "==================" );
        var data = req.body;
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/dcl_scoresys_closeAward';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log(err);
                    //var type = JSON.parse(body);
                    //console.log( "接口="+type );
                    res.json(body)
                } catch (ex) {
                    console.log(ex);
                }
            }
        );
    },
    deleteAward: function (req, res) {
        //console.log( "==================" );
        var data = req.body;
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/dcl_scoresys_deleteAward';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log(err);
                    //var type = JSON.parse(body);
                    //console.log( "接口="+type );
                    res.json(body)
                } catch (ex) {
                    console.log(ex);
                }
            }
        );
    },
    getAwardNewType: function (req, res) {
        //console.log( "==================" );
        var data = {};
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/dcl_scoresys_getAwardNewType';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log(err);
                    //var type = JSON.parse(body);
                    //console.log( "接口="+type );
                    res.json(body)
                } catch (ex) {
                    console.log(ex);
                }
            }
        );
    },
    addAward: function (req, res) {
        //console.log( "req==============" , req  );
        var data = req.body;
        //console.log( "data==============" , data  );
        var url = req.protocol + '://' + sails.config.apiserver + '/TJVideoSVC/dcl_scoresys_addAward';
        request.post({url: url, form: JSON.stringify(data)},
            function (err, httpResponse, body) {
                try {
                    if (err) console.log(err);
                    //var type = JSON.parse(body);
                    //console.log( type );
                    res.json(body)
                } catch (ex) {
                    console.log(ex);
                }
            }
        );
    }

};
