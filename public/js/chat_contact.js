//联系人切换

function contactsTab() {
    //联系人切换
    $("ul[sign=contactlist]").on("click", "li", function() {
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
    $("ul[sign=contactlist]").on("dblclick", "li", function() {
        // $(this).click();
        // var wxUin = $(this).attr("WxUin");
        ShowChat($(this), true);
    })
}


//聊天页面对象切换

function chatpageTab() {

    //聊天页面对象切换
    $("ul[sign=currentContractList]").on("click", "li", function(argument) {

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
    })
}


//群发里面联系人点击切换

function groupcontactsTab() {
    //群组联系人点击切换
    $("ul[sign=group_contactlist]").on("click", "li", function() {
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

    })
}

//左侧菜单切换
function leftMenuTab() {

    $(".left>.Name").on("click", "li", function() {

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

}



// $(".icon-like").on("click", function() {
//     $(this).parent().find(".dianzhanshu").html(parseInt($(this).parent().find(".dianzhanshu").html()) + 1);
//     var str = '<p>AH</p>';
//     $(this).parent().parent().parent().find(".qwer-top").append(str);
// })

//微信tab切换

function chatTab() {
    //微信tab切换
    $(".maintTop li").each(function(index) {
        $(this).click(function() {
            var wxUin = $(this).attr("WxUin");
            $("div[stype=wxMain]").hide();
            $("div[sign=" + wxUin + "]").show();
            $("div[sign=" + wxUin + "]").find("p[sign=employee_name]").html($(this).find("p").html());
            $("div[sign=" + wxUin + "]").find(".center>.top>img").attr("src", $(this).find("img").attr("src"));
            $(this).addClass("select");
            $(this).siblings().removeClass("select");
            $(this).find(".new").remove();
            //showChatTask();
            var sign = $(".rightmenu").find(".li-top[opened=true]").attr("sign");
            if (sign == "chat_task") {
                showChatTask(); //显示任务列表
            }
        })
    })
    $(".maintTop li").eq(0).click();

}
//添加好友
function addFriend() {

    $(".icon-add_friends").parent().click(function() {
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
}


function settingMessage() {
    //弹框
    $(".icon-setting").parent().bind("click", function() {
        $('#settingModal').modal('show');
    });
}


//修改昵称
function modifyNickname() {

    $(".modifynickname").click(function() {
        var wxuin = $(this).parent().parent().attr("wxuin");
        var showHtml = "<table class=\"alterPass_two\">" +
            "<tbody>" +
            "    <tr>" +
            "        <td class=\"labeltd_number\">昵称</td>" +
            "        <td>" +
            "            <input type=\"text\" id=\"txtnickname\" class=\"inputPass_right\">" +
            "        </td>" +
            "    </tr>" +

            "</tbody>" +
            "</table>"
            //页面层
        layer.open({
            type: 1,
            title: "修改昵称",
            skin: 'layui-layer-rim', //加上边框
            area: ['420px', '160px'], //宽高
            content: showHtml,
            btn: ["确定"],
            yes: function(index, layero) {
                var nickname = $("#txtnickname").val().tirm();
                var sendData = {
                    wxuin: wxuin,
                    nickname: nickname,
                };
                if (nickname=="") {
                  alert("昵称不能为空");
                  return false;
                }
                socket.emit('modifynickname', sendData);
                console.log(sendData);
                layer.close(index);

            }
        });
    });
}

//修改头像
function modifyheadimg() {

    $(".modifyheadimage").click(function() {
        var wxuin = $(this).parent().parent().attr("wxuin");
        var showHtml = "<table class=\"alterPass_two\">" +
            "<tbody>" +
            "    <tr>" +
            "        <td>" +
            "            <input type=\"file\" id=\"headImage\" class=\"labeltd_select\" >" +
            "        </td>" +
            "    </tr>" +
            "</tbody>" +
            "</table>"
            //页面层
        layer.open({
            type: 1,
            title: "修改头像",
            skin: 'layui-layer-rim', //加上边框
            area: ['420px', '200px'], //宽高
            content: showHtml,
            btn: ["上传"],
            yes: function(index, layero) {
              var data = new FormData();
              data.append('upload', $('#headImage')[0].files[0]);
              var defaultLi = showSendPic($('.labeltd_select'));
              $.ajax({
                  url: 'apply/upload',
                  type: 'POST',
                  data: data,
                  cache: false,
                  contentType: false, //不可缺参数
                  processData: false, //不可缺参数
                  success: function(data) {
                      $('.labeltd_select').val("");
                      SendPicAfterUpload($('.labeltd_select'), data, defaultLi);
                      var httpurl = data.httpurl;
                      var displayUrl = data.displayUrl;
                      var sendData ={
                        wxuin: wxuin,
                        httpurl: httpurl,
                        displayUrl: displayUrl
                      }
                      socket.emit('modifyheadimage', sendData);
                      console.log(sendData)
                      layer.close(index);
                  },
                  error: function() {
                      console.log('error');
                  },
                  complete: function() {
                      $("#copycontentmiddle .loading").hide();
                  }

              });


            }
        });
    });
}
//聊天群切换事件
function ChatGrouptractClick() {
    $("ul[sign=GroupContractList]").on("click", "li", function(obj) {
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
}
