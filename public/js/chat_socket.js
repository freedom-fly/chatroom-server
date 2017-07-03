var socket = io();
var contractFirstLetter = ["<", "?", ">", "#", "^", "[", "]", "|", "=", "@", "(", ")", "$", "&"];

function CheckFirstLetterIsSpec(firstLetter) {
    // var res = false;
    // for (var i = 0; i < contractFirstLetter.length; i++) {
    //     if (contractFirstLetter[i] == firstLetter) {
    //         res = true;
    //         break;
    //     }
    // }
    // return res;
    return firstLetter == 'Z#';
}
$(function() {

    /** 接收到联系人 */
    socket.on('contractlist', function(data) {
        if (!data.state) {
            return;
        }
        var msg = data.result;
        var contractHtml = "";
        var groupContractHtml = "";
        var pinyinContract = {};
console.log(msg);
        for (var i = 0; i < msg.length; i++) {
            var contract = msg[i];
             contract.UserId = contract.ContactId;
             if (CheckFirstLetterIsSpec(contract.FirstLetter)) {
                 contract.FirstLetter = "None";
             }
             if (pinyinContract[contract.FirstLetter] == undefined || pinyinContract[contract.FirstLetter] == null) {
                 pinyinContract[contract.FirstLetter] = [];
             }
             pinyinContract[contract.FirstLetter].push(contract);

        }


        var wxuin = "";
        //生成联系人
        for (var singlePinyinContractKey in pinyinContract) {
            var singlePinyinContract = pinyinContract[singlePinyinContractKey];
            var py = singlePinyinContract[0].FirstLetter;

            for (var j = 0; j < singlePinyinContract.length; j++) {


                var c = singlePinyinContract[j];
                wxuin = c.WxUin;
                var pySpanId = "contract_py_" + py + "_" + c.WxUin;
                if ($("#" + pySpanId).length < 1) {
                    var contractHtml = "<span id=\"" + pySpanId + "\" sign=\"" + pySpanId + "\"  class=\"lianxi1\"><div class=\"zimu1\">" + py + "</div></span>";
                    $("div[sign=" + wxuin + "]").find("ul[sign=contactlist]").append(contractHtml);
                }
                var contractsingleHtml = CreateContract(c, "contractli");
                var liId = "contractli" + c.UserId + "_" + c.WxUin;
                if ($("#" + liId).length < 1) {
                    $("#" + pySpanId).after(contractsingleHtml);
                }

            }
        }
        var contractCount = msg.length;
        $("div[sign=" + wxuin + "]").find("ul[sign=contactlist]").append("<span class=\"contractCount\">" + contractCount + "位联系人<span>");
        var data = { wxuin: wxuin };
       socket.emit('lastcontactslist', data);//获取最近联系人


    });

    /** 接收到最近联系人聊天列表 */
    socket.on('getlastchatmessagelist', function(data) {
        var msgList = data.result;
        var isLast = true;
        for (var i = 0; i < msgList.length; i++) {
            if (i > 0) {
                isLast = false;
            }
            var msg = msgList[i];
            var wxUin = msg.WxUin;
            var chatcontentid = "chatconten_" + msg.UserId + "_" + wxUin;
            var lastshowdate = $("#" + chatcontentid).attr("lastshowdate");
            var addTimeSpan = false;
            if (lastshowdate == undefined || lastshowdate == "") {
                addTimeSpan = true;
            } else {
                var d2 = new Date(msg.CreateTime);
                var d1 = new Date(Date.parse(lastshowdate));
                if ((d1.getTime() - d2.getTime()) > (3 * 60 * 1000)) {
                    addTimeSpan = true;
                }
            }
            if (msg.IsSendMessage) {
                AddMyMessage(msg.UserId, msg.Id, msg.MessageContent, msg.MessageType, addTimeSpan, new Date(Date.parse(msg.CreateTime)), true, isLast, wxUin);
            } else {
                AddReciveMessage(msg.Id, addTimeSpan, new Date(Date.parse(msg.CreateTime)), msg.UserId, msg.MessageType, msg.MessageContent, true, isLast, wxUin, true, msg.MessageState);
            }
        }
    });

    /** 接收到最近群聊天记录 */
    socket.on('getlastchatgroupchatmessagelist', function(data) {
        var msgList = data.result;
        var isLast = true;
        for (var i = 0; i < msgList.length; i++) {
            var msg = msgList[i];

            var userid = data.userid;
            var msgId = msg.Id;
            if ($("#" + msgId).length > 0) {
                continue;
            }
            var wxUin = msg.WxUin;
            var chatcontentid = "chatgroupcontent_" + userid + "_" + wxUin;
            var addTimeSpan = GetIsAddTimeSpan(chatcontentid);
            var msgDate = new Date(Date.parse(msg.CreateTime));
            var messageContent = msg.MessageContent;
            var messageType = msg.MessageType;
            var headImg = msg.FromHeadImgUrl;
            var liStyle = "leftli";
            var fStyle = "f1";
            if (msg.IsSendMessage) {
                headImg = msg.FromHeadImgUrl;
                liStyle = "rightli";
                fStyle = "fr";
            } else {
                headImg = msg.FromHeadImgUrl;
                liStyle = "leftli";
                fStyle = "f1";
            }
            var state = "false";
            var isShowRealPic = false;
            if (msg.MessageState == "2") //下载成功  1 正在下载  3下载失败
            {
                state = "true";
                isShowRealPic = true;
            }
            var messageHtml = " <li wxuin=\"" + wxUin + "\" state=\"" + state + "\" id=\"" + msgId + "\" class=\"" + liStyle + "\">";
            if ($("#" + chatcontentid).length < 1) //当前聊天为新的聊天
            {
                continue;

            }
            if (addTimeSpan) {
                $("#" + chatcontentid).attr("lastshowdate", getCommonFormatDate(msgDate));
                var showTime = getHHmmFormatDate(msgDate);
                messageHtml += "<p class=\"fs10\">" + showTime + "</p>";
            }
            var onclikHtml = "";
            var msgUserId = msg.UserId.replace("@", "");
            msgUserId = msgUserId.replace("@", "");
            if (!msg.IsSendMessage && msg.UserId != ("@@" + userid)) { //群自己发的消息和自己的发的消息不会显示弹出用户信息

                if ($("#contractli" + msgUserId + "_" + wxUin).length > 0) {
                    onclikHtml = " onclick =\"ShowUserBusinessCard(this,'" + msgUserId + "');\" ";
                } else {
                    onclikHtml = " onclick =\"ShowAddUserCard(this,'" + msg.UserId + "');\" ";
                }
            }


            messageHtml += "       <div " +
                " UserId=\"" + userid + "\" " +
                " WxUin=\"" + wxUin + "\" " +
                " msgUserId=\"" + msgUserId + "\" " +
                " UserName=\"" + msgUserId + "\" " +
                onclikHtml +
                " class=\"img " + fStyle + "\">" +
                "           <img src=\"" + htmlDecode(headImg) + "\">" +
                "       </div>" +
                "       <div class=\"content " + fStyle + "\" messageType=\"" + messageType + "\">";
            var talkeName = msg.FromNickName == null ? "" : msg.FromNickName;
            if (!msg.IsSendMessage) {
                messageHtml += "<p class=\"talkeName\">" + talkeName + "</p>";
            }

            messageHtml += disposeMessageShowHtml(msgId, messageContent, messageType, userid, wxUin, false, isShowRealPic);
            messageHtml += "      </div>" +
                "  </li>";

            $("#" + chatcontentid + ">.middle>ul").prepend(messageHtml);


            var contractliId = "chatgroup_" + userid + "_" + wxUin;
            if (i == 0) {
                setLastChatMessage(contractliId, messageContent, messageType, msgDate);
                $("#" + chatcontentid).attr("lastmsgdate", getCommonFormatDate(msgDate));
            }

            setTimeout(function() {
                $("#" + chatcontentid + ">.middle").scrollTop($("#" + chatcontentid + ">.middle")[0].scrollHeight);
            }, 200);

            // if (i > 0) {
            //     isLast = false;
            // }
            // var msg = msgList[i];
            // var wxUin = msg.WxUin;
            // var chatcontentid = "chatconten_" + msg.UserId + "_" + wxUin;
            // var lastshowdate = $("#" + chatcontentid).attr("lastshowdate");
            // var addTimeSpan = false;
            // if (lastshowdate == undefined || lastshowdate == "") {
            //     addTimeSpan = true;
            // } else {
            //     var d2 = new Date(msg.CreateTime);
            //     var d1 = new Date(Date.parse(lastshowdate));
            //     if ((d1.getTime() - d2.getTime()) > (3 * 60 * 1000)) {
            //         addTimeSpan = true;
            //     }
            // }
            // if (msg.IsSendMessage) {
            //    // AddMyMessage(msg.UserId, msg.Id, msg.MessageContent, msg.MessageType, addTimeSpan, new Date(Date.parse(msg.CreateTime)), true, isLast, wxUin);
            // } else {

            //   //  AddReciveMessage(msg.Id, addTimeSpan, new Date(Date.parse(msg.CreateTime)), msg.UserId, msg.MessageType, msg.MessageContent, true, isLast, wxUin, true, msg.MessageState);
            // }
        }
    });

    /** 登录结果 */
    socket.on('login', function(msg) {

        if (msg.state) {
            var sendData = {};
            layer.closeAll('loading');
            $("#guocontainer").show();
            $("#login").hide();
            //如果已经登录就不要后续获取微信列表
            if ($("p.loginName").html() == msg.employee.Staffid) {
                return;
            }
            socket.emit('wechatlist');
            $("p.loginName").html(msg.employee.Staffid);
            $("#hideAutoEmployeeId").val(msg.employee.EmployeeID);
        } else {
            $("#guocontainer").hide();
            $("#login").show();
            layer.alert(msg.message);
            layer.closeAll('loading');
        }
    });
    /** 用户微信列表 */
    socket.on('wechatlist', function(data) {
        if (!data.state) {
            console.log(data.message);
            return;
        }
        console.log(data)
        var weixinList = {};

        for (var i = 0; i < data.result.length; i++) {
            var contract = data.result[i];

            if (weixinList[contract.WxUin] == undefined || weixinList[contract.WxUin] == null) {
                weixinList[contract.WxUin] = {
                    WxUin: contract.WxUin,
                    WxUinNickName: contract.NickName,
                    WxUinHeadImgUrl: contract.HeadImgUrl,
                    IsOnline: contract.StateName,
                    WechatState: contract.State
                };
            }
        }
        console.log(weixinList)
        for (var weixin in weixinList) {
            if ($(".maintTop>ul[sign=weixin_list_ul]").find("li[WxUin=" + weixin + "]").length > 0) {
                continue;
            }
            var weixnLiHtml = "  <li WxUin=\"" + weixin + "\">" +
                "    <img src=\"" + weixinList[weixin].WxUinHeadImgUrl + "\">" +
                "    <p>" + weixinList[weixin].WxUinNickName + "</p>" +
                //"    <p class=\"new\"></p>" +
                "     <i></i>" +
                "            </li>";
            $(".maintTop>ul[sign=weixin_list_ul]").append(weixnLiHtml);
            // 创建每个微信的主界面 createWeixinMainContent（）
            var wxMainContentHtml = createWeixinMainContent(weixin);
            $("#guocontainer").append(wxMainContentHtml);
            var wxState = weixinList[weixin].WechatState;
            // if (weixinList[weixin].IsOnline) {
            //     wxState = 1;
            // } else {
            //     wxState = -1;
            // }
            ChangeWxOnlineState(weixin, wxState);
            //显示用户昵称
            $("div[sign=FriendcircleMainDiv][WxUin=" + weixin + "]").find("p[sign=employee_name]").html(weixinList[weixin].WxUinNickName);
            //显示用户微信头像
            $("div[sign=FriendcircleMainDiv][WxUin=" + weixin + "]").find("img[sign=employee_head_img]").attr("src", weixinList[weixin].WxUinHeadImgUrl);
            var data = { wxuin: weixin };
            socket.emit('contractlist', data); //获取联系人

            socket.emit('chatgrouplist', data); //获取群聊



        }

        leftMenuTab();
        contactsTab();
        chatpageTab();
        // 群组折叠
        $("ul[sign=group_contactlist]").on("click", ".lianxi2", function() {
            $(this).next('ol').slideToggle("slow");
        });
        groupcontactsTab();
        chatTab();
        addFriend();
        modifyNickname();
        modifyheadimg();
        settingMessage();

        //绑定当前聊天对象滚动条时间
        $("div[stype=currentChatContract]").bind("scroll", function() {

            var viewH = $(this).height(); //可见高度
            var contentH = $(this).get(0).scrollHeight; //内容高度
            var scrollTop = $(this).scrollTop(); //滚动高度
            if (scrollTop / (contentH - viewH) >= 0.95) { //到达底部100px时,加载新内容
                var wxUin = $(this).attr("WxUin");
                var pageSize = $("#charlist_" + wxUin).attr("pageSize");
                var pageIndex = $("#charlist_" + wxUin).attr("pageIndex");
                var totleCount = $("#charlist_" + wxUin).attr("totleCount");
                var totlePageCount = (totleCount % pageSize > 0 ? 1 : 0) + parseInt(parseInt(totleCount) / parseInt(pageSize));
                if (pageIndex < totlePageCount) {
                    var sendData = {
                        wxuin: wxUin,
                        pageindex: parseInt(pageIndex) + 1,
                        pagesize: 20
                    };
                    socket.emit('lastcontactslist', sendData);
                }
            }
        });
        //绑定朋友圈对象滚动条时间
        $("div.right2").bind("scroll", function() {

            var viewH = $(this).height(); //可见高度
            var contentH = $(this).get(0).scrollHeight; //内容高度
            var scrollTop = $(this).scrollTop(); //滚动高度
            if (scrollTop / (contentH - viewH) >= 0.95) { //到达底部100px时,加载新内容
                var wxUin = $(this).attr("WxUin");
                var pageSize = $("#FriendcircleUl_" + wxUin).attr("pageSize");
                var pageIndex = $("#FriendcircleUl_" + wxUin).attr("pageIndex");
                var totleCount = $("#FriendcircleUl_" + wxUin).attr("totleCount");
                var isCurrentUser = ($("#FriendcircleUl_" + wxUin).attr("isCurrentUser") == "true");
                var userId = $("#FriendcircleUl_" + wxUin).attr("userId");
                if (isCurrentUser) {
                    userId = null;
                }
                var totlePageCount = (totleCount % pageSize > 0 ? 1 : 0) + parseInt(parseInt(totleCount) / parseInt(pageSize));
                if (pageIndex < totlePageCount) {
                    // var sendData = {
                    //     wxuin: weixin,
                    //     pageindex: parseInt(pageIndex) + 1,
                    //     pagesize: 20
                    // };
                    // socket.emit('lastcontactslist', sendData);
                    GetFriendCircle(wxUin, parseInt(pageIndex) + 1, pageSize, isCurrentUser, userId);
                }
            }
        });
        //弹框绑定朋友圈对象滚动条时间
        $("div.right").bind("scroll", function() {

            var viewH = $(this).height(); //可见高度
            var contentH = $(this).get(0).scrollHeight; //内容高度
            var scrollTop = $(this).scrollTop(); //滚动高度
            if (scrollTop / (contentH - viewH) >= 0.95) { //到达底部100px时,加载新内容
                var wxUin = $(this).attr("WxUin");
                var pageSize = $("#checkFriendcircleUl_" + wxUin).attr("pageSize");
                var pageIndex = $("#checkFriendcircleUl_" + wxUin).attr("pageIndex");
                var totleCount = $("#checkFriendcircleUl_" + wxUin).attr("totleCount");
                var isCurrentUser = ($("#checkFriendcircleUl_" + wxUin).attr("isCurrentUser") == "true");
                var userId = $("#checkFriendcircleUl_" + wxUin).attr("userId");
                if (isCurrentUser) {
                    userId = null;
                }
                var totlePageCount = (totleCount % pageSize > 0 ? 1 : 0) + parseInt(parseInt(totleCount) / parseInt(pageSize));
                if (pageIndex < totlePageCount) {

                    GetFriendCircle(weixin, parseInt(pageIndex) + 1, pageSize, isCurrentUser, userId);
                }
            }
        });
        //聊天群 对象点击
        ChatGrouptractClick();
    });
    /** 消息发送报告 */
    socket.on('sendmessagereport', function(msg) {
        console.log("消息发送报告");
        console.dir(msg);
        //如果消息发送失败就标记当前消息失败了
        if (!msg.state) {
            var tipHtml = "<span title=\"发送失败，点击重发\" onclick=\"ReSendMessage(this);\" style=\"cursor: pointer;\" class=\"tip\">!</span>";
            var reasonHtml = "<div class=\"ng-scope\">" +
                "                <p class=\"message_system\">" +
                "                    <span class=\"ng-binding\">" + msg.errorMessage + "</span>" +
                "                </p>" +
                "            </div>";
            if ($(".rightli[newMessageId=" + msg.messageId + "]").find("span.tip").length < 1) {
                $(".rightli[newMessageId=" + msg.messageId + "]").find(".content").append(tipHtml);
                $(".rightli[newMessageId=" + msg.messageId + "]").append(reasonHtml);
            }
            var msgId = msg.messageId;
            if ($("#" + msgId).length > 1) {
                $("#" + msgId).attr("loadstate", "false");
                $("#" + msgId).find("img[stype=chatimg]").each(function() {
                    var chatimg = $(this);
                    var imgsrc = chatimg.attr("src");
                    if (imsrc == "/images/loading.gif" && $(this).hasClass("cover")) {
                        chatimg.attr("src", "/images/load/load-failsmall.png");
                    } else {
                        chatimg.attr("src", "/images/load/load-failmiddle.png");
                    }

                });
            }
        } else {
            var msgId = msg.messageId;
            if ($("#" + msgId).length < 1) {
                setTimeout(function() {
                    $("#" + msgId).attr("state", "true");
                    $("#" + msgId).removeAttr("loadstate");
                    $("#" + msgId).find("a[stype=chatfile]").each(function() {
                        var realSrc = $(this).attr("real-src");
                        if (realSrc == undefined || realSrc == "") {
                            realSrc = imgsrc;
                        }
                        $(this).attr("href", realSrc);
                    });
                    $("#" + msgId).find("img[stype=chatimg]").each(function() {
                        var chatimg = $(this);
                        var imgsrc = chatimg.attr("src");
                        var realSrc = chatimg.attr("real-src");
                        if (realSrc == undefined || realSrc == "") {
                            realSrc = imgsrc;
                        }
                        chatimg.attr("src", "");
                        chatimg.attr("src", realSrc);
                    });
                }, 4000);
            } else {
                $("#" + msgId).attr("state", "true");
                $("#" + msgId).removeAttr("loadstate");
                $("#" + msgId).find("a[stype=chatfile]").each(function() {
                    var realSrc = $(this).attr("real-src");
                    if (realSrc == undefined || realSrc == "") {
                        realSrc = imgsrc;
                    }
                    $(this).attr("href", realSrc);
                });
                $("#" + msgId).find("img[stype=chatimg]").each(function() {
                    var chatimg = $(this);
                    var imgsrc = chatimg.attr("src");
                    var realSrc = chatimg.attr("real-src");
                    if (realSrc == undefined || realSrc == "") {
                        realSrc = imgsrc;
                    }
                    chatimg.attr("src", "");
                    chatimg.attr("src", realSrc);
                });

            }


        }
    });
    /** 消息接受报告 */
    socket.on('servicemessagereport', function(msg) {
        if (msg.state) { //标记服务器获取的消息ID
            $("#" + msg.messageId).attr("newMessageId", msg.newMessageId);
        } else {
            if (msg.message == "当前客户端没有登录") {
                layer.confirm('当前客户端没有登录，请重新打开聊天系统', {
                    btn: ['确定'] //按钮
                }, function() {
                    window.close();
                });
            }
        }
    });
    /** 心跳 */
    socket.on('heartbeat', function(msg) {
        $("#guocontainer").attr("lastheartbeat", getCommonFormatDate(new Date()));
        if ($("#guocontainer").is(':hidden')) {
            return;
        }
        if (!msg.state) {


            var lastAutologin = $("#guocontainer").attr("lastAutologin");
            if (lastAutologin == undefined) {

            } else { //自动登录的时间间隔太短可能是因为多个客户端连接 要提示用户并刷新
                var d1 = new Date();
                var d2 = new Date(Date.parse(lastAutologin));
                if ((d1.getTime() - d2.getTime()) <= (5 * 60 * 1000)) {
                    layer.confirm('当前客户端没有登录，请重新打开聊天系统', {
                        btn: ['确定'] //按钮
                    }, function() {
                        window.location.reload();
                    });
                    return;
                }
            }


            autoLogin();
            $("#guocontainer").attr("lastAutologin", getCommonFormatDate(new Date()));
            var autologinCount = 1;
            if ($("#guocontainer").attr("autologinCount") != undefined && parseInt($("#guocontainer").attr("autologinCount")) > 0) {
                autologinCount += parseInt($("#guocontainer").attr("autologinCount"));
            }
            $("#guocontainer").attr("autologinCount", autologinCount);
            // window.location.reload();
            // layer.confirm('当前客户端没有登录，请重新打开聊天系统', {
            //     btn: ['确定'] //按钮
            // }, function() {
            //     // window.location.href = chatRoomUrl;
            //     window.location.reload();
            // });
        }
    });

    /** 接收到其他系统的消息 */
    socket.on('otherclientsendmessage', function(res) {
        //暂时不考虑群发
        var msg = res.result[0];
        var appendContent = msg.MessageContent;
        if (msg.MessageType == 1) {
            appendContent = disposQQFace(appendContent);
        }
        var wxUin = msg.WxUin;
        var chatcontentid = "chatconten_" + msg.UserId + "_" + wxUin;

        var addTimeSpan = GetIsAddTimeSpan(chatcontentid);
        AddMyMessage(msg.UserId, msg.Id, appendContent, msg.MessageType, addTimeSpan, new Date(), false, true, wxUin);
    });

    /** 获取用户分组 */
    socket.on('getusertype', function(msg) {
        if (!msg.state) {
            layer.msg("获取用户分组数据失败");
        } else {
            $("#sel_all_group").html("");
            for (var i = 0; i < msg.result.length; i++) {
                $("#sel_all_group").append("<option value=\"" + msg.result[i].UserTypeId + "\">" + msg.result[i].UserTypeName + "</option>");
            }
        }
    });


    /** 接收到消息 */
    socket.on('privatemessage', function(data) {
        console.log("privatemessage");
        console.dir(data);
        var msgdata = data.result;
        var notDisplayCount = {};
        for (var i = 0; i < msgdata.length; i++) {

            var msg = msgdata[i];
            var userid = msg.UserId;
            var wxUin = msg.WxUin;
            var chatcontentid = "chatconten_" + userid + "_" + wxUin;
            var headImg = $("#contractli" + userid + "_" + wxUin).attr("HeadImgUrl");

            var lastmsg = msg.MessageContent;
            var messagetype = msg.MessageType;
            var messageTime = new Date(Date.parse(msg.MessageDateTime));

            if (messagetype == 3 || messagetype == 47) {
                lastmsg = "[图片消息]";
            } else if (messagetype == 62 || messagetype == 43) {
                lastmsg = "[视频消息]";
            } else if (messagetype == 34) {
                lastmsg = "[语音消息]";
            } else if (messagetype == 49) {
                lastmsg = "[分享消息]";
            } else if (messagetype == 42) {
                lastmsg = "[分享名片]";
            } else if (messagetype == 6) {
                lastmsg = "[分享文件]";
            }

            if (isMinStatus() || document.hidden) {
                notifyreceivechatmeaasge("新的消息", lastmsg, headImg);
            }

            if (notDisplayCount[wxUin] == undefined || notDisplayCount[wxUin] == null) {
                notDisplayCount[wxUin] = 0;
            }
            var msgId = msg.Id;

            var contractliId = "current_contractli_" + userid + "_" + wxUin;
            var currentli = $("#" + contractliId);
            if (currentli.length < 1) {
                var contacts = $("#contractli" + userid + "_" + wxUin);
                ShowChat(contacts, false, false);
            }
            var first_li = $("#currentContractList" + "_" + wxUin).find("li").eq(0);
            currentli.insertBefore(first_li);

            var chatcontentid = "chatconten_" + userid + "_" + wxUin;
            var addTimeSpan = GetIsAddTimeSpan(chatcontentid);
            var isShowRealPic = false;
            if (msg.MessageState == "2") //下载成功  1 正在下载  3下载失败
            {
                isShowRealPic = true;
            }
            AddReciveMessage(msgId, addTimeSpan, messageTime, userid, msg.MessageType, msg.MessageContent, false, true, wxUin, isShowRealPic, msg.MessageState, msg.IsSendMessage);




            //显示未读取的数量
            var notreadcount = 1;
            if ($("#" + contractliId + ">.content>.tip").length > 0) {
                var tipCount = $("#" + contractliId + ">.content>.tip").html() == "NaN" ? "0" : $("#" + contractliId + ">.content>.tip").html();
                notreadcount += parseInt(tipCount == "new" ? "0" : tipCount);
            }

            $("#" + contractliId + ">.content>.tip").remove();
            if (!$("#" + contractliId).hasClass("activeChat")) { //当前联系没有被选中
                if (notreadcount > 0) {
                    notDisplayCount[wxUin] = notDisplayCount[wxUin] + 1;
                    $("#" + contractliId + ">.content").append("<p class=\"tip fs12\">" + notreadcount + "</p>");
                }
            } else if (!$("#CurrentChatMenuLi" + "_" + wxUin).hasClass("selected")) { //当前页签没有被选中
                if (notreadcount > 0) {
                    notDisplayCount[wxUin] = notDisplayCount[wxUin] + 1;
                    $("#" + contractliId + ">.content").append("<p class=\"tip fs12\">" + notreadcount + "</p>");
                }
            } else if (!$("ul[sign=weixin_list_ul][wxuin=" + wxUin + "]").hasClass("select")) //当前微信没有显示
            {
                if (notreadcount > 0) {
                    notDisplayCount[wxUin] = notDisplayCount[wxUin] + 1;
                    $("#" + contractliId + ">.content").append("<p class=\"tip fs12\">" + notreadcount + "</p>");
                }
            }


        }
        //传递消息可能会有多个微信
        for (var wxUin in notDisplayCount) {
            if (notDisplayCount[wxUin] > 0) {

                //显示左侧菜单未读取数量
                var showCount = notDisplayCount[wxUin];
                var tipId = "menuTip_p" + "_" + wxUin;
                if ($("#" + tipId).length > 0) {
                    showCount += parseInt($("#" + tipId).html() == "NaN" ? "0" : $("#" + tipId).html());
                }
                var menuTip = "<p sign=\"menuTip_p\" id=\"" + tipId + "\" class=\"tip fs12\">" + showCount + "</p>";
                $("#" + tipId).remove();
                $("#CurrentChatMenuLi" + "_" + wxUin).append(menuTip); //所有消息数量

                //显示顶部切换未读数量
                var currentChatLi = $("ul[sign=weixin_list_ul]>li[wxuin=" + wxUin + "]");
                if (currentChatLi.hasClass("select")) {
                    currentChatLi.find(".new").remove();
                } else {
                    var totalCount = 0;
                    var groupCount = parseInt($("#ChatGroupLi" + "_" + wxUin).find("p[stype=menutip]").html());
                    if (!(groupCount > 0)) {
                        groupCount = 0;
                    }
                    var chatCount = parseInt($("#CurrentChatMenuLi" + "_" + wxUin).find("p[sign=menuTip_p]").html());
                    if (!(chatCount > 0)) {
                        chatCount = 0;
                    }
                    totalCount = groupCount + chatCount;
                    currentChatLi.find(".new").remove();
                    if (totalCount > 0) {
                        currentChatLi.append("    <p class=\"new\">" + totalCount + "</p>");
                    }
                    // var oldCount = parseInt(currentChatLi.find(".new").html());
                    // var currentReceive = notDisplayCount[wxUin];
                    // if (!(oldCount > 0)) {
                    //     oldCount = 0;
                    // }
                    // oldCount = oldCount + currentReceive;
                    // currentChatLi.find(".new").remove();
                    // if (oldCount > 0) {
                    //     currentChatLi.append("    <p class=\"new\">" + oldCount + "</p>");
                    // }

                }
            }
        }
    });
    /** 获取到历史消息记录 */
    socket.on('getchatmessagelist', function(msgData) {
        if (!msgData.state) {
            layer.msg("获取聊天记录数据失败");
        } else {
            $("#message_record_content").html("");
            for (var i = 0; i < msgData.result.length; i++) {
                var msg = msgData.result[i];
                var msgDate = new Date(Date.parse(msg.CreateTime));
                var dayTime = getYYYMMDDFormatDate(msgDate);
                var divDayId = "msg_content_" + dayTime;
                if ($("#" + divDayId).length < 1) {
                    var divHtml = "<div id=\"" + divDayId + "\" class=\"line\">" +
                        "<p class=\"line_p\"></p>" +
                        "<p>" + dayTime + "</p>" +
                        "<p class=\"line_p\"></p>" +
                        "</div>";
                    $("#message_record_content").prepend(divHtml);
                }
                var userId = msg.UserId;
                var wxUin = msg.WxUin;
                var talkUserName = "";
                var msgColor = "blue";
                var msgId = "record_list_" + msg.Id;
                if (msg.IsSendMessage) {
                    msgColor = "green";
                    talkUserName = msg.FromNickName;
                    // talkUserName =  $("#contractli" + userId + "_" + wxUin).attr("WxUinNickName");
                } else {
                    msgColor = "blue";
                    talkUserName = msg.FromNickName;
                    // talkUserName = $("#contractli" + userId + "_" + wxUin).attr("NickName");
                }
                var messageContent = msg.MessageContent;
                var messageType = msg.MessageType;

                var messageHtml = "";
                messageHtml += disposeMessageShowHtml(msgId, messageContent, messageType, userId, wxUin, true, true);
                var msgHtml = "<ul id=\"" + msgId + "\">" +
                    "<li state=\"true\">" +
                    "<p class=\"" + msgColor + "\"><span>" + talkUserName + "</span><span>" + getHHmmFormatDate(msgDate) + "</span></p>" +
                    "<p class=\"contentp\">" + messageHtml + "</p>" +
                    "</li>" +
                    "</ul>";
                $("#" + divDayId).after(msgHtml);
            }
            var totalCount = msgData.count;
            $("#message_record").attr("totalCount", msgData.count);
            var z = msgData.count % 20;
            var totalPageCount = 0;
            if (z == 0) {
                totalPageCount = msgData.count / 20;
            } else {
                totalPageCount = (msgData.count - z) / 20 + 1;
            }
            $("#message_record").attr("totalPageCount", totalPageCount);
        }
    });


    /** 新联系人 */
    socket.on('newcontractlist', function(msg) {
        for (var i = 0; i < msg.result.length; i++) {
            var contract = msg.result[i];
            var wxuin = contract.WxUin;
            if (CheckFirstLetterIsSpec(contract.FirstLetter)) {
                contract.FirstLetter = "None";
            }
            var py = contract.FirstLetter;
            var pySpanId = "contract_py_" + py + "_" + wxuin;
            var olId = "group_ol_" + contract.UserTypeId + "_" + wxuin;
            var groupName = contract.UserTypeName;
            var groupKey = contract.UserTypeId;
            var contractHtml = CreateContract(contract, "contractli");

            if ($("#" + pySpanId).length < 1) {
                var pySpanIHtml = "<span id=\"" + pySpanId + "\" sign=\"" + pySpanId + "\" class=\"lianxi1\"><div class=\"zimu1\">" + py + "</div></span>";
                $("#contactlist" + "_" + wxuin).append(pySpanIHtml);
            }
            $("#" + pySpanId).after(contractHtml); //联系人

            var groupContractHtml = CreateContract(contract, "contractli_group_");
            if ($("#" + olId).length < 1) {
                var groupHtml = "<span class=\"lianxi2\">" +
                    "<div class=\"zimu1\">" + groupName + "<i class=\"icon-under\"></i><i groupKey=\"" + groupKey +
                    "\"  groupName=\"" + groupName + "\" WxUin=\"" + WxUin + "\" onclick=\"SendGroupMessage(this);\" class=\"icon-message\"></i></div>" +
                    "</span>" +
                    "<ol groupkey=\"" + groupKey + "\" id=\"" + olId + "\" groupname=\"" + groupName + "\" sign=\"" + olId + "\">" +
                    "</ol>";
                $("#group_contactlist" + "_" + wxuin).append(groupHtml);

            }
            $("#" + olId).append(groupContractHtml);
            //群发数量修改
            var contractliId = "current_contractli_group_" + groupKey + "_" + wxuin;
            if ($("#" + contractliId).length > 0) {
                var totleCount = $("#" + olId + "").find("li").length;
                $("#" + contractliId).find("p.name").html("群组_" + groupName + "(" + totleCount + ")");
                $("#chatconten_group_" + groupKey + "_" + "_" + wxuin).find("p.name").html("群组_" + groupName + "(" + totleCount + ")");
            }

            //显示新用户
            ShowChat($("#contractli" + contract.UserId + "_" + wxuin), false, false);

            socket.emit('getlastchatmessagelist', {
                userid: contract.UserId,
                wxuin: wxuin
            });
        }
        // $("ul[sign=contactlist]").find("li").each(function() {
        //     if ($(this).attr("IsNew") == "true") {
        //         $(this).click();
        //         ShowChat(this, false, false);
        //     }
        // });

    });

    /** 删除联系人 */
    socket.on('deletecontractlist', function(msg) {
        console.log("deletecontractlist");
        console.dir(msg);
        var wxUin = msg.wxUin;
        for (var i = 0; i < msg.result.length; i++) {
            var userid = msg.result[i];
            //删除联系人
            $("#contractli" + userid + "_" + wxUin).remove();

            var groupObj = $("#contractli_group_" + userid + "_" + wxUin).parent();
            var oldUserType = groupObj.prev().find(".icon-message").attr("groupKey");
            //删除组联系人
            if (groupObj.find("li").length == 1) {
                //删除组
                groupObj.remove();
                //移除群聊
                $("#current_contractli_group_" + oldUserType + "_" + wxUin).remove();
                $("#chatconten_group_" + oldUserType + "_" + wxUin).remove();
            } else {
                $("#contractli_group_" + userid + "_" + wxUin).remove();
                //修改群聊数量
                var olId = "group_ol_" + oldUserType + "_" + wxUin;
                if ($("#current_contractli_group_" + oldUserType + "_" + wxUin).length > 0) {
                    var totleCount = $("#" + olId).find("li").length;
                    var userTypeName = $("#" + olId).attr("groupName");
                    $("#current_contractli_group_" + oldUserType + "_" + wxUin).find("p.name").html("群组_" + userTypeName + "(" + totleCount + ")");
                    $("#chatconten_group_" + oldUserType + "_" + wxUin).find("p.name").html("群组_" + userTypeName + "(" + totleCount + ")");
                }
            }


            //删除当前对话
            $("#current_contractli_" + userid + "_" + wxUin).remove();
            $("#chatconten_" + userid + "_" + wxUin).remove();
        }
    });

    /** 更新联系人 */
    socket.on('updatecontractlist', function(msg) {
        for (var i = 0; i < msg.result.length; i++) {
            var contract = msg.result[i];
            var userid = contract.UserId;
            var wxUin = contract.WxUin;
            $("#contractli" + userid + "_" + wxUin).remove();
            $("#contractli_group_" + userid + "_" + wxUin).remove();
            if (CheckFirstLetterIsSpec(contract.FirstLetter)) {
                contract.FirstLetter = "None";
            }
            var py = contract.FirstLetter;
            var pySpanId = "contract_py_" + py + "_" + wxUin;
            var olId = "group_ol_" + contract.UserTypeId + "_" + wxUin;
            var groupName = contract.UserTypeName;
            var groupKey = contract.UserTypeId;
            var oldGroupName = $("#contractli" + contract.UserId + "_" + wxUin).attr("UserTypeName");
            var oldGroupKey = $("#contractli" + contract.UserId + "_" + wxUin).attr("UserTypeId");


            $("#current_contractli_" + userid + "_" + wxUin).find(".img>img").attr("src", contract.HeadImgUrl);
            var contractHtml = CreateContract(contract, "contractli");
            if ($("#" + pySpanId).length < 1) {
                var pySpanIHtml = "<span sign=\"" + pySpanId + "\" id=\"" + pySpanId + "\" class=\"lianxi1\"><div class=\"zimu1\">" + py + "</div></span>";
                $("#contactlist" + "_" + wxUin).append(pySpanIHtml);
            }
            $("#" + pySpanId).after(contractHtml); //联系人

            var groupContractHtml = CreateContract(contract, "contractli_group_");
            if ($("#" + olId).length < 1) {
                var groupHtml = "<span class=\"lianxi2\">" +
                    "<div class=\"zimu1\">" + groupName + "<i class=\"icon-under\"></i>" +
                    "<i WxUin=\"" + wxUin + "\" groupKey=\"" + groupKey + "\"  groupName=\"" + groupName + "\" onclick=\"SendGroupMessage(this);\" class=\"icon-message\"></i></div>" +
                    "</span>" +
                    "<ol groupkey=\"" + groupKey + "\" groupname=\"" + groupName + "\" id=\"" + olId + "\">" +
                    "</ol>";
                $("#group_contactlist").append(groupHtml);

            }
            $("#" + olId).append(groupContractHtml);
            //群发数量修改
            var contractliId = "current_contractli_group_" + groupKey + "_" + wxUin;
            if ($("#" + contractliId).length > 0) {
                var totleCount = $("#" + olId).find("li").length;
                $("#" + contractliId).find("p.name").html("群组_" + groupName + "(" + totleCount + ")");
                $("#chatconten_group_" + groupKey + "_" + wxUin).find("p.name").html("群组_" + groupName + "(" + totleCount + ")");
            }

            var oldContractliId = "current_contractli_group_" + oldGroupKey + "_" + wxUin;

            if ($("#" + oldContractliId).length > 0) {


                var oldOlId = "group_ol_" + oldGroupKey + "_" + wxUin;
                var oldTotleCount = $("#" + oldOlId).find("li").length;
                $("#" + oldContractliId).find("p.name").html("群组_" + oldGroupName + "(" + oldTotleCount + ")");
                $("#chatconten_group_" + oldGroupKey + "_" + wxUin).find("p.name").html("群组_" + oldGroupName + "(" + oldTotleCount + ")");
            }

        }
    });


    /**群组列表 */
    socket.on('chatgrouplist', function(msg) {
        if (msg.state) {
            var wxUinArray = {};
            for (var i = 0; i < msg.result.length; i++) {
                var chatGroup = msg.result[i];
                var wxUin = chatGroup.WxUin;
                if (wxUinArray[wxUin] == undefined || wxUinArray[wxUin] == null) {
                    wxUinArray[wxUin] = {};
                }

            }
            for (var wxUin in wxUinArray) {

                $("#GroupContractList" + "_" + wxUin).html("");
                $("#GroupContractContent" + "_" + wxUin).html("");
            }

            for (var i = 0; i < msg.result.length; i++) {
                var chatGroup = msg.result[i];
                chatGroup.UserId = chatGroup.ContactId;
                chatGroup.WxUinNickName = chatGroup.NickName;
                CreateChatGroupHtml(chatGroup);

                var sendData = { userid: chatGroup.ContactId, wxuin: chatGroup.WxUin };
                socket.emit("groupcontractdetail", sendData);
            }
        }

    });

    /** 群详情 */
    socket.on('groupcontractdetail', function(data) {
      // console.log(data);
        if (data.state) {
            var userId = data.userId;
            if (data.result.length < 1) {
                return;
            }
            var wxUin = data.result[0].WxUin;
            var groupUserUl = "chat_group_content_ul_" + userId + "_" + wxUin;
            $("#" + groupUserUl).find("li[stype=group_chat_user_li]").remove();
            for (var i = 0; i < data.result.length; i++) {
                var groupUser = data.result[i];
                groupUser.NickName = ReplaceAll(groupUser.NickName, "'", "\\'");
                groupUser.NickName = ReplaceAll(groupUser.NickName, "\"", "\\'");
                var username = groupUser.UserName.replace("@", "");
                if (username == "") {
                    continue;
                }
                var showUsrName = groupUser.RemarkName;
                if (showUsrName == null || showUsrName == "") {
                    showUsrName = groupUser.NickName;
                }

                var encodeNickName = ReplaceAll(groupUser.NickName, "'", "\\'");
                encodeNickName = ReplaceAll(encodeNickName, "\"", "\\'");
                var encodeRemark = ReplaceAll(groupUser.RemarkName, "'", "\\'");
                encodeRemark = ReplaceAll(encodeRemark, "'", "\\'");
                var initial = ReplaceAll(groupUser.RemarkPYInitial, "'", "\\'");
                initial = ReplaceAll(initial, "'", "\\'");

                var onclikHtml = "";
                if (groupUser.ContactId == null) {
                    console.dir(groupUser);
                    continue;
                }
                var msgUserId = groupUser.ContactId.replace("@", "");
                if ($("#contractli" + msgUserId + "_" + wxUin).length > 0 && groupUser.Owner == true) {
                    onclikHtml = " onclick =\"ShowUserBusinessCard(this,'" + msgUserId + "');\" ";
                } else if (!groupUser.IsSelf) {
                    onclikHtml = " onclick =\"ShowGroupAddUserCard(this,'" + userId + "');\" ";
                }

                if ($("#" + groupUserUl).find("li[sign=" + username + "]").length < 1) {
                    var appendHtml = "       <li" +
                        " FirstLetter=\"" + groupUser.FirstLetter + "\"" +
                        " wxUin=\"" + groupUser.WxUin + "\"" +
                        " msgUserId=\"" + msgUserId + "\"" +
                        " NickName=\"" + htmlEncode(encodeNickName) + "\"" +
                        " Remark=\"" + htmlEncode(encodeRemark) + "\"" +
                        " Initial=\"" + htmlEncode(initial) + "\"" +
                        " UserName=\"" + groupUser.UserName + "\"" +
                        " UserId=\"" + groupUser.ChatRoomId + "\"" +
                        " Owner=\"" + groupUser.Owner + "\"" +
                        " IsSelf=\"" + groupUser.IsSelf + "\"" +
                        " HeadImgUrl=\"" + htmlEncode(groupUser.HeadImgUrl) + "\"" +
                        onclikHtml +
                        " stype=\"group_chat_user_li\" sign=\"" + username + "\">" +
                        "                            <img src=\"" + groupUser.HeadImgUrl + "\">" +
                        "                            <p>" + showUsrName + "</p>" +
                        "                        </li>";
                    $("#" + groupUserUl).append(appendHtml);
                }

            }
            $("#chatgroup_" + userId + "_" + wxUin + ">.content>.name").find("span[stype=groupcount]").html("(" + data.result.length + ")");
            $("#chatgroupcontent_" + userId + "_" + wxUin + ">.top>.name").find("span[stype=groupcount]").html("(" + data.result.length + ")");
            // if (!data.IsNewChatGroup) {
            //     socket.emit("getlastchatgroupchatmessagelist", { userId: userId });
            // }

        }

    });
    /**新的群组 */
    socket.on('newgrouplist', function(msg) {
        console.log("newgrouplist");
        console.dir(msg);
        var timestamp = Date.parse(new Date());
        console.dir(new Date());
        console.dir(timestamp);
        for (var i = 0; i < msg.result.length; i++) {
            var chatGroup = msg.result[i];

            CreateChatGroupHtml(chatGroup);
            var sendData = { userid: chatGroup.UserId.replace("@@", ""), isNewChatGroup: true };
            socket.emit("groupcontractdetail", sendData);
        }

    });
    /**删除群组 */
    socket.on('deletegrouplist', function(msg) {
        for (var i = 0; i < msg.result.length; i++) {
            var userid = msg.result[i].replace("@@", "");
            var contractliId = "chatgroup_" + userid;
            $("#" + contractliId).remove();
            var chatcontentid = "chatgroupcontent_" + userid;
            $("#" + chatcontentid).remove();
        }
    });
    /**更新群组 */
    socket.on('updategrouplist', function(msg) {
        for (var i = 0; i < msg.result.length; i++) {
            var chatGroup = msg.result[i];
            CreateChatGroupHtml(chatGroup);
            var sendData = { userid: chatGroup.UserId.replace("@@", "") };
            socket.emit("groupcontractdetail", sendData);
        }
    });
    //接收到群聊可以添加的好友
    socket.on("groupcanaddcontractlist", function(data) {
        var showHtml = "<div class=\"maintTop\">";
        showHtml += " <ul>";
        showHtml += "     <li onclick=\"toggleShowChooseUser(this)\" class=\"select\">";
        showHtml += "      <p>&nbsp;&nbsp;&nbsp;按备注查找</p>";
        showHtml += "     </li>";
        showHtml += "     <li onclick=\"toggleShowChooseUser(this)\" >";
        showHtml += "      <p>&nbsp;&nbsp;&nbsp;按分组查找</p>";
        showHtml += "     </li>";
        showHtml += " </ul>";
        showHtml += " </div>";
        showHtml += " <div class=\"search_bar\" style=\"position:relative;height:50px;margin-top:36px;\">" +
            "          <i class=\"icon-search\" style=\"position:relative; top:0px; left:353px;\"></i>" +
            "          <input type=\"text\" onkeyup=\"searchGroupContract(this);\"  class=\"fs14\" placeholder=\"搜索\" style=\"width:90%; height:30px; text-indent:10px; border:1px solid #d1d6e4;margin-top:10px;\">" +
            "      </div>" +
            "      <div class=\"addmain\" stype=\"choosuser\" sindex=\"0\">";
        var firstLetterArry = {};
        var groupArry = {};
        //备注查找
        for (var i = 0; i < data.result.length; i++) {
            var contract = data.result[i];
            var firstLetter = contract.FirstLetter;
            if (firstLetterArry[firstLetter] == undefined || firstLetterArry[firstLetter] == null) {
                firstLetterArry[firstLetter] = [];
            }

            var userTypeId = contract.UserTypeId;
            if (groupArry[userTypeId] == undefined || groupArry[userTypeId] == null) {
                groupArry[userTypeId] = { UserTypeName: contract.UserTypeName, contractsliList: [] };
            }

            var strCheck = "";
            var showName = contract.Remark;
            if (showName == null || showName == "") {
                showName = contract.NickName;
            }
            var encodeNickName = ReplaceAll(contract.NickName, "'", "\\'");
            encodeNickName = ReplaceAll(encodeNickName, "\"", "\\'");
            var encodeRemark = ReplaceAll(contract.Remark, "'", "\\'");
            encodeRemark = ReplaceAll(encodeRemark, "'", "\\'");
            contract.Initial = ReplaceAll(contract.Initial, "'", "\\'");
            contract.Initial = ReplaceAll(contract.Initial, "'", "\\'");
            var contractObj = $("#contractli" + contract.UserName.replace("@", "") + "_" + contract.WxUin);
            var quanPin = "";
            if (contractObj.length > 0) {
                quanPin = contractObj.attr("QuanPin");
            }
            var inputBox = "";
            if (contract.ChatRoomUserName != null && contract.ChatRoomUserName.length > 0) {
                inputBox = "disabled checked";
            }
            /*if(encodeRemark.indexOf("没有退路")> -1){
                inputBox = ""
            }*/
            var contractsli = "<li " +
                " NickName=\"" + htmlEncode(encodeNickName) + "\" " +
                " Remark=\"" + htmlEncode(encodeRemark) + "\"" +
                " FirstLetter=\"" + contract.FirstLetter + "\"" +
                " Initial=\"" + htmlEncode(contract.Initial) + "\"" +
                " QuanPin=\"" + htmlEncode(quanPin) + "\" >" +
                "<input username=\"" + contract.UserName + "\" userid=\"" +
                contract.UserId + "\" type=\"checkbox\" " + inputBox + ">" +
                "<img src=\"" + contract.HeadImgUrl + "\">" +
                "<p class=\"add_ulP\">" + showName + "</p>" +
                "</li>";
            firstLetterArry[firstLetter].push(contractsli);
            groupArry[userTypeId].contractsliList.push(contractsli);
        };
        for (var firstLetter in firstLetterArry) {
            showHtml += "<div firstLetter=\"" + firstLetter + "\"  class=\"addtitle\">" + firstLetter + "</div>";
            showHtml += "<ul class=\"add_ul\" firstLetter=\"" + firstLetter + "\">";
            for (var i = 0; i < firstLetterArry[firstLetter].length; i++) {
                showHtml += firstLetterArry[firstLetter][i];
                testli = firstLetterArry[firstLetter][i];
            }
            showHtml += "</ul>";
            showHtml += "<div style=\"clear:both\"></div>";
        }
        showHtml += "      </div>";
        /********拼装分组HTML*********/
        showHtml += " <div class=\"addmain\" style=\"display:none;\" stype=\"choosuser\" sindex=\"1\"> "
        for (var group in groupArry) {
            showHtml += "      <div usertypeid=\"group\" usertypename=\"" + groupArry[group].UserTypeName + "\" class=\"addtitle\" style=\"border-bottom: 1px solid #e8edfa;\">" +
                groupArry[group].UserTypeName + "<i class=\"icon-under\" onclick=\"Ishow(this)\"></i></div>";
            showHtml += "        <ul class=\"add_ul\"  >";
            for (var i = 0; i < groupArry[group].contractsliList.length; i++) {
                showHtml += groupArry[group].contractsliList[i];
            }
            showHtml += "         </ul>";
        }
        // showHtml += "      <div usertypeid=\"1\" class=\"addtitle\">A</div>";
        // showHtml += "        <ul class=\"add_ul\"  >";
        // showHtml += testli;
        // showHtml += "         </ul>";
        showHtml += "  </div>";


        //页面层
        layer.open({
            type: 1,
            title: "发起群聊",
            skin: 'layui-layer-rim', //加上边框
            area: ['420px', '600px'], //宽高
            content: showHtml,
            btn: ["确定", "取消"],
            yes: function(index, layero) {
                var chooseUser = [];
                $(".addmain").find("input[type=checkbox]").each(function() {
                    if ($(this)[0].checked && $(this)[0].disabled == false) {
                        chooseUser.push($(this).attr("username"));
                    }


                });
                //群聊天加人
                var sendDate = {
                    wxuin: data.wxuin,
                    userid: data.userId.replace("@@", ""),
                    usernamelist: chooseUser

                };
                socket.emit('chatgroupaddcontract', sendDate);
                layer.close(index);
            },
            btn2: function(index, layero) {
                layer.close(index);
            }
        });
    })


    /** 接收到最近联系人列表 */
    socket.on('lastcontactslist', function(data) {
        var msg = data.result;
        var userIdList = [];
        if (msg.length < 1) {
            return;
        }
        console.log(msg);
        var wxUin = msg[0].WxUin;

        for (var i = 0; i < msg.length; i++) {
            var userId = msg[i].ContactId;
            wxUin = msg[i].WxUin;
            var contacts = $("#contractli" + userId + "_" + wxUin);
            if (contacts.length > 0) {
                userIdList.push(msg[i].ContactId);
                contacts.click();
                ShowChat($("#contactInfo_div" + "_" + wxUin).find("a.button"), false, true);
                var contractliId = "current_contractli_" + userId + "_" + wxUin;
                $("#" + contractliId).attr("isLast", "true");
                var contractliId = "current_contractli_" + userId + "_" + wxUin;
                var msgDate = new Date(Date.parse(msg[i].MessageTime));
                setLastChatMessage(contractliId, msg[i].MessageContent, msg[i].MessageType, msgDate);
            }
        }
        // var pageSize = data.pagesize;
        // var pageIndex = data.pageindex;
        // var totleCount = data.count;
        // $("#charlist_" + wxUin).attr("pageSize", pageSize);
        // $("#charlist_" + wxUin).attr("pageIndex", pageIndex);
        // $("#charlist_" + wxUin).attr("totleCount", totleCount);
    });

    /** 删除最近联系人列表 */
    socket.on('deleteLastContracts', function(data) {
        if (data.state == false) {
            layer.msg("删除未成功");
            return;
        }
        var userid = data.userid;
        var wxUin = data.wxUin;
        var $ul = $(".One:visible").find("#currentContractList_" + wxUin);
        var $li = $ul.find("li[userid=" + userid + "]");
        $li.remove();
        $(".One:visible").find(".consh").removeClass("consh");
    });


    /** 新群消息 */
    socket.on('newgroupmessage', function(data) {
        console.log("newgroupmessage");
        console.dir(data);
        var timestamp = Date.parse(new Date());
        console.dir(new Date());
        console.dir(timestamp);
        var msgdata = data.result;
        var notDisplayCount = 0;

        for (var i = 0; i < msgdata.length; i++) {

            var msg = msgdata[i];

            var userid = msg.ChatRoomUserName.replace("@@", "");
            var msgId = msg.Id;
            if ($("#" + msgId).length > 0) {
                continue;
            }
            var wxUin = msg.WxUin;
            var chatcontentid = "chatgroupcontent_" + userid + "_" + wxUin;
            var addTimeSpan = GetIsAddTimeSpan(chatcontentid);
            var msgDate = new Date(Date.parse(msg.CreateTime));
            var messageContent = msg.MessageContent;
            var messageType = msg.MessageType;
            var headImg = msg.HeadImgUrl;
            var state = "false";
            var isShowRealPic = false;
            if (msg.MessageState == "2") //下载成功  1 正在下载  3下载失败
            {
                state = "true";
                isShowRealPic = true;
            }
            var liClass = "leftli";
            var divClass = "f1";
            if (msg.IsSendMessage) {
                liClass = "rightli";
                divClass = "fr";
            }
            var messageHtml = " <li wxuin=\"" + wxUin + "\" state=\"" + state + "\" id=\"" + msgId + "\" class=\"" + liClass + "\">";
            if ($("#" + chatcontentid).length < 1) //当前聊天为新的聊天
            {
                continue;

            }
            if (addTimeSpan) {
                $("#" + chatcontentid).attr("lastshowdate", getCommonFormatDate(msgDate));
                var showTime = getHHmmFormatDate(msgDate);
                messageHtml += "<p class=\"fs10\">" + showTime + "</p>";
            }
            var onclikHtml = "";
            var msgUserId = msg.UserId.replace("@", "");
            msgUserId = msgUserId.replace("@", "");
            if (msg.UserId != msg.ChatRoomUserName) { //群自己发的消息和自己的发的消息不会显示弹出用户信息
                if ($("#contractli" + msgUserId + "_" + wxUin).length > 0) {
                    onclikHtml = " onclick =\"ShowUserBusinessCard(this,'" + msgUserId + "');\" ";
                } else {
                    onclikHtml = " onclick =\"ShowAddUserCard(this,'" + userid + "');\" ";
                }
            }

            messageHtml += "       <div " +
                " UserId=\"" + userid + "\" " +
                " WxUin=\"" + wxUin + "\" " +
                " msgUserId=\"" + msgUserId + "\" " +
                " UserName=\"" + msgUserId + "\" " +
                onclikHtml +
                " class=\"img " + divClass + "\">" +
                "           <img src=\"" + htmlDecode(headImg) + "\">" +
                "       </div>" +
                "       <div class=\"content " + divClass + "\" messageType=\"" + messageType + "\">";
            var talkeName = msg.NickName == null ? "" : msg.NickName;
            if (!msg.IsSendMessage) {
                messageHtml += "<p class=\"talkeName\">" + talkeName + "</p>";
            }
            messageHtml += disposeMessageShowHtml(msgId, messageContent, messageType, userid, wxUin, false, isShowRealPic);
            messageHtml += "      </div>" +
                "  </li>";

            $("#" + chatcontentid + ">.middle>ul").append(messageHtml);


            var contractliId = "chatgroup_" + userid + "_" + wxUin;
            setLastChatMessage(contractliId, messageContent, messageType, msgDate);
            setTimeout(function() {
                $("#" + chatcontentid + ">.middle").scrollTop($("#" + chatcontentid + ">.middle")[0].scrollHeight);
            }, 200);
            $("#" + chatcontentid).attr("lastmsgdate", getCommonFormatDate(msgDate));


            //优先显示
            var contractliId = "chatgroup_" + userid + "_" + wxUin;
            var first_li = $("#GroupContractList" + "_" + wxUin).find("li").eq(0);
            var currentli = $("#" + contractliId);
            currentli.insertBefore(first_li);


            //显示未读取的数量
            var notreadcount = 1;
            if ($("#" + contractliId + ">.content>.tip").length > 0) {
                var tipCount = $("#" + contractliId + ">.content>.tip").html() == "NaN" ? "0" : $("#" + contractliId + ">.content>.tip").html();
                notreadcount += parseInt(tipCount == "new" ? "0" : tipCount);
            }

            $("#" + contractliId + ">.content>.tip").remove();
            if (!$("#" + contractliId).hasClass("activeChat")) {
                if (notreadcount > 0) {
                    notDisplayCount++;
                    $("#" + contractliId + ">.content").append("<p class=\"tip fs12\">" + notreadcount + "</p>");
                }
            } else if (!$("#ChatGroupLi" + "_" + wxUin).hasClass("selected")) {
                if (notreadcount > 0) {
                    notDisplayCount++;
                    $("#" + contractliId + ">.content").append("<p class=\"tip fs12\">" + notreadcount + "</p>");
                }
            } else if (!$("ul[sign=weixin_list_ul][wxuin=" + wxUin + "]").hasClass("select")) //当前微信没有显示
            {
                if (notreadcount > 0) {
                    notDisplayCount++;
                    $("#" + contractliId + ">.content").append("<p class=\"tip fs12\">" + notreadcount + "</p>");
                }
            }

        }

        // 显示所有未读
        if (notDisplayCount > 0) {
            var showCount = notDisplayCount;

            if ($("#ChatGroupLi" + "_" + wxUin).find("p[stype=menutip]").length > 0) {
                showCount += parseInt($("#ChatGroupLi" + "_" + wxUin).find("p[stype=menutip]").html() == "NaN" ? "0" : $("#ChatGroupLi" + "_" + wxUin).find("p[stype=menutip]").html());
            }
            var menuTip = "<p  stype=\"menutip\" class=\"tip fs12 menutip\">" + showCount + "</p>";
            $("#ChatGroupLi" + "_" + wxUin).find("p[stype=menutip]").remove();
            $("#ChatGroupLi" + "_" + wxUin).append(menuTip); //所有消息数量
        }
        //显示本微信未读消息
        //显示顶部切换未读数量
        var currentChatLi = $("ul[sign=weixin_list_ul]>li[wxuin=" + wxUin + "]");
        if (currentChatLi.hasClass("select")) {
            currentChatLi.find(".new").remove();
        } else {
            // var oldCount = parseInt(currentChatLi.find(".new").html());
            // var currentReceive = msgdata.length;
            // if (!(oldCount > 0)) {
            //     oldCount = 0;
            // }
            // oldCount = oldCount + currentReceive;
            var totalCount = 0;
            var groupCount = parseInt($("#ChatGroupLi" + "_" + wxUin).find("p[stype=menutip]").html());
            if (!(groupCount > 0)) {
                groupCount = 0;
            }
            var chatCount = parseInt($("#CurrentChatMenuLi" + "_" + wxUin).find("p[sign=menuTip_p]").html());
            if (!(chatCount > 0)) {
                chatCount = 0;
            }
            totalCount = groupCount + chatCount;
            currentChatLi.find(".new").remove();
            if (totalCount > 0) {
                currentChatLi.append("    <p class=\"new\">" + totalCount + "</p>");
            }

        }
    });

    //添加好友
    socket.on('addfriendresult', function(data) {
        layer.msg(data.message.Messge);

    });

    //创建群通知
    socket.on('creategroupnotify', function(data) {
        layer.msg(data.message);
    });

    //通用通知接口
    socket.on('commonmessagenotify', function(data) {
        layer.msg(data.message);
    });


    //刷新群通知
    socket.on('refreshgroupchatroomresult', function(data) {
        if (data.state) {
            layer.msg("请求成功");
        } else if (data.state) {
            layer.msg(data.message);
        }
    });

    //删除微信用户绑定
    socket.on('removewxuin', function(data) {
        var wxUin = data.WxUin;
        var removeLi = $(".maintTop>ul[sign=weixin_list_ul]").find("li[WxUin=" + wxUin + "]");
        if (removeLi.length < 1) {
            return;
        }
        if (removeLi.hasClass("select")) {
            if (removeLi.next().length > 0) {
                removeLi.next().click();
            } else if (removeLi.prev().length > 0) {
                removeLi.prev().click();
            }
        }
        removeLi.remove();
        $("#guocontainer").find("div[sign=" + wxUin + "]").remove();
        if ($(".maintTop li").length == 1) {
            $(".maintTop li").eq(0).click();
        }
    });
    //增加微信用户绑定
    socket.on('addwxuin', function(data) {
        var wxUin = data.WxUin;
        if ($(".maintTop>ul[sign=weixin_list_ul]").find("li[WxUin=" + wxUin + "]").length > 0) {
            return;
        }
        var weixnLiHtml = "  <li WxUin=\"" + wxUin + "\">" +
            "    <img src=\"" + data.WxUinHeadImgUrl + "\">" +
            "    <p>" + data.WxUinNickName + "</p>" +
            //"    <p class=\"new\"></p>" +
            "     <i></i>" +
            "            </li>";
        $(".maintTop>ul[sign=weixin_list_ul]").append(weixnLiHtml);
        // 创建每个微信的主界面
        var wxMainContentHtml = createWeixinMainContent(wxUin);
        $("#guocontainer").append(wxMainContentHtml);
        var wxState = data.WXState;
        // if (data.IsOnline) {
        //     wxState = 1;
        // } else {
        //     wxState = -1;
        // }
        ChangeWxOnlineState(wxUin, wxState);
        var data = { wxuin: wxUin };
        socket.emit('contractlist', data);

        //左侧菜单切换
        $("div[stype=wxMain][sign=" + wxUin + "]>.left>.Name").on("click", "li", function() {

            $(this).addClass("selected");
            $(this).siblings().removeClass("selected");

            var currentIndex = $(this).index();
            var wxUin = $(this).attr("WxUin");
            var rightDiv = $("div[sign=right][WxUin=" + wxUin + "]>div:eq(" + currentIndex + ")");
            rightDiv.addClass("One");
            rightDiv.show();
            rightDiv.siblings().removeClass("One");
            rightDiv.siblings().hide();
        });

        //联系人切换
        $("div[stype=wxMain][sign=" + wxUin + "]").find("ul[sign=contactlist]").on("click", "li", function() {
            //  $(this).find(".img>img").attr("src",  $(this).find(".img>img").attr("src"));
            $(this).siblings().removeClass("titsh1");
            $(this).addClass("titsh1");
            var headImgUrl = $(this).attr("HeadImgUrl");
            var nickName = ReplaceAll($(this).attr("NickName"), "\\\\", "");
            var sex = $(this).attr("Sex");
            var remark = ReplaceAll($(this).attr("Remark"), "\\\\", "");
            var userId = $(this).attr("UserId");
            var employeeId = $(this).attr("EmployeeId");
            var resourceId = $(this).attr("ResourceId");
            var wxUin = $(this).attr("WxUin");
            var wxUinNickName = $(this).attr("WxUinNickName");
            var wxUinHeadImgUrl = $(this).attr("WxUinHeadImgUrl");
            var resourceSubTypeId = $(this).attr("ResourceSubTypeId");
            var resourceTypeId = $(this).attr("ResourceTypeId");
            var resourceSubTypeName = $(this).attr("ResourceSubTypeName");
            var resourceTypeName = $(this).attr("ResourceTypeName");
            var isNew = $(this).attr("IsNew");
            var firstLetter = $(this).attr("FirstLetter");
            var quanPin = $(this).attr("QuanPin");
            var userTypeId = $(this).attr("UserTypeId");
            var userTypeName = $(this).attr("UserTypeName");
            var addType = $(this).attr("AddType");
            var contactInfoHtml = CreateUserCardHtml(headImgUrl, nickName, sex, remark, userId, employeeId,
                resourceId, wxUin, wxUinNickName, wxUinHeadImgUrl,
                resourceSubTypeId, resourceTypeId, resourceSubTypeName, resourceTypeName,
                isNew, firstLetter, quanPin, userTypeId, userTypeName, true, addType);

            $("div[sign=contactInfo_div][wxuin=" + wxUin + "]").html(contactInfoHtml);
            $(".beizhu_group").find("select").val(userTypeId);
        });
        //联系人双击切换
        $("div[stype=wxMain][sign=" + wxUin + "]").find("ul[sign=contactlist]").on("dblclick", "li", function() {
            // $(this).click();
            // var wxUin = $(this).attr("WxUin");
            ShowChat($(this), true);
        });


        //聊天页面对象切换
        $("div[stype=wxMain][sign=" + wxUin + "]").find("ul[sign=currentContractList]").on("click", "li", function(argument) {

            // if (isOpen) {
            //     $("#message_record").hide();
            //     $("#guocontainer").css('width', '960px');
            //     isOpen = false;
            // }
            var wxUin = $(this).attr("wxUin");
            $(this).addClass("activeChat");
            $(this).siblings().removeClass("activeChat");
            $(this).addClass("titsh");
            $(this).siblings().removeClass("titsh");


            var sign = $(".rightmenu").find(".li-top[opened=true]").attr("sign");
            if (sign == "message_record") {
                showMessageRecord(); //显示聊天记录
            } else if (sign == "user_remark") //备注
            {
                showUserRemark();
            } else if (sign == "user_figure") //用户画像
            {
                showUserFigure();
            }
            //加载最近聊天的记录
            if ($(this).attr("isLast") == "true") {
                $(this).attr("isLast", "");
                socket.emit('getlastchatmessagelist', {
                    userid: $(this).attr("UserId"),
                    wxuin: wxUin
                });
            }
            if ($(this).find(".content>.tip").length > 0) {
                $(this).find(".content>.addImg").remove();
                $(this).find(".content>.tip").remove();

                //通知服务器消息已读
                socket.emit('setmessageread', {
                    userid: $(this).attr("userid"),
                    wxuin: wxUin
                });

            }
            //重新计算未读信息数量
            var showCount = 0;
            $("#currentContractList" + "_" + wxUin).find("li").each(function() {

                if ($(this).find(".content>.tip").length > 0) {

                    var currentLiCount = parseInt($(this).find(".content>.tip").html());
                    if (currentLiCount > 0) {
                        showCount += currentLiCount;

                    }
                }
            });
            var menuTip = "<p id=\"menuTip_p_" + wxUin + "\" class=\"tip fs12\">" + showCount + "</p>";
            $("#menuTip_p_" + wxUin).remove();
            if (showCount > 0) //数量大于0才展示提示
            {
                $("#CurrentChatMenuLi" + "_" + wxUin).append(menuTip);
            }


            if ($(this).attr("stype") == "group") {
                var chatcontentid = "chatconten_group_" + $(this).attr("groupKey") + "_" + wxUin;
                var chatcontentDiv = $("#" + chatcontentid);
                chatcontentDiv.addClass("consh");
                chatcontentDiv.siblings().removeClass("consh");
            } else {
                //显示聊天窗体
                var chatcontentid = "chatconten_" + $(this).attr("UserId") + "_" + wxUin;
                var chatcontentDiv = $("#" + chatcontentid);
                chatcontentDiv.addClass("consh");
                chatcontentDiv.siblings().removeClass("consh");
                setTimeout(function() {
                    if ($("#" + chatcontentid).length > 0) {
                        $("#" + chatcontentid + ">.middle").scrollTop($("#" + chatcontentid + ">.middle")[0].scrollHeight);
                    }

                }, 200);

            }
        });

        // 群组折叠
        $("div[stype=wxMain][sign=" + wxUin + "]").find("ul[sign=group_contactlist]").on("click", ".lianxi2", function() {
            $(this).next('ol').slideToggle("slow");
        });

        //群组联系人点击切换
        $("div[stype=wxMain][sign=" + wxUin + "]").find("ul[sign=group_contactlist]").on("click", "li", function() {
            $(this).siblings().removeClass("titsh1");
            $(this).addClass("titsh1");
            var headImgUrl = $(this).attr("HeadImgUrl");
            var nickName = ReplaceAll($(this).attr("NickName"), "\\\\", "");
            var sex = $(this).attr("Sex");
            var remark = $(this).attr("Remark");
            var userId = $(this).attr("UserId");
            var employeeId = $(this).attr("EmployeeId");
            var resourceId = $(this).attr("ResourceId");
            var wxUin = $(this).attr("WxUin");
            var wxUinNickName = $(this).attr("WxUinNickName");
            var wxUinHeadImgUrl = $(this).attr("WxUinHeadImgUrl");
            var resourceSubTypeId = $(this).attr("ResourceSubTypeId");
            var resourceTypeId = $(this).attr("ResourceTypeId");
            var resourceSubTypeName = $(this).attr("ResourceSubTypeName");
            var resourceTypeName = $(this).attr("ResourceTypeName");
            var isNew = $(this).attr("IsNew");
            var firstLetter = $(this).attr("FirstLetter");
            var quanPin = $(this).attr("QuanPin");
            var userTypeId = $(this).attr("UserTypeId");
            var userTypeName = $(this).attr("UserTypeName");
            var addType = $(this).attr("AddType");
            var contactInfoHtml = CreateUserCardHtml(headImgUrl, nickName, sex, remark, userId, employeeId,
                resourceId, wxUin, wxUinNickName, wxUinHeadImgUrl,
                resourceSubTypeId, resourceTypeId, resourceSubTypeName, resourceTypeName,
                isNew, firstLetter, quanPin, userTypeId, userTypeName, true, addType);
            $("div[sign=group_contactInfo_div]").html(contactInfoHtml);

        });

        $(".maintTop li[wxuin=" + wxUin + "]").click(function() {
            var wxUin = $(this).attr("WxUin");
            $("div[stype=wxMain]").hide();
            $("div[sign=" + wxUin + "]").show();
            $("div[sign=" + wxUin + "]").find("p[sign=employee_name]").html($(this).find("p").html());
            $("div[sign=" + wxUin + "]").find(".center>.top>img").attr("src", $(this).find("img").attr("src"));
            $(this).addClass("select");
            $(this).siblings().removeClass("select");
            $(this).find(".new").remove();
        });

        $("div[stype=wxMain][sign=" + wxUin + "]").find(".icon-add_friends").parent().click(function() {
            var wxuin = $(this).parent().parent().attr("wxuin");
            var showHtml = "<table class=\"alterPass_two\">" +
                "<tbody>" +
                "    <tr>" +
                "        <td class=\"labeltd_number\">微信号/手机号</td>" +
                "        <td>" +
                "            <input type=\"text\" id=\"txtAddFriendNo\" class=\"inputPass_right\">" +
                "        </td>" +
                "    </tr>" +
                "    <tr>" +
                "        <td class=\"labeltd_number\">打招呼内容</td>" +
                "        <td>" +
                "            <input type=\"text\" id=\"txtAddFriendMessage\"  maxlength=\"40\" class=\"inputPass_right\">" +
                "        </td>" +
                "    </tr>" +
                "    <tr>" +
                "        <td class=\"labeltd_number\">备注</td>" +
                "        <td>" +
                "            <input type=\"text\" id=\"txtFriendRemark\"  maxlength=\"40\" class=\"inputPass_right\">" +
                "        </td>" +
                "    </tr>" +
                "</tbody>" +
                "</table>"
                //页面层
            layer.open({
                type: 1,
                title: "添加好友",
                skin: 'layui-layer-rim', //加上边框
                area: ['420px', '260px'], //宽高
                content: showHtml,
                btn: ["添加"],
                yes: function(index, layero) {
                    var friendNo = $("#txtAddFriendNo").val();
                    var friendMessage = $("#txtAddFriendMessage").val();
                    var friendRemark = $("#txtFriendRemark").val();
                    var sendData = {
                        wxuin: wxuin,
                        friendNo: friendNo,
                        friendMessage: friendMessage,
                        friendRemark: friendRemark
                    };
                    socket.emit('addfriend', sendData);
                    layer.close(index);
                }
            });
        });

        //弹框
        $("div[stype=wxMain][sign=" + wxUin + "]").find(".icon-setting").parent().bind("click", function() {
            $('#settingModal').modal('show');
        });

        //绑定当前聊天对象滚动条时间
        $("div[stype=wxMain][sign=" + wxUin + "]").find("div[stype=currentChatContract]").bind("scroll", function() {

            var viewH = $(this).height(); //可见高度
            var contentH = $(this).get(0).scrollHeight; //内容高度
            var scrollTop = $(this).scrollTop(); //滚动高度
            if (scrollTop / (contentH - viewH) >= 0.95) { //到达底部100px时,加载新内容
                var wxUin = $(this).attr("WxUin");
                var pageSize = $("#charlist_" + wxUin).attr("pageSize");
                var pageIndex = $("#charlist_" + wxUin).attr("pageIndex");
                var totleCount = $("#charlist_" + wxUin).attr("totleCount");
                var totlePageCount = (totleCount % pageSize > 0 ? 1 : 0) + parseInt(parseInt(totleCount) / parseInt(pageSize));
                if (pageIndex < totlePageCount) {
                    var sendData = {
                        wxuin: weixin,
                        pageindex: parseInt(pageIndex) + 1,
                        pagesize: 20
                    };
                    socket.emit('lastcontactslist', sendData);
                }
            }
        });



        //聊天群 对象点击
        $("div[stype=wxMain][sign=" + wxUin + "]").find("ul[sign=GroupContractList]").on("click", "li", function(obj) {
            // if (isOpen) {
            //     $("#message_record").hide();
            //     $("#guocontainer").css('width', '960px');
            //     isOpen = false;
            // }
            $(this).addClass("activeChat");
            $(this).siblings().removeClass("activeChat");
            $(this).addClass("titsh");
            $(this).siblings().removeClass("titsh");
            $(this).find(".img>img").attr("src", $(this).find(".img>img").attr("src")); //防止头像不显示刷新URL
            if ($(this).find(".content>.tip").length > 0) {
                $(this).find(".content>.tip").remove();

            }
            var sign = $(".rightmenu").find(".li-top[opened=true]").attr("sign");
            if (sign == "message_record") {
                showMessageRecord(); //显示聊天记录
            }
            /*else if (sign == "user_remark") //备注
            {
                showUserRemark();
            } else if (sign == "chat_statement") //聊天话术
            {
                showChatStatement();
            } else if (sign == "quick_reply") //快捷回复
            {
                showQuickReply();
            } else if (sign == "my_collect") //我的收藏
            {
                showMyCollect();
            } else if (sign == "chat_task") //微信任务
            {
                showChatTask();
            }
            else if (sign == "user_figure") //用户画像
            {
                showUserFigure();
            }*/
            var wxUin = $(this).attr("WxUin");
            var showCount = 0;
            $("#GroupContractList" + "_" + wxUin).find("li").each(function() {

                if ($(this).find(".content>.tip").length > 0) {

                    var currentLiCount = parseInt($(this).find(".content>.tip").html());
                    if (currentLiCount > 0) {
                        showCount += currentLiCount;

                    }
                }
            });
            var menuTip = "<p  stype=\"menutip\" class=\"tip fs12\">" + showCount + "</p>";
            $("p[stype=menutip]").remove();
            if (showCount > 0) //数量大于0才展示提示
            {
                $("#ChatGroupLi" + "_" + wxUin).append(menuTip);
            }
            //显示聊天窗体
            var chatcontentid = "chatgroupcontent_" + $(this).attr("userid") + "_" + wxUin;
            var chatcontentDiv = $("#" + chatcontentid);
            chatcontentDiv.addClass("consh");
            chatcontentDiv.show();
            chatcontentDiv.siblings().hide();
            chatcontentDiv.siblings().removeClass("consh");
            setTimeout(function() {
                if ($("#" + chatcontentid).length > 0) {
                    $("#" + chatcontentid + ">.middle").scrollTop($("#" + chatcontentid + ">.middle")[0].scrollHeight);
                }

            }, 200);

        });

        if ($(".maintTop li").length == 1) {
            $(".maintTop li").eq(0).click();
        }


    });

    //获取到朋友圈数据
    socket.on('getfriendscircle', function(data) {
        var personCircle = data.personCircle;
        if (personCircle) {
            Getcheckcircle(data);
        } else {
            var wxUin = data.wxUin;
            var isCurrentUser = data.isCurrentUser;
            var friendCircleObj = $("#FriendcircleUl" + "_" + wxUin);
            if (data.result.length == 0 && data.pageIndex <= 1) {
                friendCircleObj.html("");
                friendCircleObj.append("<li>暂无数据</li>");
                return;
            }
            for (var i = 0; i < data.result.length; i++) {
                var friendCircle = data.result[i];
                var weChatFriendsCircleId = friendCircle.WeChatFriendsCircleId;
                var userHeadImgUrl = "";
                var userNickName = "";
                friendCircleObj.attr("isCurrentUser", data.isCurrentUser);
                friendCircleObj.attr("pageIndex", data.pageIndex);
                friendCircleObj.attr("pageSize", data.pageSize);
                friendCircleObj.attr("totleCount", data.count);
                friendCircleObj.attr("userId", data.userId);
                if (data.isCurrentUser) {
                    var userLi = $("ul[sign=weixin_list_ul]").find("li[wxuin=" + wxUin + "]");
                    userHeadImgUrl = userLi.find("img").attr("src");
                    userNickName = userLi.find("p").html();
                } else {
                    if (friendCircle.conRemark == undefined || friendCircle.conRemark == "") {
                        continue; //没有备注的用户认定为无效的数据
                    }
                    var userid = friendCircle.conRemark;
                    var userContactli = $("#contractli" + userid + "_" + wxUin);
                    if (userContactli.length < 1) {
                        continue;
                    }
                    userHeadImgUrl = userContactli.attr("headimgurl");
                    userNickName = userContactli.attr("showname");
                }
                var newDate = new Date();
                newDate.setTime(friendCircle.timestamp * 1000);
                var liId = "fiend_circle_li_" + friendCircle.WeChatFriendsCircleId;
                if (data.personCircle) {
                    liId = "fiend_circle_li_person_" + friendCircle.WeChatFriendsCircleId;
                }
                if ($("#" + liId).length > 0) {
                    continue;
                }
                var appendHtml = "<li id=\"" + liId + "\">" +
                    "          <div class=\"img_send\">" +
                    "              <img src=\"" + userHeadImgUrl + "\">" +
                    "          </div>" +
                    "          <div class=\"friend_wenzi\">" +
                    "              <p >" + userNickName + "(" + userid + ")</p>" +
                    "          </div>" +
                    "          <div class=\"input_kuang\">" +
                    (friendCircle.content == null ? "" : friendCircle.content) +
                    (friendCircle.contentUrl == null ? "" : "<a href='" + friendCircle.contentUrl + "' target=\"_blank\" class=\"friendLink\">" + friendCircle.contentUrl + "</a>") +
                    "          </div>" +
                    "          <div class=\"friend_picture\">" +
                    "          </div>" +
                    "          <div class=\"friend_time\">" +
                    "              <p style=\"width:140px;float:left;margin-bottom: 10px;\">" +
                    getCommonFormatDate(newDate) +
                    "</p>" +
                    "              <div class=\"qwer-right\"></div>" +
                    "          </div>" +
                    "          <div style=\"clear:both;\"></div>" +
                    "          <div class=\"qwer-content\">" +
                    "             <div class=\"qwer-top\">" +
                    "              </div>" +
                    "              <div class=\"qwer-pinglun\">" +
                    "              </div>" +
                    "          </div>" +
                    "      </li>"
                friendCircleObj.append(appendHtml);
                //SJL 2017-3-31修改为后台返回数据
                // setTimeout('GetFriendsCircleMedia("' + weChatFriendsCircleId + '")', i * 1000);

            }
        }

    });


    //获取朋友圈Media数据
    socket.on('getfriendscirclemedia', function(data) {
        if (data.result.length > 0) {
            var weChatFriendsCircleId = data.result[0].WeChatFriendsCircleId;
            for (var i = 0; i < data.result.length; i++) {
                var media = data.result[i];
                var weChatFriendsCircleId = media.WeChatFriendsCircleId;
                var fiend_circle_li = $("#fiend_circle_li_" + weChatFriendsCircleId);
                var mediaId = "fiend_circle_media_" + media.WeChatFriendsCircleMediaId;
                if (data.personCircle) {
                    fiend_circle_li = $("#fiend_circle_li_person_" + weChatFriendsCircleId);
                    mediaId = "fiend_circle_media_person_" + media.WeChatFriendsCircleMediaId;
                }

                if ($("#" + mediaId).length > 0) {
                    continue;
                }
                var mediaUrl = media.localMediaUrl;
                if (mediaUrl == "" || mediaUrl == null || mediaUrl == undefined) {
                    mediaUrl = media.mediaUrl;
                }
                switch (media.mediaType) {
                    case ".jpg":
                    case ".png":
                    case ".gif":
                        fiend_circle_li.find(".friend_picture").append("<img  id=\"" + mediaId + "\" src=\"" + mediaUrl + "\">");
                        break;
                    case ".mp4":
                        fiend_circle_li.find(".friend_picture").append("<video id=\"" + mediaId + "\" style=\"vertical-align:middle;" +
                            " width:500px;margin-bottom:12px;margin-left:46px;\"   controls=\"controls\" " +
                            " src=\"" + mediaUrl + "\"></video>");
                        break;
                    case ".html":
                        fiend_circle_li.find(".friend_picture").append(" <a id=\"" + mediaId + "\"  target=\"_blank\"  style=\"vertical-align:middle;" +
                            " margin-bottom:12px;margin-left:46px;\"   " +
                            " href=\"" + media.mediaUrl + "\">分享链接</a>");
                        break;
                    default:
                        fiend_circle_li.find(".friend_picture").append("<img id=\"" + mediaId + "\"  src=\"" + mediaUrl + "\">");
                        break;
                }

                // fiend_circle_li.find(".friend_picture").append("<iframe " +
                //     "  style=\"  width: 146px;height: 146px; margin-bottom: 12px;margin-left: 46px;\"" +
                //     " src=\"/showpic?url="+encodeURI(media.mediaUrl)+"\" id=\"ifr_" + media.WeChatFriendsCircleMediaId + "\" frameBorder=\"0\" scrolling=\"no\" ></iframe>");
            }
            //SJL 2017-3-31修改为后台返回数据
            //获取朋友圈点赞
            //socket.emit('getfriendscirclelike', { WeChatFriendsCircleId: weChatFriendsCircleId });
        }
    });

    //获取朋友圈点赞数据
    socket.on('getfriendscirclelike', function(data) {
        if (data.result.length > 0) {

            var weChatFriendsCircleId = data.result[0].WeChatFriendsCircleId;
            var fiend_circle_li = $("#fiend_circle_li_" + weChatFriendsCircleId);
            if (data.personCircle) {
                fiend_circle_li = $("#fiend_circle_li_person_" + weChatFriendsCircleId);
            }
            fiend_circle_li.find(".qwer-right").append("<i class=\"icon-like\"></i><span class=\"dianzhanshu\">" + data.result.length + "</span>");
            fiend_circle_li.find(".qwer-top").append("<i class=\"icon-like\"></i>");
            for (var i = 0; i < data.result.length; i++) {
                var like = data.result[i];
                var likeId = "fiend_circle_like_" + like.WeChatFriendsCircleLikesId;
                if (data.personCircle) {
                    likeId = "fiend_circle_like_person_" + like.WeChatFriendsCircleLikesId;
                }
                if ($("#" + likeId).length > 0) {
                    continue;
                }
                fiend_circle_li.find(".qwer-top").append("<p id=\"" + likeId + "\">" + like.userName + "</p>")
            }
            //SJL 2017-3-31修改为后台返回数据
            //获取朋友圈信息评论
            //socket.emit('getfriendscirclecomments', { WeChatFriendsCircleId: weChatFriendsCircleId });
        }

    });

    //获取朋友圈信息评论
    socket.on('getfriendscirclecomments', function(data) {
        for (var i = 0; i < data.result.length; i++) {
            var comment = data.result[i];
            var commentId = "fiend_circle_comment_" + comment.WeChatFriendsCircleCommentsId;
            if (data.personCircle) {
                commentId = "fiend_circle_comment_person_" + comment.WeChatFriendsCircleCommentsId;
            }
            if ($("#" + commentId).length > 0) {
                continue;
            }
            var weChatFriendsCircleId = comment.WeChatFriendsCircleId;
            var fiend_circle_li = $("#fiend_circle_li_" + weChatFriendsCircleId);
            if (data.personCircle) {
                fiend_circle_li = $("#fiend_circle_li_person_" + weChatFriendsCircleId);
            }
            fiend_circle_li.find(".qwer-pinglun").append("<p id=\"" + commentId + "\"><span class=\"qwer-s1\">" +
                comment.authorName + ":</span><span class=\"qwer-s2\">" + comment.content + "</span></p>")
        }
    });

    //更新朋友圈结果通知
    socket.on('updatefriendcircleresult', function(data) {
        var wxUin = data.wxUin;
        var type = data.type;
        if (type == "1" || type == 1) {
            $("#updatemyfriendcircle_btn_" + wxUin).removeAttr("disabled");
        } else {
            $("#updateallfriendcircle_btn_" + wxUin).removeAttr("disabled");
        }


    });

    //获取用户备注
    socket.on('getuserremark', function(data) {
        var userRemark = "点击“编辑”修改用户备注。";
        if (data.result != null && data.result != undefined) {
            userRemark = data.result.RemarkName;
        }
        var remarkDiv = $(".rightmenu").find("div[sign=user_remark]");
        remarkDiv.next().find(".textarea").val(userRemark);

    });

    // 保存用户备注结果
    socket.on('setuserremark', function(data) {
        if (!data.state) {
            layer.msg("保存用户备注失败");
        }

    });

    // 聊天话术分组
    socket.on('getchatstatementgroup', function(msgData) {
        if (!msgData.state) {
            layer.msg("获取聊天话术分组失败");
        }
        for (var i = 0; i < msgData.result.length; i++) {
            var msg = msgData.result[i];
            var divHtml = "<div ChatMessageGroupId=\"" + msg.ChatMessageGroupId + "\" class=\"fenzu shoecang\">" +
                "<div class=\"fenzu-top\"><i class=\"icon-folder\"></i>" +
                "<p ChatMessageGroupId=\"" + msg.ChatMessageGroupId + "\">" + msg.ChatMessageGroupName + "<i ChatMessageGroupId=\"" + msg.ChatMessageGroupId + "\" class=\"icon-under2\"></i></p>" +
                "</div>" +
                "<div class=\"huashu-content\">" +
                "<div class=\"huashu-li\">" +
                "</div>" +
                "<a href=\"javascript:void(0)\" onclick=\"showMorechatstatement(this)\" style=\"margin-left: 118px;\">加载更多</a>" +
                "</div>" +
                "</div>";
            $("#chat_huashu").append(divHtml);

            setTimeout('GetChatstatement("' + msg.ChatMessageGroupId + '",1,10)', i * 1000);

        }
        //聊天话术
        $(".icon-under2").click(function() {
            var chatMessageGroupId = $(this).attr("ChatMessageGroupId");
            $("div.fenzu[ChatMessageGroupId=" + chatMessageGroupId + "]").find(".huashu-content").slideToggle("slow");
        });

    });

    // 获取聊天话术
    socket.on('getchatstatement', function(msgData) {
        if (!msgData.state) {
            layer.msg("获取聊天话术分组失败");
        }
        $("div[sign=chat_statement].li-top").attr("isload", true);
        for (var i = 0; i < msgData.result.length; i++) {
            var msg = msgData.result[i];
            var chatMessageGroupId = msg.ChatMessageGroupId;
            var chatMessageType = msg.ChatMessageType;
            var appendHtml = "";
            if (chatMessageType == 1) //图片
            {
                appendHtml = "<p><img onclick=\"showchathanshuImg(this)\" class=\"huashu_img\" src=\"" + msg.ChatMessageContent + "\"/></p>"
            } else if (chatMessageType == 2) //文本
            {

                appendHtml = "<p onclick=\"showchathuashuText(this)\">" + disposQQFace(msg.ChatMessageContent) + "</p>";
            }
            $("div.fenzu[ChatMessageGroupId=" + chatMessageGroupId + "]").attr("count", msgData.count);
            $("div.fenzu[ChatMessageGroupId=" + chatMessageGroupId + "]").attr("pageSize", msgData.pageSize);
            $("div.fenzu[ChatMessageGroupId=" + chatMessageGroupId + "]").attr("pageIndex", msgData.pageIndex);
            $("div.fenzu[ChatMessageGroupId=" + chatMessageGroupId + "]").find(".huashu-li").append(appendHtml);
        }
    });

    // 快捷回复分组
    socket.on('getquickreplygroup', function(msgData) {
        if (!msgData.state) {
            layer.msg("获取快捷回复分组失败");
        }
        $("#chatquick_reply").find(".fenzu").remove();
        for (var i = 0; i < msgData.result.length; i++) {
            var msg = msgData.result[i];
            var divHtml =
                "<div class=\"fenzu\" ReplyGroupId=\"" + msg.ReplyGroupId + "\" sign=\"Fastquick_fenzu\">" +
                "       <div class=\"fenzu-top\"><i class=\"icon-folder\"></i>" +
                "           <p ReplyGroupId=\"" + msg.ReplyGroupId + "\">" + msg.ReplyGroupName + "</p><i ReplyGroupId=\"" + msg.ReplyGroupId + "\" class=\"icon-under2\"></i><i class=\"icaozuo icon-add\" onclick=\"Addfastgroupcontent(this)\"></i><i class=\"icaozuo icon-delete\" onclick=\"Deletecurrentfenzu(this)\"></i><i class=\"icaozuo icon-revise2\" onclick=\"Updatefastgroupname(this)\"></i></div>" +
                "           <div class=\"quick-content\">" +
                "               <div class=\"fenzu-li\">" +
                "                   <ul sign=\"Fastreply_ul\">" +
                "                   </ul>" +
                "               </div>" +
                "                   <a href=\"javascript:void(0)\" onclick=\"showMorequickreply(this)\" style=\"margin-left: 118px;\">加载更多</a>" +
                "           </div>" +
                "       </div>" +
                "</div>";
            $("#chatquick_reply").append(divHtml);

            setTimeout('GetRuickreply("' + msg.ReplyGroupId + '",1,10)', i * 1000);

        }
        //快捷回复
        $(".icon-under2").click(function() {
            var ReplyGroupId = $(this).attr("ReplyGroupId");
            $("div.fenzu[ReplyGroupId=" + ReplyGroupId + "]").find(".quick-content").slideToggle("slow");
        });

    });

    // 获取快捷回复
    socket.on('getquickreply', function(msgData) {
        if (!msgData.state) {
            layer.msg("获取快捷回复分组失败");
        }
        $("div.fenzu[ReplyGroupId=" + msgData.replyGroupId + "]").find(".huifu-li").remove();
        for (var i = 0; i < msgData.result.length; i++) {
            var msg = msgData.result[i];
            var replyGroupId = msg.ReplyGroupId;
            var replyType = msg.ReplyType;
            var appendHtml = '<li onmouseover=\"showtextOver()\" onmouseout=\"showtextOut()\" class="huifu-li" fastReplyId=" ' + msg.FastReplyId + ' "  >' +
                '<i class="icaozuo icon-delete" style="display: none;" onclick="deletequickreply(this)"></i>' +
                '<i class="icaozuo icon-revise2" style="display: none; left: 16px;" onclick="Updatequickreply(this)"></i>';

            if (replyType == 1) //图片
            {
                appendHtml += "<p><img class=\"quick_img\" src=\"" + msg.FastReplyContent + "\"/></p>"
            } else if (replyType == 2) //文本
            {

                appendHtml += "<p onclick=\"showQuickreplyText(this)\">" + disposQQFace(msg.FastReplyContent) + "</p>";
            }
            appendHtml += '</li>';


            $("div.fenzu[ReplyGroupId=" + replyGroupId + "]").find("ul[sign=Fastreply_ul]").append(appendHtml);
        }

        $("div.fenzu[ReplyGroupId=" + replyGroupId + "]").attr("count", msgData.count);
        $("div.fenzu[ReplyGroupId=" + replyGroupId + "]").attr("pageCount", msgData.pageCount);
        $("div.fenzu[ReplyGroupId=" + replyGroupId + "]").attr("pageIndex", msgData.pageIndex);
    });

    // 获取我的收藏
    socket.on('getmyfavorite', function(msgData) {
        if (!msgData.state) {
            layer.msg("获取我的收藏失败");
        }
        var count = msgData.count;
        var pageIndex = msgData.pageIndex;
        var pageSize = msgData.pageCount;
        var pageCount = 0;
        if (count % pageSize > 0) {
            pageCount = (count - (count % pageSize)) / pageSize + 1;
        } else {
            pageCount = (count) / pageSize;
        }
        var qianyiye = pageIndex - 1;
        var houyiye = pageIndex + 1;
        if (houyiye > pageCount) {
            houyiye = pageCount;
        }
        if (qianyiye < 1) {
            qianyiye = 1;
        }
        var Ihtml = "<i class=\"icon-icon-diyiye\" onclick=\"ShowPageMyCollect(this, 1, " + pageSize + ")\"></i>" +
            "<i class=\"icon-icon-qianyiye\" onclick=\"ShowPageMyCollect(this, " + qianyiye + ", " + pageSize + ")\"></i>" +
            "<i class=\"icon-icon-houyiye\" onclick=\"ShowPageMyCollect(this, " + houyiye + ", " + pageSize + ")\"></i>" +
            "<i class=\"icon-icon-zuihouyiye\" onclick=\"ShowPageMyCollect(this, " + pageCount + ", " + pageSize + ")\"></i>";
        if (msgData.type == 1) {
            $(".images-img").empty();
            $(".images-img").next(".footer").find(".right_p").html(Ihtml);
        } else if (msgData.type == 2) {
            $(".images-video").empty();
            $(".images-video").next(".footer").find(".right_p").html(Ihtml);
        }
        for (var i = 0; i < msgData.result.length; i++) {
            var msg = msgData.result[i];
            var Type = msg.Type;
            if (Type == 1) //图片
            {
                $(".images-img").append("<img onclick=\"showmycollectImg(this)\" ChatRoomFavoriteId=\"" + msg.ChatRoomFavoriteId + "\" class=\"shoucang-img\" src=\"" + msg.FavoriteMiniImagePath + "\"/><i onclick=\"Deletecurrentcollect(this)\" class=\"icaozuo icon-delete1\"></i>");
            } else if (Type == 2) //视频
            {

                $(".images-video").append("<img ChatRoomFavoriteId=\"" + msg.ChatRoomFavoriteId + "\" class=\"shoucang-video\" src=\"" + msg.FavoriteMiniImagePath + "\"/></video><i onclick=\"Deletecurrentcollect(this)\" class=\"icaozuo icon-delete1\"></i>");
            }

        }

    });

    //我的收藏
    $(".icon-under2").click(function() {
        $(this).parents(".fenzu").find(".collect-content").slideToggle("slow");
    });

    //获取微信任务列表
    socket.on('gettasklist', function(msgData) {
        if (!msgData.state) {
            layer.msg("获取微信任务列表失败");
        }
        var liHtml = "";
        for (var i = 0; i < msgData.result.length; i++) {
            var msg = msgData.result[i];
            var statue = "";
            var style = "width:20%;";
            switch (msg.Statue) {
                case 0:
                    statue = "等待";
                    break;
                case 1:
                    statue = "进行中";
                    break;
                case 2:
                    if (msg.Result == '1') {
                        statue = "成功";
                    } else {
                        statue = "失败";
                    }
                    break;
                default:
                    statue = "失败";
                    break;
            }
            if (msg.TaskCreator.indexOf('-') > -1) {
                msg.TaskCreator = msg.TaskCreator.split("-")[1];
            }
            liHtml += "<li class=\"chattask-li\">" +
                "<p>" + moment(msg.StartTime).add('hours', -8).format('MM-DD HH:mm') + "</p>" +
                "<p title=\"" + msg.TaskCreator + "\">" + msg.TaskCreator + "</p>" +
                "<p style=\"" + style + "\">" + statue + "</p>" +

                "</li>";
            var count = msgData.count;
            var pageIndex = msgData.pageIndex;
            var pageSize = msgData.pageCount;
            var pageCount = 0;
            if (count % pageSize > 0) {
                pageCount = (count - (count % pageSize)) / pageSize + 1;
            } else {
                pageCount = (count) / pageSize;
            }
            var qianyiye = pageIndex - 1;
            var houyiye = pageIndex + 1;
            if (houyiye > pageCount) {
                houyiye = pageCount;
            }
            if (qianyiye < 1) {
                qianyiye = 1;
            }
            var Ihtml = "<i class=\"icon-icon-diyiye\" onclick=\"ShowPageChatTask(this, 1, " + pageSize + ")\"></i>" +
                "<i class=\"icon-icon-qianyiye\" onclick=\"ShowPageChatTask(this, " + qianyiye + ", " + pageSize + ")\"></i>" +
                "<i class=\"icon-icon-houyiye\" onclick=\"ShowPageChatTask(this, " + houyiye + ", " + pageSize + ")\"></i>" +
                "<i class=\"icon-icon-zuihouyiye\" onclick=\"ShowPageChatTask(this, " + pageCount + ", " + pageSize + ")\"></i>";

        }
        $("#chat_taskUl").next(".footer").find(".right_p").html(Ihtml);
        $("#chat_taskUl").html(liHtml);

    });

    //获取搜索添加队列
    socket.on('getsearchatasklist', function(msgData) {
        if (!msgData.state) {
            layer.msg("获取搜索任务列表失败");
        } else {
            var liHtml = "";
            for (var i = 0; i < msgData.result.length; i++) {
                var msg = msgData.result[i];
                liHtml += "<li class=\"searchtask-li\">" +
                    "<p title=\"" + msg.WechatContactInfo + "\">" + msg.WechatContactInfo + "</p>" +
                    "<p title=\"" + msg.GreetContent + "\">" + msg.GreetContent + "</p>" +
                    "<p title=\"" + msg.UserTrueName + "\">" + msg.UserTrueName + "</p>" +
                    "</li>";
                var count = msgData.count;
                var pageIndex = msgData.pageIndex;
                var pageSize = msgData.pageCount;
                var pageCount = 0;
                if (count % pageSize > 0) {
                    pageCount = (count - (count % pageSize)) / pageSize + 1;
                } else {
                    pageCount = (count) / pageSize;
                }
                var qianyiye = pageIndex - 1;
                var houyiye = pageIndex + 1;
                if (houyiye > pageCount) {
                    houyiye = pageCount;
                }
                if (qianyiye < 1) {
                    qianyiye = 1;
                }
                var Ihtml = "<i class=\"icon-icon-diyiye\" onclick=\"ShowPageSearchTask(this, 1, " + pageSize + ")\"></i>" +
                    "<i class=\"icon-icon-qianyiye\" onclick=\"ShowPageSearchTask(this, " + qianyiye + ", " + pageSize + ")\"></i>" +
                    "<i class=\"icon-icon-houyiye\" onclick=\"ShowPageSearchTask(this, " + houyiye + ", " + pageSize + ")\"></i>" +
                    "<i class=\"icon-icon-zuihouyiye\" onclick=\"ShowPageSearchTask(this, " + pageCount + ", " + pageSize + ")\"></i>";

            }
            $("#search_taskUl").next(".footer").find(".right_p").html(Ihtml);
            $("#search_taskUl").html(liHtml);
        }

    });

    //获取用户画像配置
    socket.on('getuserportraitconfig', function(msgData) {
        if (!msgData.state) {
            layer.msg("获取用户画像配置失败");
        }
        var liHtml = "";
        for (var i = 0; i < msgData.result.length; i++) {
            var msg = msgData.result[i];
            liHtml += "<li class=\"huaxiang-li\">" +
                "<p class=\"huaxiang-p\">" + msg.PortraitName + "</p>" +
                "<input UserPortraitConfigId=\"" + msg.UserPortraitConfigId + "\" type=\"text\" class=\"huaxiang-txt\" readonly=\"\"><i class=\"icon-revise3\"></i><i class=\"icon-complete\" style=\"display:none;\"></i>" +
                "</li>";
        }
        $("#user_figureUl").html(liHtml);
        GetuserFigure();

    });

    //获取用户画像
    socket.on('getuserportraitinfo', function(msgData) {
        if (!msgData.state) {
            layer.msg("获取用户画像失败");
        }
        var liHtml = "";
        for (var i = 0; i < msgData.result.length; i++) {
            var msg = msgData.result[i];
            $("input[UserPortraitConfigId=" + msg.UserPortraitConfigId + "]").val(msg.PortraitInfo);
        }

    });

    //保存用户画像结果
    socket.on('saveuserportraitinfo', function(data) {
        if (!data.state) {
            layer.msg("保存用户画像失败");
            return;
        }
        $(".huaxiang-txt").removeClass("huaxiang-bianji");
        $(".huaxiang-txt").attr("readonly", true);
        $(".icon-revise3").show();
        $(".icon-complete").hide();

    });

    // 发送群公告通知
    socket.on('sendgroupnotifymessagenotify', function(msgData) {
        if (!msgData.state) {
            layer.msg("@所有人失败");
        } else {
            layer.msg("@所有人已经提交");
        }
    });
    //新建快捷回复分组
    socket.on('createquickreplygroup', function(data) {
        if (!data.state) {
            layer.msg("新建快捷回复分组失败");
            return;
        }
        socket.emit('getquickreplygroup', null);
    });


    // 发送群公告结果
    socket.on('sendgroupnotifymessageresult', function(msgData) {
        if (!msgData.state) {
            layer.msg("@所有人失败");
        } else {
            var groupId = msgData.groupId;
            $("#chatgroupcontent_" + groupId).find("[stype=group_notify]").each(function() {
                $(this).attr("isrun", "");
            });

        }
    });
    //修改快捷回复分组
    socket.on('updatequickreplygroup', function(data) {
        if (!data.state) {
            layer.msg("修改快捷回复分组失败");
            return;
        }
        socket.emit('getquickreplygroup', null);
    });

    //修改快捷回复
    socket.on('updatequickreply', function(data) {
        if (!data.state) {
            layer.msg("修改快捷回复失败");
            return;
        }
        GetRuickreply(data.replyGroupId, 1, 10);
    });

    //创建快捷回复
    socket.on('createquickreply', function(data) {
        if (!data.state) {
            //layer.msg("创建快捷回复失败");
            layer.msg(data.message);
            return;
        }
        GetRuickreply(data.replyGroupId, 1, 10);
    });
    //快捷回复分组删除
    socket.on('deletequickreplygroup', function(data) {
        if (!data.state) {
            layer.msg("删除快捷回复分组失败");
            return;
        }
        $(".fenzu[replygroupid=" + data.replyGroupId + "]").remove();
    })

    //删除快捷回复
    socket.on('deletequickreply', function(data) {
        if (!data.state) {
            layer.msg("删除快捷回复失败");
            return;
        }
        GetRuickreply(data.replyGroupId, 1, 10);
    });

    //快捷回复分组修改
    socket.on('updatequickreplygroup', function(data) {
        if (!data.state) {
            layer.msg("修改快捷回复分组失败");
            return;
        }
    });

    //新建我的收藏
    socket.on('createmyfavorite', function(data) {
        if (!data.state) {
            layer.msg("收藏失败");
            return;
        }
        Getmyfavorite(1, 10, data.type);
    });


    //删除我的收藏
    socket.on('deletemyfavorite', function(data) {
        if (!data.state) {
            layer.msg("删除我的收藏失败");
            return;
        }
        Getmyfavorite(1, 10, data.type);
    });

    //微信状态
    socket.on('notifywxstate', function(data) {
        var wxUin = data.WxUin;
        var state = data.State;
        //微信状态 -1 离线，0 正在登陆 1 在线
        //登录时要清空聊天群
        if (state == 0) {

        }
        //在线以后再重新加载
        ChangeWxOnlineState(wxUin, state);

    });


    //转发消息到朋友圈通知
    socket.on('transmitmsaagetofriendcycle', function(data) {
        if (data.state) {
            layer.msg("开始转发朋友圈");
        } else {
            layer.msg(data.message.Messge);
        }
        // setTimeout(function() {
        //     isRunTransmitmsaagetofriendcycle = false;
        // }, 1000);

    });


    //添加分享名片好友结果
    socket.on('addusercallingfriend', function(data) {
        if (data.state) {
            layer.msg("添加好友申请提交成功");
        } else {
            layer.msg(data.message.Messge);
        }

    });

    //手机状态通知
    socket.on('mobilestatenotify', function(data) {
        var wxUin = data.wxUin;
        var taskId = data.taskId;
        var taskName = data.taskName; //任务名称
        var taskType = data.taskType; //任务类型
        $("div[stype=wxMain][sign=" + wxUin + "]").attr("mobilestate", data.state);
        if (data.state == 1) { //忙碌
            $("div[sign=right][WxUin=" + wxUin + "]").find(".phone-state>img[sign=statebusy]").each(function() {
                $(this).show();
                $(this).siblings().hide();
            });


        } else if (data.state == 2) { //空闲
            $("div[sign=right][WxUin=" + wxUin + "]").find(".phone-state>img[sign=statefree]").each(function() {
                $(this).show();
                $(this).siblings().hide();
            });
        }
        if (data.execResult == 0 && (taskType == 3 || taskType == 8 || taskType == 9)) {
            layer.open({
                type: 1,
                title: 'error',
                offset: 'rb',
                content: '<div style="padding: 20px 100px;">' + taskName + '失败</div>',
                btn: '重启此任务',
                btnAlign: 'c',
                shade: 0,
                yes: function(index, layero) {
                    $.ajax({
                        type: 'POST',
                        url: '/restarttask',
                        data: {
                            wxUin: wxUin,
                            WechatTaskId: taskId
                        },
                        success: function(result) {
                            if (result.state) {
                                layer.close(index);
                            } else {
                                layer.msg('重启此任务失败');
                            }
                        },
                        dataType: 'json'
                    });
                }
            });
        }
    });
    //更新指定好友朋友圈任务
    socket.on('updateUserfriendcircle', function(data) {
        if (data.state) {
            layer.msg("任务提交成功");
        } else {
            layer.msg(data.message.Messge);
        }
    });

});

