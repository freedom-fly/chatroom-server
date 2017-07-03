$(function() {
    var guocontainer = document.getElementById("guocontainer");
    var login = document.getElementById("login");
    var height = window.screen.availHeight;
    login.style.marginTop = (height - 425) / 2 + "px";
    if (height > 730) {
        guocontainer.style.marginTop = (height - 722) / 2 + "px";
    }


    $("li", ".right .bottom .top").on("click", function() {
        $("#tub").toggle();
    });
    $("#sub").on("click", function() {
        $(this).addClass("send");
    });

    // //弹框
    // $(".icon-exit").parent().bind("click", function() {
    //     $('#logoutModal').modal('show');
    // })
    //左边栏点击切换
    $("li", ".left").on("click", function() {
        $(this).parent().parent().find("li").removeClass("selected");
        $(this).addClass("selected");
    });

    $(".ulnav").on("click", "li", function() {
        $(this).addClass("active").siblings().removeClass("active");
        $(this).siblings().find("em").removeClass("ciclepoint");
        $(this).find("em").addClass("ciclepoint");

        var index = $(this).index();
        $("#tab" + index).addClass("visible").removeClass("invisible").siblings().removeClass("visible").addClass("invisible");
    })

    $("#message_record").hide();
    //关闭消息记录
    $(".icon-icon-guanbi").click(function() {
        $("#message_record").hide();
        $("#guocontainer").css('width', '960px');
        $(".weixin").css('width', '910px');
    });

    //显示联系人列表
    $("#ContactsMenuLi").click();
    $.get('emoji', function(data) {
        $('body').append(data);
    });
})

//显示当前聊天对象
function showCurrentChatObj(obj) {
    $(obj).hide();
    $(obj).next().show();
    $(obj).parent().parent().find(".xiala").show();
}
//隐藏当前聊天对象
function hideCurrentChatObj(obj) {
    $(obj).hide();
    $(obj).parent().parent().find(".xiala").hide();
    $(obj).prev().show();
}

//创建群组页面
function showCreateChatGroup(obj) {
    var wxUin = $(obj).attr("WxUin");
    var showHtml = "      <div class=\"search_bar\" style=\"position:relative;height:50px;padding-top:11px;\">" +
        "          <i class=\"icon-search\" style=\"position:relative; top:0px; left:353px;\"></i>" +
        "          <input type=\"text\"  onkeyup=\"searchPersonContract(this);\"  class=\"fs14\" placeholder=\"搜索\" style=\"width:90%; height:30px; text-indent:10px; border:1px solid #d1d6e4;\">" +
        "      </div>" +
        "      <div class=\"addmain\">";
    var allContract = $("#contactlist" + "_" + wxUin).find("li");
    var firstLetterArry = {};
    allContract.each(function() {
        var firstLetter = $(this).attr("firstletter");
        if (firstLetterArry[firstLetter] == undefined || firstLetterArry[firstLetter] == null) {
            firstLetterArry[firstLetter] = [];
        }
        // if ($(showHtml).find("div[firstLetter=" + firstLetter + "]").length < 1) {
        //     showHtml += "<div firstLetter=\"" + firstLetter + "\"  class=\"addtitle\">" + firstLetter + "</div>";
        //     showHtml += "<ul  firstLetter=\"" + firstLetter + "\"></ul>";
        // }
        var strCheck = "";
        if ($(obj).attr("userid") == $(this).attr("userid")) {
            strCheck = " checked=\"checked\" ";
        }
        var contractsli = "<li" +
            " NickName=\"" + $(this).attr("nickname") + "\" " +
            " Remark=\"" + $(this).attr("remark") + "\"  " +
            " FirstLetter=\"" + $(this).attr("firstletter") + "\"  " +
            " Initial=\"" + $(this).attr("initial") + "\"" +
            " UserId=\"" + $(this).attr("userid") + "\"" +
            " QuanPin=\"" + $(this).attr("QuanPin") + "\" >" +

            "<input userid=\"" +
            $(this).attr("userid") + "\" " + strCheck + " type=\"checkbox\">" +
            "<img src=\"" + $(this).attr("headimgurl") + "\">" +
            "<p class=\"add_ulP\">" + $(this).attr("showname") + "</p>" +
            "</li>";
        firstLetterArry[firstLetter].push(contractsli);
    });
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
        title: "发起群聊",
        skin: 'layui-layer-rim', //加上边框
        area: ['420px', '600px'], //宽高
        content: showHtml,
        btn: ["确定", "取消"],
        yes: function(index, layero) {

            var showHtml = "<table class=\"alterPass_two\">" +
                "<tbody>" +
                "    <tr>" +
                "        <td class=\"labeltd_number\">群名称</td>" +
                "        <td>" +
                "            <input type=\"text\" id=\"txtNewGroupName\" class=\"inputPass_right\">" +
                "        </td>" +
                "    </tr>" +
                "</tbody>" +
                "</table>"
            layer.open({
                type: 1,
                title: "输入群名",
                skin: 'layui-layer-rim', //加上边框
                area: ['420px', '200px'], //宽高
                content: showHtml,
                btn: ["确定"],
                yes: function(newGroupIndex, layero) {
                    var chooseUser = [];
                    $(".addmain").find("input[type=checkbox]").each(function() {
                        if ($(this)[0].checked) {
                            chooseUser.push($(this).attr("userid"));
                        }
                    });
                    var sendDate = {
                        wxuin: $(obj).attr("wxuin"),
                        nickname: $("#txtNewGroupName").val(),
                        useridlist: chooseUser

                    };
                    socket.emit('createchatgroup', sendDate);

                    layer.close(newGroupIndex);
                    layer.close(index);
                }
            });
        },
        btn2: function(index, layero) {
            layer.close(index);
        }
    });
}
//显示增加聊天人窗口
function showAddChatObj(obj) {
    //获取当前微信群组可以添加的好友列表
    var userId = $(obj).attr("userid");
    var wxuin = $(obj).attr("wxuin");

    socket.emit('groupcanaddcontractlist', { userid: userId, wxuin: wxuin });
}

