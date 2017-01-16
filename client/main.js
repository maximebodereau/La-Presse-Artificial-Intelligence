import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import retext from 'retext';
import nlcstToString from 'nlcst-to-string';
import keywords from 'retext-keywords';
import english from 'retext-english';
import spell from 'retext-spell';
import dictionary from 'dictionary-en-gb';
import profanities from 'retext-profanities';
import report from 'vfile-reporter';

import xml2js from 'xml2js';

import './main.html';


UI.registerHelper('formatTime', function(context, options) {
if(context)
  return moment(context).fromNow();
});


Template.newsRender.onRendered(function () {

  Tracker.autorun(function () {
    $(".flux .bubble").each(function(i) {
        $(this).delay(50 * i).fadeIn(600);
    });
    $(".flux .avatar.bot").each(function(i) {
        $(this).delay(50 * i).fadeIn(600);
    });

    $(".flux").scrollTop($(".flux")[0].scrollHeight);


    // When 100 messages -> put them in archive
    if (News.find({archived: "false"}).count() >= 100) {
      Meteor.setTimeout(function(){
        Meteor.call('updateforArchiving');
      }, 20000);
    }
  });
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

    // TEXT PARSER
    Tracker.autorun(function () {

      // Changed Form Text Session
      changedText = $("#textVal").val();
      Session.set('inputForm', changedText);
      //console.log('session Get.Form:' + Session.get('inputForm'));
      $(".flux").scrollTop($(".flux")[0].scrollHeight);

      getInputForm = Session.get('inputForm');


      // TEXT ANALYZER KEYWORDS AND KEYPHRASE
      retext().use(keywords).process(
        //get Data from the Input Message
        getInputForm,
        function (err, file) {

          //console.error(report(err || file));

          //console.log('Keywords:');
          file.data.keywords.forEach(function (keyword) {
            //console.log('nlcstToString:' + nlcstToString(keyword.matches[0].node));
            keyword = nlcstToString(keyword.matches[0].node);
            Session.set('dataKeyword', keyword.toLowerCase());
            //console.log('session this keyword:' + Session.get('dataKeyword'));
          });

          //console.log('Key-phrases:');
          file.data.keyphrases.forEach(function (phrase) {
            //console.log(phrase.matches[0].nodes.map(nlcstToString).join(''));
            keyphrase = phrase.matches[0].nodes.map(nlcstToString).join('')
            Session.set('dataKeyphrase', keyphrase.toLowerCase());
          });

        }
      );

      retext().use(profanities)
      .process([getInputForm].join('\n'), function (err, file) {
        //console.log(file.messages);
        file.messages.forEach( function (badword) {
          //console.log(badword.message);
          //console.log(badword);
          profanity = badword.message;
          Session.set('profanity', profanity);
        })
      });


    });
    //END TEXT PARSER

    //on Pressed Enter Key
    if (event.which === 13) {

      // Check if a Keyword or Keyphrase is activated
      Meteor.call('ifKeywordMatch', Session.get('dataKeyword'), Session.get('dataKeyphrase'), function(err, res) {});

      //Insert the user message in news collection
      if ( Session.get('dataKeyword') === undefined ) {
        Meteor.call('messageFromClientSide', 'Hum, try any keyword like help. Or news, science, international...');
      } else {
        Meteor.call('userMessage', Session.get('inputForm'));
      }


      //Check if Profanity
      if ( Session.get('profanity') !== "" ) {

        Meteor.call('profanityMessage', Session.get('profanity'));
        $("#textVal").val("");
        Session.set('profanity', '');

      }


      // Reset the message form input
      $("#textVal").val("");

      Tracker.flush();

      //Scroll to Bottom
      $(".flux").scrollTop($(".flux")[0].scrollHeight);
    }



    $(".flux").scrollTop($(".flux")[0].scrollHeight);

  }
});

Template.layout.helpers({
  isWriting: function () {
    return Session.get('isWriting');
  }
});

Session.set('needArchive', 'false');


Template.newsRender.helpers({
  newsRender: function () {
    if ( Session.get('needArchive') === 'true') {
      console.log('i want archive');
      return News.find({archived: "true"}, {sort: {date: 1, pubDate: -1}});

    } else {
      console.log("don't need archive");
      return News.find({archived: "false"}, {sort: {date: 1, pubDate: -1}});
    }
  },
  personIsBot: function () {
    return true;
  }
});

Template.iframeWeb.helpers({
  askExtUrl: function () {
    return Session.get('askExtUrl');
  }
});


Template.newsRender.events({
  "click .bubble.bot": function ( event, template ) {
    $(event.target).children('.description').show();
    $(event.target).children('.title').hide();
  },
  "click .bubble.bot .title.isNews, touch .bubble.bot .title.isNews": function ( event, template ) {
    $(event.target).siblings('.description').show();
    $(event.target).hide();
  },
  "click .openiFrame": function (event, template) {
    Meteor.defer(function(){
        console.log('im defer');
        Meteor.call('askContentDetail');
        var thisUrl = News.findOne( $(event.target).data('id') );
        var theUrlDetail = Session.set('theUrlArticle', thisUrl.url);
        console.log(Session.get('theUrlArticle'));
    });
  },
  "click .bubble.bot, touch .bubble.bot": function (event, template) {
    // USER CAN SELECT A WORD TO PERFORM A SEARCH
    var selection = window.getSelection() || document.getSelection() || document.selection.createRange();
    var word = $.trim(selection.toString().toLowerCase());
    if(word != '') {
        Session.set('dataKeyword', word);
        Meteor.call('ifKeywordMatch', Session.get('dataKeyword'), Session.get('dataKeyPhrase'), function(err, res) {
          $(".flux").scrollTop($(".flux")[0].scrollHeight);
        });
    }
  }
});

Template.iframeWeb.events({
  "click .closeiFrame": function (event, template) {
    Session.set('askExtUrl', false);
  }
});