//创建联系人HTml
function  CreateContract(contract, liPrefix) {
    var contractHtml = "";
    var encodeNickName = contract.NickName;
    encodeNickName = ReplaceAll(encodeNickName, "'", "\\'");
    encodeNickName = ReplaceAll(encodeNickName, "\"", "\\'");
    var showName = (contract.RemarkName == null ? "" : contract.RemarkName);
    var currentShowName = showName;
    if (showName == "") {
        currentShowName = contract.NickName;
        showName = contract.NickName;
    }
    currentShowName = ReplaceAll(currentShowName, "spanclass", "span class");
    currentShowName = ReplaceAll(currentShowName, "emojiemoji", "emoji emoji");
    showName = ReplaceAll(showName, "spanclass", "span class");
    showName = ReplaceAll(showName, "emojiemoji", "emoji emoji");
    showName = ReplaceAll(showName, "'", "\\'");
    showName = ReplaceAll(showName, "\"", "\\'");
    contract.RemarkPYQuanPin = ReplaceAll(contract.RemarkPYInitial, "'", "\\'");
    contract.RemarkPYInitial = ReplaceAll(contract.RemarkPYInitial, "\"", "\\'");
    contract.RemarkPYInitial = ReplaceAll(contract.RemarkPYInitial, "'", "\\'");
    contract.RemarkPYInitial = ReplaceAll(contract.RemarkPYInitial, "\"", "\\'");
    contract.RemarkName = ReplaceAll(contract.RemarkName, "'", "\\'");
    contract.RemarkName = ReplaceAll(contract.RemarkName, "\"", "\\'");
    var liId = liPrefix + contract.UserId + "_" + contract.WxUin;
    $("#" + liId).remove(); //删除原来的
    contractHtml += "<li sid=\"" + liPrefix + contract.UserId + "\" " +
        " stype=\"contract_li\" id=\"" + liId + "\" " +
        " EmployeeId=\"" + contract.EmployeeId + "\"" +
        " WxUin=\"" + contract.WxUin + "\"" +
        " UserId=\"" + contract.UserId + "\"" +
        " ResourceId=\"" + contract.ResourceId + "\"" +
        " NickName=\"" + htmlEncode(encodeNickName) + "\"" +
        " ShowName=\"" + htmlEncode(showName) + "\"" +
        " HeadImgUrl=\"" + htmlEncode(contract.HeadImgUrl) + "\"" +
        " WxUinNickName=\"" + htmlEncode(contract.WxUinNickName) + "\"" +
        " WxUinHeadImgUrl=\"" + htmlEncode(contract.WxUinHeadImgUrl) + "\"" +
        " ResourceSubTypeId=\"" + contract.ResourceSubTypeId + "\"" +
        " ResourceTypeId=\"" + contract.ResourceTypeId + "\"" +
        " ResourceSubTypeName=\"" + contract.ResourceSubTypeName + "\"" +
        " ResourceTypeName=\"" + contract.ResourceTypeName + "\"" +
        " UserTypeId=\"" + contract.UserTypeId + "\"" +
        " UserTypeName=\"" + contract.UserTypeName + "\"" +
        " IsNew=\"" + contract.IsNew + "\"" +
        " Sex=\"" + contract.Sex + "\"" +
        " Remark=\"" + htmlEncode((contract.RemarkName == null ? "" : contract.RemarkName)) + "\"" +
        " QuanPin=\"" + htmlEncode(contract.PYQuanPin) + "\"" +
        " FirstLetter=\"" + contract.FirstLetter + "\"" +
        " Initial=\"" + htmlEncode(contract.PYInitial) + "\"" +
        " Owner=\"" + contract.Owner + "\"" +
        " OwnerEmployeeId=\"" + contract.OwnerEmployeeId + "\"" +
        " OwnerEmployeeStaffId=\"" + contract.OwnerEmployeeStaffId + "\"" +
        " OwnerEmployeeTrueName=\"" + contract.OwnerEmployeeTrueName + "\"" +
        " AddType=\"" + contract.AddType + "\"" +
        "  class=\"titsh1\" style=\"height:57px;\">" +
        "<div class=\"img f1\" style=\"margin-top:-4px;\">" +
        "<img src=\"" + contract.HeadImgUrl + "\">" +
        "</div>" +
        "<div class=\"content f1\">" +
        "<p class=\"name1 fs14\">" + currentShowName + "</p>" +
        "</div>" +
        "</li>";
    return contractHtml;
}


