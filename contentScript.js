console.log('hey111111')
// chrome.tabs.executeScript(null, { file: "jquery-3.4.1.min.js" }, function() {
//   chrome.tabs.executeScript(null, { file: "ergoSlackInjected.js" });
// });

// var script = document.createElement("script");
// script.src = chrome.extension.getURL("ergoSlackInjected.js");
// document.body.appendChild(script);

// $ is not defined in contentScript.js, but it is in ergoSlackInjected.js
console.log('hey2')

function isScrolledIntoView(elem) {
  var docViewTop = $(window).scrollTop();
  var docViewBottom = docViewTop + $(window).height();

  var elemTop = $(elem).offset().top;
  var elemBottom = elemTop + $(elem).height();

  return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

function markVisibleMessagesUnread() {
  isScrolledIntoView($('ts-message.message_container_item.message').first())
  var lastVisibleMessage = null
  $('ts-message.message_container_item.message').each(function(ii, element) {
    if (isScrolledIntoView($(element))) {
      lastVisibleMessage = element;
    } else {
      if (lastVisibleMessage) {
        console.log('got one', lastVisibleMessage, lastVisibleMessage.id)
      } else {
        console.log('nada');
      }
      return false;
    }
  }); null

  if (lastVisibleMessage) {
    // open menu for message
    console.log('clicking menu')
    $(`#${lastVisibleMessage.id} .btn_msg_action.ts_icon_small_ellipsis`).click()
    setTimeout(function() {
      if ($('.p-message_actions_menu__mark_unread').length === 1) {
        console.log('found button')
        // mark this message unread along with all messages above it
        $('.p-message_actions_menu__mark_unread').click()
        $("<span>s</span>").insertAfter('#channel_name')
      } else {
        console.log('found button')
      }
    }, 1000);
  }
}

function mainChatInputBoxEmpty() {
  return $('#msg_input .ql-editor.ql-blank').length
}

function threadChatInputBoxNotPresentOrEmpty() {
  return $('.p-message_input_field').length === 0 || $('.p-message_input_field .ql-editor.ql-blank').length
}

function noTextBoxFocusedOrFocusedTextBoxEmpty() {
  return $('.ql-editor.focus-ring').length === 0 || $('.ql-editor.focus-ring.ql-blank').length
}

addEventListener("keydown", function(event) {
  // console.log('keydown', event.code);
  if (event.key === "d") {
    console.log('got d in ergoSlackInjected.js');

    // if not typing a message...
    // if (mainChatInputBoxEmpty() && threadChatInputBoxNotPresentOrEmpty()) {
    if (noTextBoxFocusedOrFocusedTextBoxEmpty()) {

      // if the big "there are new messages" button is at the top of the "All Unreads" page, click it
      if ($('#channel_header_unread_refresh').length && !$('#channel_header_unread_refresh.hidden').length) {
        $('#channel_header_unread_refresh').click()
        $("<span>f</span>").insertAfter('#channel_name')

      // if we are on the "All Unreads" page, mark the first unread channel all read
      } else if ($('.p-channel_sidebar__link--all-unreads.p-channel_sidebar__link--selected.p-channel_sidebar__link--unread').length === 1) {
        console.log('looking for things to mark unread')
        // markVisibleMessagesUnread()
        //
        var unreadChannels = $('.unread_group').not('.marked_as_read').not('.collapsed')

        // special case. if the last unread channel has a jira link, go there, since that is the only way to view the jira content
        if (unreadChannels.length === 1) {
          var jiraLinkSinceItCannotShowStuffHere = $('.message_body .block_kit_error_color_bar span.sk_dark_gray').next('a')
          if (jiraLinkSinceItCannotShowStuffHere.length) {
            jiraLinkSinceItCannotShowStuffHere.first().click()
            event.preventDefault()
            return
          }
        }
        var lastMessageInFirstUnreadChannel = unreadChannels.first().find('.message').last()
        console.log('lastMessageInFirstUnreadChannel: ',lastMessageInFirstUnreadChannel );
        if (lastMessageInFirstUnreadChannel.length) {
          if (isScrolledIntoView(lastMessageInFirstUnreadChannel)) {
            console.log('in view')
            $('.unread_group_mark').first().click()
            $("<span>r</span>").insertAfter('#channel_name')
          } else {
            console.log('not in view. scrolling')
            console.log('lastMessageInFirstUnreadChannel: ',lastMessageInFirstUnreadChannel[0].id );
            document.querySelector(`#${lastMessageInFirstUnreadChannel[0].id}`).scrollIntoView({
              behavior: "smooth",
              block: "end",
              inline: "nearest"
            });
          }
        }

      // if we are not on the "All Unreads" page, go there
      } else if ($('.p-channel_sidebar__link--all-unreads.p-channel_sidebar__link--unread').length === 1 ) {
        $('.p-channel_sidebar__link--all-unreads.p-channel_sidebar__link--unread').click()
        setTimeout(function() {
          $("<span>c</span>").insertAfter('#channel_name')
        }, 2000);
      }
    }
  }
})

console.log('hey3')
