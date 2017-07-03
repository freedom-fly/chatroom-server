$(function() {
    $(".li-top").on("click", function() {
        $(".li-content").hide();

        $("#message_record").removeAttr("style");

        if ($(this).attr("opened") == "false") {
            $(this).next().show();
            $(this).parent().find(".icon-shangla2").show();
            $(this).parent().find(".icon-under1").hide();
            $(this).attr("opened", true);
            var sign = $(this).attr("sign");

            if (sign == "message_record") {
                showMessageRecord(); //显示聊天记录
            } else if (sign == "user_remark") //备注
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
            } else if (sign == "user_figure") //用户画像
            {
                showUserFigure();
            } else if (sign == "search_task") //搜索添加队列
            {
                showSearchTask();
            }
        } else {
            $(this).next().hide();
            $(this).parent().find(".icon-shangla2").hide();
            $(this).parent().find(".icon-under1").show();
            $(this).attr("opened", false);

        }
        $(this).parent().siblings().children(".li-top").attr("opened", false);
        $(this).parent().siblings().find(".icon-shangla2").hide();
        $(this).parent().siblings().find(".icon-under1").show();
    })
    $(".edit-user").on("click", function() {
        $(this).parent().find(".textarea").attr("readonly", false);
        if ($(this).parent().find(".textarea").val() == "点击“编辑”修改用户备注。") {
            $(this).parent().find(".textarea").val("");
        }
        $(this).hide();
        $(this).parent().find(".textarea").css({ "border": "1px solid #d1d6e4", "background-color": "#fff" });

        $(".save-user").show();
    });
    $(".save-user").on("click", function() {
        $(this).parent().find(".textarea").css({ "border": "none", "background-color": "#e8edfa" });
        if ($(this).parent().find(".textarea").val() == "") {
            layer.msg("请输入备注内容");
            return;
        }
        var saveRemark = htmlDecode($(this).parent().find(".textarea").val());
        if (saveRemark.length > 2000) {
            layer.msg("输入备注内容不能超过2000字");
            return;
        }
        var remarkDiv = $(".rightmenu").find("div[sign=user_remark]");
        var wxUin = remarkDiv.attr("wxuin");
        var userid = remarkDiv.attr("userid");
        var currentChatType = $("div[stype=wxMain][sign=" + wxUin + "]").find(".left>.Name>li.selected").attr("sign");
        if (currentChatType == "CurrentChatMenuLi") //普通联系人
        {
            var sendData = {
                UserId: userid,
                WxUin: wxUin,
                RemarkName: saveRemark
            };
            socket.emit('setuserremark', sendData);
        } else if (currentChatType == "ChatGroupLi") //群联系人
        {
            remarkDiv.next().find(".textarea").val("群不可以备注");
        }

        $(this).parent().find(".textarea").attr("readonly", true);
        $(this).hide();
        $(".edit-user").show();
    });
    $("body").on("click", '.icon-revise3', function() {
        $(this).parent().find(".huaxiang-txt").addClass("huaxiang-bianji");
        $(this).parent().find(".huaxiang-txt").attr("readonly", false);
        $(this).parent().find(".icon-complete").show();
        $(this).hide();
    });
    $("body").on("click", '.icon-complete', function() {
        var WechatUin = $(".maintTop").find(".select").attr("wxuin");
        var UserId = $(".One").find(".center").find(".bottom").find("li.titsh").attr("userid");
        var PortraitInfo = $(this).siblings(".huaxiang-bianji").val();
        var UserPortraitConfigId = $(this).siblings(".huaxiang-bianji").attr("UserPortraitConfigId");
        var sendData = {
            UserId: UserId,
            WxUin: WechatUin,
            PortraitInfo: PortraitInfo,
            UserPortraitConfigId: UserPortraitConfigId
        }
        socket.emit('saveuserportraitinfo', sendData);
    });
    param.init();
})
var stopEventBubble = function(e) {
    e.cancelBubble = true; //阻止冒泡
    e.stopPropagation(); //阻止冒泡
}
var param = {
    init: function() {
        $(".btn-save", ".fenzu").on("click", function() {
            $(this).parent().prev().find("p").attr("contenteditable", false);
            $(this).parent().prev().find("p").removeClass("p-bianji");
            $(this).parent().prev().find(".icon-add").hide();
            $(this).parent().find("p").attr("contenteditable", false);
            $(this).parent().find(".p-bianji").removeClass("p-bianji");
            $(this).hide();
            //  param.init();
        });
        $(".icon-add").off("click");
        $(".icon-add").on("click", function(event) {
            var str = '<li class="huifu-li"><i class="icaozuo icon-delete"></i><i class="icaozuo icon-revise2"></i><p contenteditable="true" class="p-bianji"></p></li>';
            $(this).parent().next().children("ul").append(str);
            $(this).parent().next().find(".btn-save").show();

        });


        $("body").on("click", '.icon-revise2', function() {
            $(this).parent().children("p").addClass("p-bianji");
            $(this).parent().children("p").attr("contenteditable", true);
            $(this).parent().next().find(".btn-save").show();
        });
        $(".icon-delete", ".fenzu-top").on("click", function() {
            $(this).parent().parent().remove();
        })
        $(".icon-delete", ".fenzu-li").on("click", function() {
            $(this).parent().remove();
        })


    }
}

function addFenzu(ele) {
    $(ele).parent().find("p").removeClass("selected");
    $(ele).addClass("selected");
    var divHtml =
        "<div class=\"Fastquick_fenzu\" contenteditable=\"true\"></div>";
    layer.open({
        type: 1,
        title: "添加分组",
        skin: 'layui-layer-rim', //加上边框
        area: ['350px', '220px'], //宽高
        btn: ["保存"],
        content: divHtml,
        yes: function(index, layero) {
            var ReplyGroupName = $(layero).find(".Fastquick_fenzu").text();
            var sendData = {
                ReplyGroupName: ReplyGroupName
            };
            socket.emit('createquickreplygroup', sendData);
            layer.close(index);
        },
    })

}

function Deletecurrentfenzu(obj) {
    var ReplyGroupId = $(obj).parents(".fenzu:first").attr("replygroupid");
    var sendData = {
        ReplyGroupId: ReplyGroupId
    }
    socket.emit('deletequickreplygroup', sendData);
}

function Deletecurrentcollect(obj) {
    var ChatRoomFavoriteId = $(obj).prev().attr("ChatRoomFavoriteId");
    var sendData = {
        ChatRoomFavoriteId: ChatRoomFavoriteId,
        Type: $(obj).parents(".fenzu:first").attr("type")
    }
    socket.emit('deletemyfavorite', sendData);
}

function deletequickreply(obj) {
    var ReplyGroupId = $(obj).parents(".fenzu:first").attr("replygroupid");
    var FastReplyId = $(obj).parents(".huifu-li").attr("fastReplyId");
    var sendData = {
        ReplyGroupId: ReplyGroupId,
        FastReplyId: FastReplyId
    }
    socket.emit('deletequickreply', sendData);
}