//获取格式化时间
function getYYYMMDDFormatDate(date) {
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate;
    return currentdate;
}

//获取格式化时间
function getHHmmFormatDate(date) {
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var minutesStr = date.getMinutes();
    var minutes = date.getMinutes();
    if (minutes < 10) {
        minutesStr = "0" + minutes;
    }
    var currentdate = date.getHours() + seperator2 + minutesStr;
    return currentdate;
}

//创建群聊页面HTML
function CreateChatGroupHtml(chatGroup) {
    chatGroup.NickName = ReplaceAll(chatGroup.NickName, "<spanclass=\"emoji[\\s\\S]*?/span>", ""); //替换不能识别的特殊字符
    chatGroup.NickName = ReplaceAll(chatGroup.NickName, "'", "\\'");
    chatGroup.NickName = ReplaceAll(chatGroup.NickName, "\"", "\\'");

    chatGroup.WxUinNickName = ReplaceAll(chatGroup.NickName, "'", "\\'");
    chatGroup.WxUinNickName = ReplaceAll(chatGroup.NickName, "\"", "\\'");
    chatGroup.ContactId = chatGroup.ContactId.replace("@@", "");
    var isDeleteChatRoom = chatGroup.IsDeleteChatRoom ? "true" : "false";
    var wxUin = chatGroup.WxUin;
    // 当前联系人前置
    var contractliId = "chatgroup_" + chatGroup.ContactId + "_" + wxUin;
    if ($("#" + contractliId).length < 1) {
        var liHtml = "  <li " +
            " Remark=\"" + htmlEncode(chatGroup.NickName) + "\"" +
            " NickName=\"" + htmlEncode(chatGroup.NickName) + "\"" +
            " ShowName=\"" + htmlEncode(chatGroup.NickName) + "\"" +
            " HeadImgUrl=\"" + htmlEncode(chatGroup.HeadImgUrl) + "\"" +
            " wxuinheadimgurl=\"" + chatGroup.WxUinHeadImgUrl + "\"" +
            " IsDeleteChatRoom=\"" + isDeleteChatRoom + "\"" +
            " wxuin=\"" + chatGroup.WxUin + "\"" +
            " userid=\"" + chatGroup.UserId +
            "\" id=\"" + contractliId + "\" class=\"titsh\">" +
            " <div class=\"img f1\">" +
            "   <img src=\"" + chatGroup.HeadImgUrl + "\">" +
            "  </div>" +
            " <div class=\"content f1\">" +
            "     <p class=\"name fs14\"><span>" + chatGroup.NickName + "</span><span stype=\"groupcount\"></span></p>" +
            "       <p class=\"news fs12\"></p>" +
            "       <p class=\"time fs12\"></p>";
        liHtml += "       " +
            "  </div>" +
            " </li>";
        $("#GroupContractList" + "_" + wxUin).append(liHtml);
        setTimeout(function() { //图片重新设置防止头衔不正常显示
            $("#" + contractliId).find(".img>img").attr("src", $("#" + contractliId).find(".img>img").attr("src"));
        }, 1000);

    } else {
        var nickName = htmlEncode(chatGroup.NickName);
        var headImgUrl = htmlEncode(chatGroup.HeadImgUrl);
        var wxuinheadimgurl = chatGroup.WxUinHeadImgUrl;
        $("#" + contractliId).attr("Remark", nickName);
        $("#" + contractliId).attr("NickName", nickName);
        $("#" + contractliId).attr("ShowName", nickName);
        $("#" + contractliId).attr("HeadImgUrl", headImgUrl);
        $("#" + contractliId).attr("wxuinheadimgurl", wxuinheadimgurl);
        $("#" + contractliId).attr("IsDeleteChatRoom", isDeleteChatRoom);

        $("#" + contractliId).find(".img>img").attr("src", chatGroup.HeadImgUrl);
        $("#" + contractliId).find(".content>.name>span").eq(0).html(chatGroup.NickName);

        $("#" + contractliId)
        setTimeout(function() { //图片重新设置防止头衔不正常显示
            $("#" + contractliId).find(".img>img").attr("src", $("#" + contractliId).find(".img>img").attr("src"));
        }, 1000);
    }

    //当前聊天记录窗口
    var chatcontentid = "chatgroupcontent_" + chatGroup.UserId + "_" + wxUin;
    if ($("#" + chatcontentid).length < 1) {
        var chatcontentHtml = " <div stype=\"chatgroupcontent_" + chatGroup.UserId + "\" WxUin=\"" + chatGroup.WxUin + "\" wxuin=\"" + chatGroup.WxUin + "\" id=\"" + chatcontentid + "\"  >" +
            "  <div class=\"top\">" +
            "     <p class=\"fs14 name\">" +
            "      <span>" + chatGroup.NickName + " </span>" +
            "      <span stype=\"groupcount\"></span>" +
            "      <i onclick=\"showCurrentChatObj(this)\" class=\"icon-down down\"></i>" +
            "      <i class=\"icon-up up\" onclick=\"hideCurrentChatObj(this)\" style=\"display:none;\"></i></p>" +
            "      <div class=\"xiala\">" +
            "                    <ul id=\"chat_group_content_ul_" + chatGroup.UserId + "_" + wxUin + "\">" +
            "                        <li style=\"position:relative;\">" +
            "                            <img src=\"images/add.png\" userid=\"" + chatGroup.UserId + "\" wxuin=\"" + chatGroup.WxUin + "\" isgroup=\"true\" onclick=\"showAddChatObj(this)\">" +
            "                        </li>";
        if (chatGroup.Owner == true) { //删人

            chatcontentHtml += "          <li style=\"position:relative;\">" +
                "                            <img src=\"images/delete.png\" userid=\"" + chatGroup.UserId + "\" wxuin=\"" + chatGroup.WxUin + "\" isgroup=\"true\" onclick=\"showRemoveChatObj(this)\">" +
                "                        </li>";
        }
        if (chatGroup.Owner == true) { //公告

            chatcontentHtml += "          <li style=\"position:relative;\">" +
                "                            <img stype=\"group_notify\" src=\"images/gonggao.png\" groupname=\"" + htmlEncode(chatGroup.NickName) + "\" userid=\"" + chatGroup.UserId + "\" wxuin=\"" + chatGroup.WxUin + "\" isgroup=\"true\" onclick=\"showSendGroupNotifyMessage(this)\">" +
                "                        </li>";
        }
        chatcontentHtml += "   <li style=\"position:relative;\">" +
            "        <img src=\"images/refresh.png\" onclick=\"refreshCurrentContractObj(this)\" userid=\"" + chatGroup.UserId + "\" wxuin=\"" + chatGroup.WxUin + "\" isgroup=\"true\">" +
            "              </li>";
        chatcontentHtml += " </ul>" +
            "         </div>" +
            "     </div>" +
            "  <div  class=\"middle\">" +
            "   <ul>" +
            "  </ul>" +
            "  </div>" +
            "<div class=\"bottom\">" +
            "  <div class=\"top\">" +
            "   <ul class=\"tubb\" >" +
            "    <li  userid=\"" + chatGroup.UserId + "\" WxUin=\"" + wxUin + "\" onclick=\"showemoji(this,'isgroup');\" ><i class=\"icon-emoji\"></i></li>" +
            "    <li onclick=\"showsendgrouppic(this);\"  WxUin=\"" + wxUin + "\"   userid=\"" + chatGroup.UserId + "\"><i class=\"icon-wenjianjia\"></i></li>";
        if (chatGroup.Owner == true) { //公告
            chatcontentHtml += "    <li  WxUin=\"" + wxUin + "\"  groupname=\"" + htmlEncode(chatGroup.NickName) + "\"   userid=\"" + chatGroup.UserId + "\" onclick=\"showSendGroupNotifyMessage(this)\"><i class=\"icon-xiaoxitongzhi\"></i></li>";
        }
        chatcontentHtml += " <li onclick=\"showmostcontent(this);\"  WxUin=\"" + wxUin + "\"   userid=\"" + chatGroup.UserId + "\"><img src=\"./images/jiehe.png\" class=\"mostsendgrouppic\"></li>";
        chatcontentHtml += "    <li isgroup=\"true\" userid=\"" + chatGroup.UserId + "\" onclick=\"toggleMessageRecord(this)\">" +
            // "    <i class=\"icon-message_logg message_record\"></i>" +
            // "    <p class=\"message_record\" style=\"width:60px; position:absolute; left:87%; top:0px;\">消息记录</p>" +
            "    </li>" +
            "  </ul>" +
            "  </div>" +
            "  <div class=\"bottom\">" +
            "   <div class=\"edit\" onblur=\"editBlur(this)\" onkeydown=\"keySend(event,this,true);\"  cname=\"txtSendContent\" contenteditable=\"true\">" +
            "</div>" +
            "   <div>" +
            "     <input isgroup=\"true\" " +
            " WxUin=\"" + chatGroup.WxUin + "\"" +
            " EmployeeId=\"" + chatGroup.EmployeeId + "\"" +
            " UserId=\"" + chatGroup.UserId + "\"" +
            " ResourceId=\"" + chatGroup.ResourceId + "\"" +
            " WxUinNickName=\"" + htmlEncode(chatGroup.WxUinNickName) + "\"" +
            " WxUinHeadImgUrl=\"" + chatGroup.WxUinHeadImgUrl + "\"" +
            " type=\"button\" onclick=\"SendMessage(this,true)\" value=\"发送\" class=\"fr\" />" +
            // "     <p class=\"fr fs12\">按下Ctrl+Enter换行</p>" +
            "   </div>" +
            "</div>" +
            "</div>" +
            " </div>";
        $("#GroupContractContent" + "_" + wxUin).append(chatcontentHtml);
    }
}
//显示群聊删除人员页面
function showRemoveChatObj(obj) {
    var userid = $(obj).attr("userid");
    var wxuin = $(obj).attr("wxuin");
    var contractUl = $("#chat_group_content_ul_" + userid + "_" + wxuin).find("li[stype=group_chat_user_li]");


    var showHtml = "      <div class=\"search_bar\" style=\"position:relative;height:50px;padding-top:11px;\">" +
        "          <i class=\"icon-search\" style=\"position:relative; top:0px; left:353px;\"></i>" +
        "          <input type=\"text\" onkeyup=\"searchGroupContract(this);\"  class=\"fs14\" placeholder=\"搜索\" style=\"width:90%; height:30px; text-indent:10px; border:1px solid #d1d6e4;\">" +
        "      </div>" +
        "      <div class=\"addmain\">";
    var firstLetterArry = {};
    for (var i = 0; i < $("#chat_group_content_ul_" + userid + "_" + wxuin).find("li[stype=group_chat_user_li]").length; i++) {
        var contract = $("#chat_group_content_ul_" + userid + "_" + wxuin).find("li[stype=group_chat_user_li]").eq(i);
        var firstLetter = contract.attr("FirstLetter");
        if (contract.attr("IsSelf") == "true") {
            continue;
        }
        if (firstLetterArry[firstLetter] == undefined || firstLetterArry[firstLetter] == null) {
            firstLetterArry[firstLetter] = [];
        }
        var strCheck = "";
        var showName = contract.attr("Remark");
        if (showName == null || showName == "") {
            showName = contract.attr("NickName");
        }
        var contractObj = $("#contractli" + userid + "_" + wxuin);
        var quanPin = "";
        if (contractObj.length > 0) {
            quanPin = contractObj.attr("QuanPin");
        }
        var contractsli = "<li " +
            " NickName=\"" + contract.attr("NickName") + "\" " +
            " Remark=\"" + contract.attr("Remark") + "\"" +
            " FirstLetter=\"" + contract.attr("FirstLetter") + "\"" +
            " Initial=\"" + contract.attr("Initial") + "\"" +
            " QuanPin=\"" + quanPin + "\">" +
            "<input username=\"" + contract.attr("UserName") + "\" userid=\"" +
            contract.attr("UserId") + "\" type=\"checkbox\">" +
            "<img src=\"" + contract.attr("HeadImgUrl") + "\">" +
            "<p class=\"add_ulP\">" + showName + "</p>" +
            "</li>";
        firstLetterArry[firstLetter].push(contractsli);
    };
    for (var firstLetter in firstLetterArry) {
        showHtml += "<div firstLetter=\"" + firstLetter + "\"  class=\"addtitle\">" + firstLetter + "</div>";
        showHtml += "<ul class=\"add_ul\" firstLetter=\"" + firstLetter + "\">";
        for (var i = 0; i < firstLetterArry[firstLetter].length; i++) {
            showHtml += firstLetterArry[firstLetter][i];
        }
        showHtml += "</ul>";
        showHtml += "<div style=\"clear:both\"></div>";
    }
    showHtml += "      </div>";

    //页面层
    layer.open({
        type: 1,
        title: "删除群成员",
        skin: 'layui-layer-rim', //加上边框
        area: ['420px', '600px'], //宽高
        content: showHtml,
        btn: ["确定", "取消"],
        yes: function(index, layero) {
            var chooseUser = [];
            $(".addmain").find("input[type=checkbox]").each(function() {
                if ($(this)[0].checked) {
                    chooseUser.push($(this).attr("username"));
                }

            });
            //群聊天加人
            var sendDate = {
                wxuin: wxuin,
                userid: userid,
                usernamelist: chooseUser

            };
            socket.emit('chatgroupdelcontract', sendDate);
            setTimeout(function() {
                var getDetailSendData = { userid: userid };
                socket.emit("groupcontractdetail", getDetailSendData);
            }, 3000);

            layer.close(index);

        },
        btn2: function(index, layero) {
            layer.close(index);
        }
    });

}
//获取朋友圈图片
function GetFriendsCircleMedia(weChatFriendsCircleId) {
    socket.emit('getfriendscirclemedia', { WeChatFriendsCircleId: weChatFriendsCircleId });
}

