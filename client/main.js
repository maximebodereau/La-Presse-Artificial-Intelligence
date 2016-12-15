import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import retext from 'retext';
import nlcstToString from 'nlcst-to-string';
import keywords from 'retext-keywords';
import english from 'retext-english';
import xml2js from 'xml2js';

import './main.html';


UI.registerHelper('formatTime', function(context, options) {
if(context)
  return moment(context).fromNow();
});


Template.layout.onRendered(function () {
  $(".flux").scrollTop($(".flux")[0].scrollHeight);
});


Template.inputForm.events({
  "keyup #textVal": function (event, template) {

    //isWriting shows bubble messages
    Session.set('isWriting', true);
    if ($("#textVal").val() == "") {
      Session.set('isWriting', false);
    }

  },
  "keypress #textVal": function (event, template) {

    // TEXT PARSER : KEYWORD
    Tracker.autorun(function () {

      // Changed Form Text Session
      changedText = $("#textVal").val();
      Session.set('inputForm', changedText);
      //console.log('session Get.Form:' + Session.get('inputForm'));
      $(".flux").scrollTop($(".flux")[0].scrollHeight);

      getInputForm = Session.get('inputForm');

      retext().use(keywords).process(
        //get Data from the Input Message
        getInputForm,
        function (err, file) {
          //console.log('Keywords:');
          file.data.keywords.forEach(function (keyword) {
            //console.log('nlcstToString:' + nlcstToString(keyword.matches[0].node));
            keyword = nlcstToString(keyword.matches[0].node);
            Session.set('dataKeyword', keyword);
            //console.log('session this keyword:' + Session.get('dataKeyword'));
          });
        }
      );

    });
    //END TEXT PARSER : KEYWORD

    //on Pressed Enter Key
    if (event.which === 13) {


      //Insert the user message in news collection
      News.insert({
        'title': Session.get('inputForm'),
        'pubDate': new Date(),
        'date': new Date(),
        'person': 'guest'
      });


      // KEY WORD : HELLO
      if ( Session.get('dataKeyword') === "hi" || Session.get('dataKeyword') === "hel") {
        Meteor.call('morningMessage');
      }
      // KEY WORD : NEWS
      if ( Session.get("dataKeyword") === "news" || Session.get("dataKeyword") === "New" ) {
        Meteor.call("callNewsXML");
      }
      // KEY WORD : SPORT
      if ( Session.get("dataKeyword") === "sport" || Session.get("dataKeyword") === "Sport"  ) {
        Meteor.call("callSportXML");
      }
      // KEY WORD : MTL
      if ( Session.get("dataKeyword") === "montrea" || Session.get("dataKeyword") === "Montrea" ) {
        Meteor.call("callMontrealXML");
      }
      // KEY WORD : ART
      if ( Session.get("dataKeyword") === "art" || Session.get("dataKeyword") === "Art" ) {
        Meteor.call("callArtXML");
      }


      //Scroll to Bottom
      $(".flux").scrollTop($(".flux")[0].scrollHeight);


      // Reset the message form input
      $("#textVal").val("");



    }

    $(".flux").scrollTop($(".flux")[0].scrollHeight);

  }
});

Template.layout.helpers({
  isWriting: function () {
    return Session.get('isWriting');
  }
});

Template.messages.helpers({
  text: function() {
    return Session.get('inputForm');
  }
});

Template.newsRender.helpers({
  newsRender: function () {
    return News.find({}, {sort: {date: 1, pubDate: -1}});
  },
  personIsBot: function () {
    return true;
  }
});

Template.newsRender.events({
  "click .bubble.bot": function ( event, template ) {
    $(event.target).children('.description').show();
    $(event.target).children('.title').hide();
  },
  "click .bubble.bot .title.isNews": function ( event, template ) {
    $(event.target).siblings('.description').show();
    $(event.target).hide();
  }
});

Template.newsRender.onRendered(function () {
  var template = this;

  this.autorun(function () {
    if (template.subscriptionsReady()) {
      Tracker.afterFlush(function () {
        $(".flux").scrollTop($(".flux")[0].scrollHeight);
      });
    }
  });
});
