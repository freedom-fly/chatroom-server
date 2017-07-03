$(function() {
    /*var contentUe = UE.getEditor('contentEditor');*/
})

function getMessageArray() {
    var messageArray = new Array();
    var content = contentUe.getPlainTxt();
    var temMessage = content.split(/[<,>]/).filter(function(value) {
        return value.replace('\n', '').length > 0;
    });

    $(temMessage).each(function(key, value) {
        var str = value.toString();
        if (str.indexOf('img') >= 0) {
            var imgUrl = $('<' + value + '>').attr('src');
            messageArray.push({ type: 3, content: imgUrl });
            return true;
        }
        messageArray.push({ type: 1, content: str });
    });

    return messageArray.reverse();
}

//显示单个多张图片和文字
function showmostcontent(obj) {
    var userid = $(obj).attr("userid");
    var wxUin = $(obj).attr("WxUin");
    var id = 'ue_' + CreateUUid();
    var showHtml = '<script id="' + id + '" name="content" type="text/plain"></script>';
    layer.open({
        type: 1,
        title: "发送多张图片和文字",
        skin: 'layui-layer-rim', //加上边框
        area: ['600px', '520px'], //宽高
        content: showHtml,
        btn: ["确定", "取消"],
        yes: function(index, layero) {
            var messages = getMessageArray();
            sengMessage(messages);
            layer.close(index);
        },
        success: function(layero, index) {
            window.contentUe = UE.getEditor(id);
        },
        end: function() {
            window.contentUe.destroy();
        }
    });
}

//单个群发图片和文字成功显示             
function sengMessage(messages) {
    if (messages.length <= 0) {
        return;
    }
    var value = messages.pop();
    var input = $('.One:visible div.consh').find(".bottom input[wxUin]");
    if (value.type == 3) {//图片

        var data = {
            httpurl: value.content,
            displayUrl: value.content

        }
        SendPicAfterUpload(input, data);

    } else if (value.type == 1) {//文字
        if (input.attr("multysend") == "true") {
            DoSendGroupMessage(input, value.content);
        } else if (input.attr("isgroup") == "true") {
            SendMessage(input, true, value.content);
        } else {
            SendMessage(input, false, value.content);
        }

    }
    setTimeout(function() {
        sengMessage(messages);
    }, 1000);
}

//显示群发多张图片和文字
function showmultycontent(obj) {
    var groupKey = $(obj).attr("groupKey");
    var wxUin = $(obj).attr("WxUin");
    var id = 'ue_' + CreateUUid();
    var showHtml = '<script id="' + id + '" name="content" type="text/plain"></script>';
    layer.open({
        type: 1,
        title: "发送多张图片和文字",
        skin: 'layui-layer-rim', //加上边框
        area: ['600px', '520px'], //宽高
        content: showHtml,
        btn: ["确定", "取消"],
        yes: function(index, layero) {
            var messages = getMessageArray();
            sengmultyMessage(messages, groupKey, wxUin);
            layer.close(index);
        },
        success: function(layero, index) {
            window.contentUe = UE.getEditor(id);
        },
        end: function() {
            window.contentUe.destroy();
        }
    });
}

//群发图片和文字显示
function sengmultyMessage(messagesArray, groupKey, wxUin) {
    if (messagesArray.length <= 0) {
        return;
    }

    //找到当前聊天窗口
    //遍历消息 创建html显示
    var chatcontentid = "chatconten_group_" + groupKey + "_" + wxUin;
    var groupOl = $("#group_ol_" + groupKey + "_" + wxUin);
    var WxUinHeadImgUrl = groupOl.find("li").eq(0).attr("WxUinHeadImgUrl");
    for (var i = messagesArray.length - 1; i >= 0; i--) {
        var messageContent = messagesArray[i].content;
        var messageType = messagesArray[i].type;
        var messageHtml = " <li wxuin=\"" + wxUin + "\"  class=\"rightli\"> " +
            "      <div class=\"img fr\"> " +
            "     <img src=\"" + WxUinHeadImgUrl + "\"/>" +
            "    </div>" +
            "     <div class=\"content fr\" sign=\"groupmessage\" messagetype=\"1\">";
        messageHtml += disposeMessageShowHtml('', messageContent, messageType, '', wxUin, false, true, true);
        messageHtml += "   </div>" +
            "  </li>";
        $("#" + chatcontentid + ">.middle>ul").append(messageHtml);
    }

    // var input = $('.One:visible div.consh').find(".bottom input[wxUin]");
    //找到分组下所有好友
    var groupOl = $("#group_ol_" + groupKey + "_" + wxUin);
    var sindex = 0;
    var waitSendMessageArray = [];
    $(groupOl).find("li").each(function() {
        var obj = this;
        var WxUin = $(obj).attr("WxUin");
        var EmployeeId = $(obj).attr("EmployeeId");
        var UserId = $(obj).attr("UserId");
        var ResourceId = $(obj).attr("ResourceId");
        var WxUinHeadImgUrl = $(obj).attr("WxUinHeadImgUrl");
        var IsNew = $(obj).attr("IsNew");

        for (var i = messagesArray.length - 1; i >= 0; i--) {
            var MessageType = messagesArray[i].type;
            var messageContent = messagesArray[i].content;
            var MessageId = WxUin + "_" + UserId + "_" + CreateUUid();
            var chatcontentid = "chatconten_" + UserId + "_" + WxUin;
            var addTimeSpan = GetIsAddTimeSpan(chatcontentid);
            var messageData = {
                userid: UserId,
                messageid: MessageId,
                messagecontent: messageContent,
                messagetype: MessageType,
                fileName: ''
            };
            waitSendMessageArray.push(messageData);
                var contacts = $("#contractli" + UserId + "_" + WxUin);
                // contacts.click();
                ShowChat(contacts, false, false);
                AddMyMessage(UserId, MessageId, messageContent, MessageType, addTimeSpan, new Date(), false, true, WxUin);
            sindex++;
        }

        var IsNew = $(obj).attr("IsNew");
        if (IsNew == "true") { //设置联系人isnew属性
            var senddata = {
                userid: UserId,
                wxuin: WxUin,
                isnew: false
            };
            socket.emit('sendmessagelist', senddata);

        }
        $(obj).attr("IsNew", "false");

        $(obj).parent().parent().find("[cname=txtSendContent]").html("");

    });
    var sendmessagelist = { client: 'web', wxuin: wxUin, messagelist: waitSendMessageArray };
    socket.emit('sendmessagelist', sendmessagelist);
}