//获取聊天话术
function GetChatstatement(chatMessageGroupId, pageIndex, pageSize) {

    socket.emit("getchatstatement", {
        ChatMessageGroupId: chatMessageGroupId,
        pageIndex: pageIndex,
        pageSize: pageSize
    });
}

//聊天话术加载更多
function showMorechatstatement(obj) {
    var chatMessageGroupId = $(obj).parent().parent().attr("chatmessagegroupid");
    var count = parseInt($("div.fenzu[ChatMessageGroupId=" + chatMessageGroupId + "]").attr("count"));
    var pageSize = parseInt($("div.fenzu[ChatMessageGroupId=" + chatMessageGroupId + "]").attr("pageSize"));
    var pageIndex = parseInt($("div.fenzu[ChatMessageGroupId=" + chatMessageGroupId + "]").attr("pageIndex"));
    var pageCount = 0;
    if (count % pageSize > 0) {
        pageCount = (count - (count % pageSize)) / pageSize + 1;
    } else {
        pageCount = (count) / pageSize;
    }
    if (pageIndex + 1 > pageCount) {
        return;
    }
    GetChatstatement(chatMessageGroupId, pageIndex + 1, pageSize);
}

//聊天话术刷新
function showchatRefresh(obj) {
    $(".fenzu").remove();
    socket.emit("getchatstatementgroup");
    event.stopPropagation(); //  阻止事件冒泡
}