//显示刷新聊天人
function refreshCurrentContractObj(obj) {
    //获取当前微信群组可以添加的好友列表
    var userId = '@@' + $(obj).attr("userid");
    var wxuin = $(obj).attr("wxuin");

    socket.emit('refreshgroupchatroom', { groupUserName: userId, wxuin: wxuin });
}

//群聊时搜索联系人
function searchGroupContract(obj) {
    var index = $(obj).parent().prev().find("li.select").index();
    var keyVal = $(obj).val();
    $(obj).parent().nextAll("[sindex = " + index + "]").find(".add_ul>li").each(function() {
        var isShow = false;
        if ($(this).attr("NickName") != undefined && $(this).attr("NickName").indexOf(keyVal) != -1) {
            isShow = true;
        }
        if ($(this).attr("Remark") != undefined && $(this).attr("Remark").indexOf(keyVal) != -1) {
            isShow = true;
        }
        if ($(this).attr("QuanPin") != undefined && $(this).attr("QuanPin").indexOf(keyVal) != -1) {
            isShow = true;
        }
        if ($(this).attr("FirstLetter") != undefined && $(this).attr("FirstLetter").indexOf(keyVal) != -1) {
            isShow = true;
        }
        if ($(this).attr("Initial") != undefined && $(this).attr("Initial").indexOf(keyVal) != -1) {
            isShow = true;
        }
          if ($(this).attr("UserId") != undefined && $(this).attr("UserId").indexOf(keyVal) != -1) {
            isShow = true;
        }
        if (isShow) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
    $(obj).parent().nextAll("[sindex = " + index + "]").find(".addtitle").each(function() {
        if ($(this).next().find("li:visible").length > 0) {
            $(this).show();
        } else {
            $(this).hide()
        }
    });

}

//建群时搜索联系人
function searchPersonContract(obj) {
    var keyVal = $(obj).val();
    $(obj).parent().next().find(".add_ul>li").each(function() {
        var isShow = false;
        if ($(this).attr("NickName")!= undefined && $(this).attr("NickName").indexOf(keyVal) != -1) {
            isShow = true;
        }
        if ($(this).attr("Remark")!= undefined && $(this).attr("Remark").indexOf(keyVal) != -1) {
            isShow = true;
        }
        if ($(this).attr("QuanPin")!= undefined && $(this).attr("QuanPin").indexOf(keyVal) != -1) {
            isShow = true;
        }
        if ($(this).attr("FirstLetter")!= undefined && $(this).attr("FirstLetter").indexOf(keyVal) != -1) {
            isShow = true;
        }
        if ($(this).attr("Initial")!= undefined && $(this).attr("Initial").indexOf(keyVal) != -1) {
            isShow = true;
        }
           if ($(this).attr("UserId")!= undefined && $(this).attr("UserId").indexOf(keyVal) != -1) {
            isShow = true;
        }
        if (isShow) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
    $(obj).parent().next().find(".addtitle").each(function() {
        if ($(this).next().find("li:visible").length > 0) {
            $(this).show();
        } else {
            $(this).hide()
        }
    });

}




function checkselect(la) {
    if ($(la).children("input")[0].checked == false) {
        $(la).children("i").css("display", "block");
        $(la).children("input")[0].checked = true;
    } else {
        $(la).children("i").css("display", "none");
        $(la).children("input")[0].checked = true;
        $(la).children("input")[0].checked = false;
    }
}

function del_ff(elem) {
    var elem_child = elem.childNodes;
    for (var i = 0; i < elem_child.length; i++) {
        if (/\s/.test(elem_child[i].nodeValue)) {
            elem.removeChild(elem_child[i]);
        }
    }
}

function getIndex(obj) {
    // 根据参数id取得该节点
    // 获取该节点的父节点
    var p = obj.parentNode;
    // 取得父节点下的所有节点
    del_ff(p);
    var tags = p.childNodes;

    // 在父节点的所有子节点中查找自己所在的位置
    for (var i = 0, len = tags.length; i < len; i++) {
        // 找到节点，返回下标
        if (tags[i] == obj) {
            return i;
        }
    }
    // 不在父节点中，返回-1
    return -1;
}
//检查图片是否存在
function CheckImgExists(imgurl) {
    var ImgObj = new Image(); //判断图片是否存在
    ImgObj.src = imgurl;
    //没有图片，则返回-1
    if (ImgObj.fileSize > 0 || (ImgObj.width > 0 && ImgObj.height > 0)) {
        return true;
    } else {
        return false;
    }
}

//获取我的朋友圈
function GetMyFriendCircle(obj) {

    var wxUin = $(obj).attr("wxUin");
    $("#FriendcircleUl" + "_" + wxUin).html("");
    GetFriendCircle(wxUin, 1, 10, true, null);
}
//获取所有朋友圈
function GetAllFriendCircle(obj) {

    var wxUin = $(obj).attr("wxUin");
    $("#FriendcircleUl" + "_" + wxUin).html("");
    GetFriendCircle(wxUin, 1, 10, null, null);
}

function GetFriendCircle(wxUin, pageIndex, pageSize, isMy, userId) {
    var sendData = {
        wxUin: wxUin,
        pageIndex: pageIndex,
        pageSize: pageSize,
        isMy: isMy,
        userId: userId

    };
    socket.emit("getfriendscircle", sendData);
}

var waitSendCount = 0;
var waitSendInterval = 0;

//重新发送消息
function ReSendMessage(obj) {
    var messageId = $(obj).parent().attr("newmessageid");
    var wxUin = $(obj).parent().attr("wxuin");
    $(obj).remove();
    $(obj).parent().parent().find(".ng-scope").remove();
    var sendData = { "messageId": messageId, "wxUin": wxUin };
    socket.emit("resendmessage", sendData);
}
//显示发送群公告页面
function showSendGroupNotifyMessage(obj) {
    if ($(obj).attr("isrun") == "true") {
        layer.msg("上次任务还没完成,请稍后重试");
        return;
    }
    var groupName = $(obj).attr("groupname");
    var wxUin = $(obj).attr("wxuin");
    var groupId = $(obj).attr("userid");
    $("#chatgroupcontent_" + groupId).find("[stype=group_notify]").each(function() {
        $(this).attr("isrun", "true");
    });
    var showHtml = "<table class=\"alterPass_two\">" +
        "<tbody>" +
        "    <tr>" +
        "        <td>" +
        "           <div style=\"width:290px;height:80px;border:1px solid #a6a6a6; margin-top:10px; overflow-x:hidden;\" id=\"txt_SendGroupNotifyMessage\" contenteditable=\"true\"></div>" +
        "        </td>" +
        "    </tr>" +
        "</tbody>" +
        "</table>"
    layer.open({
        type: 1,
        title: "公告内容",
        skin: 'layui-layer-rim', //加上边框
        area: ['420px', '200px'], //宽高
        content: showHtml,
        btn: ["确定", "取消"],
        yes: function(newGroupIndex, layero) {

            var notifyContent = $("#txt_SendGroupNotifyMessage").html();
            notifyContent = disposeShowContentHtml(notifyContent);
            notifyContent = disposeSendContent(notifyContent);
            var sendDate = {
                wxuin: wxUin,
                groupName: groupName,
                notifyContent: notifyContent,
                groupId: groupId

            };
            socket.emit('sendgroupnotifymessage', sendDate);

            layer.close(newGroupIndex);
        },
        btn2: function(index, layero) {
            layer.close(index);
        }
    });
}

//改变微信在线状态
function ChangeWxOnlineState(wxUin, State) {
    $("div[stype=wxMain][sign=" + wxUin + "]").attr("wxOnlineState", State);
    if (State == 1) {
        $("div[sign=right][WxUin=" + wxUin + "]").find(".state>img[sign=online]").each(function() {
            $(this).show();
            $(this).siblings().hide();
        });
    } else if (State == -1) {
        $("div[sign=right][WxUin=" + wxUin + "]").find(".state>img[sign=offline]").each(function() {
            $(this).show();
            $(this).siblings().hide();
        });
    } else if (State == 0) {
        $("div[sign=right][WxUin=" + wxUin + "]").find(".state>img[sign=logining]").each(function() {
            $(this).show();
            $(this).siblings().hide();
        });
    }
}

//检测微信在线情况
function CheckWxOnlineState(wxUin) {
    var res = false;
    var wxOnlineState = parseInt($("div[stype=wxMain][sign=" + wxUin + "]").attr("wxOnlineState"));
    if (wxOnlineState == 1) {
        res = true;
    }
    return res;
}

var isRunTransmitmsaagetofriendcycle = false;

//49类型消息图片点击（正常不用处理 检测到下载失败的需要重新下载）
function message49_img_click(obj) {
    if ($(obj).parent().parent().parent().parent().attr("loadstate") == "false") {
        $(obj).parent().parent().parent().parent().attr("loadstate", "");
        $(obj).attr("src", "/images/load/not_loadingsmall.gif");
        var msgId = $(obj).parent().parent().attr("msgid");
        var sendData = {
            MessageId: msgId
        };
        socket.emit("reloadmessage", sendData);
    }

}

//获取UUid方法
function CreateUUid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
}

//获取文件扩展名
function fileExtend(fileName) {

    if (fileName.length > 1 && fileName) {
        var ldot = fileName.lastIndexOf(".");
        var type = fileName.substring(ldot + 1);
        return type;
    } else {
        return "";
    }
}

//获取文件showsize
function showsize(Size) {
    var showSize = "";
    if (parseFloat(Size) > 1000) {
        var kbSize = parseFloat(Size) / parseFloat(1000);
        if (kbSize > 1000) {
            var mbSize = parseFloat(Size) / parseFloat(1000) / parseFloat(1000);
            showSize = mbSize.toFixed(2) + "MB";
        } else {
            showSize = kbSize.toFixed(2) + "KB";
        }

    } else {
        showSize = Size + "B";
    }
    return showSize;
}

//文件上传进度条进度
function onprogress(evt) {　　

}