//聊天话术点击文本跳转至聊天窗口并显示
function showchathuashuText(obj) {
    var ehtml = $(obj).html();
    $('.One:visible div.consh').find(".bottom .edit").append(ehtml);
}

//聊天话术点击图片跳转至聊天窗口并显示
function showchathanshuImg(obj) {
    layer.open({
        type: 1,
        title: "发送图片",
        skin: 'layui-layer-rim', //加上边框
        area: ['500px', '460px'], //宽高
        btn: ["取消", "发送"],
        content: '<img src="' + $(obj).attr("src") + '" style="max-width:100%; max-height:100%; display:block; margin:auto; padding:20px;" >',
        yes: function(index, layero) {
            layer.close(index);
        },
        btn2: function(index, layero) {
            // layer.msg('发送图片成功显示');
            // var data = response;
            var imgurl = $(obj).attr("src");
            var input = $('.One:visible div.consh').find(".bottom input[wxUin]");
            var wxUin = input.attr("WxUin");
            if (input.attr("isgroup") == "true") {
                var userid = input.attr("userid");
                var messageId = wxUin + "_" + userid + "_" + CreateUUid();
                EmitSendMessage("@@" + userid, messageId, imgurl, 3, wxUin);
                var messageContent = imgurl;
                var chatcontentid = "chatgroupcontent_" + userid;
                var addTimeSpan = GetIsAddTimeSpan(chatcontentid);
                AddGroupMessage(userid, messageId, messageContent, 3, addTimeSpan, new Date(), wxUin);
            } else if (input.attr("multysend") == "true") {
                var groupKey = input.attr("groupKey");
                var contractsol = $("#group_contactlist" + "_" + wxUin).find("ol[groupkey=" + groupKey + "]");
                if (contractsol.length > 0) {

                    var chatcontentid = "chatconten_group_" + groupKey + "_" + wxUin;
                    var messageHtml = " <li class=\"rightli\"> " +
                        "      <div class=\"img fr\"> " +
                        "     <img src=\"images/header.png\"/>" +
                        "    </div>" +
                        "     <div class=\"content fr\">";
                    messageHtml += "        <p class=\"jiao\"></p>" +
                        "     <div class=\"fs12\">" +
                        " <img style=\"max-width: 200px;cursor: pointer;\" onclick=\"pic_click(this,true)\" big-src=\"" + data.displayUrl + "\" src=\"" + data.displayUrl + "\"> " +
                        "</div>";

                    messageHtml += "   </div>" +
                        "  </li>";
                    $("#" + chatcontentid + ">.middle>ul").append(messageHtml);

                    var sindex = 0;
                    contractsol.find("li").each(function() {
                        var userid = $(this).attr("userid");
                        var chatcontentid = "chatconten_" + userid + "_" + wxUin;
                        var WxUin = $("#" + chatcontentid + ">.bottom>.bottom").find("input").attr("WxUin");
                        var messageId = WxUin + "_" + userid + "_" + CreateUUid();
                        sindex++;
                        setTimeout(function() {
                            EmitSendMessage(userid, messageId, imgurl, 3, WxUin);
                        }, 1000 * sindex);
                        var messageContent = imgurl;
                        var addTimeSpan = GetIsAddTimeSpan(chatcontentid);
                        AddMyMessage(userid, messageId, messageContent, 3, addTimeSpan, new Date(), false, true, wxUin);
                    });
                }
            } else {
                var userid = input.attr("userid");
                var chatcontentid = "chatconten_" + userid + "_" + wxUin;
                var messageId = wxUin + "_" + userid + "_" + CreateUUid();
                EmitSendMessage(userid, messageId, imgurl, 3, wxUin);
                var messageContent = imgurl;
                var addTimeSpan = GetIsAddTimeSpan(chatcontentid);
                AddMyMessage(userid, messageId, messageContent, 3, addTimeSpan, new Date(), false, true, wxUin);
            }
            layer.close(index);
        }
    });
}

//获取快捷回复
function GetRuickreply(replyGroupId, pageIndex, pageCount) {
    socket.emit("getquickreply", {
        ReplyGroupId: replyGroupId,
        pageIndex: pageIndex,
        pageCount: pageCount
    });
}

//快捷回复加载更多
function showMorequickreply(obj) {
    var replyGroupId = $(obj).parent().parent().attr("replyGroupId");
    var count = parseInt($("div.fenzu[ReplyGroupId=" + replyGroupId + "]").attr("count"));
    var pageSize = parseInt($("div.fenzu[ReplyGroupId=" + replyGroupId + "]").attr("pageCount"));
    var pageIndex = parseInt($("div.fenzu[ReplyGroupId=" + replyGroupId + "]").attr("pageIndex"));
    var pageCount = 0;
    if (count % pageSize > 0) {
        pageCount = (count - (count % pageSize)) / pageSize + 1;
    } else {
        pageCount = (count) / pageSize;
    }
    if (pageIndex + 1 > pageCount) {
        return;
    }
    GetRuickreply(replyGroupId, pageIndex + 1, pageCount);
}

//快捷回复刷新

function shuaxin(obj) {
    socket.emit("getquickreplygroup");
    event.stopPropagation(); //  阻止事件冒泡
}

//快捷回复点击文本跳转至聊天窗口并显示
function showQuickreplyText(obj) {
    var shtml = $(obj).html();
    $('.One:visible div.consh').find(".bottom .edit").append(shtml);
}

//快捷回复保存
function showCreatequickreply(obj) {
    var ReplyGroupId = $(obj).parents('li:first').attr("ReplyGroupId");
    var ReplyGroupName = $(obj).parents('li:first').find('.fenzu-top .p-bianji').text();
    var sendData = {
        ReplyGroupName: ReplyGroupName,
        ReplyGroupId: ReplyGroupId
    };
    if (sendData.ReplyGroupId) {
        socket.emit('updatequickreplygroup', sendData);
    } else {
        socket.emit('createquickreplygroup', sendData);
    }

}


//快捷回复添加
function Addfastgroupcontent(obj) {
    var ReplyGroupId = $(obj).parents(".fenzu:first").attr("replygroupid");
    var divHtml =
        "<div class=\"Fastquick_content\" ReplyGroupId=\"" + ReplyGroupId + "\" contenteditable=\"true\"></div>"
    layer.open({
        type: 1,

        title: "添加内容",
        skin: 'layui-layer-rim', //加上边框
        area: ['350px', '220px'], //宽高
        btn: ["保存"],
        content: divHtml,
        yes: function(index, layero) {
            var FastReplyContent = $(layero).find(".Fastquick_content").text();
            console.info(FastReplyContent);
            var sendData = {
                ReplyGroupId: ReplyGroupId,
                FastReplyContent: FastReplyContent

            };
            socket.emit('createquickreply', sendData);
            layer.close(index);
            GetRuickreply(ReplyGroupId, 1, 10);
        },
    })



}

//快捷回复分组修改
function Updatefastgroupname(obj) {
    var ReplyGroupId = $(obj).parents(".fenzu:first").attr("replygroupid");
    var ReplyGroupName = $(obj).prevAll("p:first").text();
    var divHtml =
        "<div class=\"Fastupdate_content\" ReplyGroupId=\"" + ReplyGroupId + "\" contenteditable=\"true\">" + ReplyGroupName + "</div>"
    layer.open({
        type: 1,
        title: "修改内容",
        skin: 'layui-layer-rim', //加上边框
        area: ['350px', '220px'], //宽高
        btn: ["保存"],
        content: divHtml,
        yes: function(index, layero) {
            var replyGroupName = $(layero).find(".Fastupdate_content").text();
            var sendData = {
                ReplyGroupId: ReplyGroupId,
                ReplyGroupName: replyGroupName

            };
            socket.emit('updatequickreplygroup', sendData);
            layer.close(index);
        },
    })

}

//快捷回复修改
function Updatequickreply(obj) {
    var ReplyGroupId = $(obj).parents(".fenzu:first").attr("replygroupid");
    var FastReplyContent = $(obj).next("p:first").text();
    var FastReplyId = $(obj).parents(".huifu-li").attr("fastReplyId");
    var divHtml =
        "<div class=\"Fastupdate_content\" ReplyGroupId=\"" + ReplyGroupId + "\" contenteditable=\"true\">" + FastReplyContent + "</div>"
    layer.open({
        type: 1,
        title: "修改内容",
        skin: 'layui-layer-rim', //加上边框
        area: ['350px', '220px'], //宽高
        btn: ["保存"],
        content: divHtml,
        yes: function(index, layero) {
            var fastReplyContent = $(layero).find(".Fastupdate_content").text();
            var sendData = {
                FastReplyId: FastReplyId,
                FastReplyContent: fastReplyContent,
                ReplyGroupId: ReplyGroupId

            };
            socket.emit('updatequickreply', sendData);
            layer.close(index);
        },
    })

}

//鼠标移上去显示图标
function showtextOver() {
    $(".huifu-li").children('i').css({ "display": "block" })
}

//鼠标移上去图标消失
function showtextOut() {
    $(".huifu-li").children('i').css({ "display": "none" })
}

//获取我的收藏
function Getmyfavorite(pageIndex, pageCount, type) {

    socket.emit("getmyfavorite", {
        pageIndex: pageIndex,
        pageCount: pageCount,
        Type: type
    });

}

//我的收藏分页
function ShowPageMyCollect(obj, pageIndex, pageSize) {
    var $fenzu = $(obj).parents('.fenzu');
    var type = $fenzu.attr("type");
    Getmyfavorite(pageIndex, pageSize, type);
}

//我的收藏点击图片跳转至聊天窗口并显示
function showmycollectImg(obj) {
    layer.open({
        type: 1,
        title: "发送图片",
        skin: 'layui-layer-rim', //加上边框
        area: ['500px', '460px'], //宽高
        btn: ["取消", "发送"],
        content: '<img src="' + $(obj).attr("src") + '" style="max-width:100%; max-height:100%; display:block; margin:auto; padding:20px;" >',
        yes: function(index, layero) {
            layer.close(index);
        },
        btn2: function(index, layero) {
            // layer.msg('发送图片成功显示');
            // var data = response;
            var imgurl = $(obj).attr("src");
            var input = $('.One:visible div.consh').find(".bottom input[wxUin]");
            var wxUin = input.attr("WxUin");
            if (input.attr("isgroup") == "true") {
                var userid = input.attr("userid");
                var messageId = wxUin + "_" + userid + "_" + CreateUUid();
                EmitSendMessage("@@" + userid, messageId, imgurl, 3, wxUin);
                var messageContent = imgurl;
                var chatcontentid = "chatgroupcontent_" + userid;
                var addTimeSpan = GetIsAddTimeSpan(chatcontentid);
                AddGroupMessage(userid, messageId, messageContent, 3, addTimeSpan, new Date(), wxUin);
            } else if (input.attr("multysend") == "true") {
                var groupKey = input.attr("groupKey");
                var contractsol = $("#group_contactlist" + "_" + wxUin).find("ol[groupkey=" + groupKey + "]");
                if (contractsol.length > 0) {

                    var chatcontentid = "chatconten_group_" + groupKey + "_" + wxUin;
                    var messageHtml = " <li class=\"rightli\"> " +
                        "      <div class=\"img fr\"> " +
                        "     <img src=\"images/header.png\"/>" +
                        "    </div>" +
                        "     <div class=\"content fr\">";
                    messageHtml += "        <p class=\"jiao\"></p>" +
                        "     <div class=\"fs12\">" +
                        " <img style=\"max-width: 200px;cursor: pointer;\" onclick=\"pic_click(this,true)\" src=\"" + data.displayUrl + "\"> " +
                        "</div>";

                    messageHtml += "   </div>" +
                        "  </li>";
                    $("#" + chatcontentid + ">.middle>ul").append(messageHtml);

                    var sindex = 0;
                    contractsol.find("li").each(function() {
                        var userid = $(this).attr("userid");
                        var chatcontentid = "chatconten_" + userid + "_" + wxUin;
                        var WxUin = $("#" + chatcontentid + ">.bottom>.bottom").find("input").attr("WxUin");
                        var messageId = WxUin + "_" + userid + "_" + CreateUUid();
                        sindex++;
                        setTimeout(function() {
                            EmitSendMessage(userid, messageId, imgurl, 3, WxUin);
                        }, 1000 * sindex);
                        var messageContent = imgurl;
                        var addTimeSpan = GetIsAddTimeSpan(chatcontentid);
                        AddMyMessage(userid, messageId, messageContent, 3, addTimeSpan, new Date(), false, true, wxUin);
                    });
                }
            } else {
                var userid = input.attr("userid");
                var chatcontentid = "chatconten_" + userid + "_" + wxUin;
                var messageId = wxUin + "_" + userid + "_" + CreateUUid();
                EmitSendMessage(userid, messageId, imgurl, 3, wxUin);
                var messageContent = imgurl;
                var addTimeSpan = GetIsAddTimeSpan(chatcontentid);
                AddMyMessage(userid, messageId, messageContent, 3, addTimeSpan, new Date(), false, true, wxUin);
            }
            layer.close(index);
        }
    });
}

//获取微信任务
function GetChatTask(pageIndex, pageCount) {
    var WechatUin = $(".maintTop").find(".select").attr("wxuin");
    socket.emit("gettasklist", {
        pageIndex: pageIndex,
        pageCount: pageCount,
        WechatUin: WechatUin
    });
}

//微信任务刷新
function showcollectRefresh(obj) {
    $(".chattask-li").remove();
    GetChatTask(1, 10);
    event.stopPropagation(); //  阻止事件冒泡
}

//微信任务分页
function ShowPageChatTask(obj, pageIndex, pageSize) {
    GetChatTask(pageIndex, pageSize);
}

//获取用户画像配置
function GetuserFigureconfig() {
    socket.emit("getuserportraitconfig", {});
}

//获取用户画像
function GetuserFigure() {
    var WechatUin = $(".maintTop").find(".select").attr("wxuin");
    var UserId = $(".One").find(".center").find(".bottom").find("li.titsh").attr("userid");
    if (UserId.length > 50) {
        return;
    }
    socket.emit("getuserportraitinfo", {
        WxUin: WechatUin,
        UserId: UserId
    });
}


//获取搜索添加队列
function GetSearchTask(pageIndex, pageCount) {
    var WechatUin = $(".maintTop").find(".select").attr("wxuin");

    socket.emit("getsearchatasklist", {
        pageIndex: pageIndex,
        pageSize: pageCount,
        addStatus: '0,1',
        wxUin: WechatUin
    });
}

//搜索添加队列刷新
function showsearchRefresh(obj) {
    $(".searchtask-li").remove();
    GetSearchTask(1, 10);
    event.stopPropagation(); //  阻止事件冒泡
}

//搜索添加队列分页
function ShowPageSearchTask(obj, pageIndex, pageSize) {
    GetSearchTask(pageIndex, pageSize);
}
