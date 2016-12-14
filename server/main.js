import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {

  Meteor.methods({
    // Get XMl La Presse News
    'callNewsXML': function () {
        this.unblock();
        return Meteor.http.call("GET", "http://www.lapresse.ca/rss/225.xml", function(error, results) {
            xmlStr = results.content;
            xml2js.parseString(xmlStr, function (err, result) {
              resultsparsed = result.rss.channel[0].item;
              //Session.set('resultsNews', resultsparsed);
              // console.log(Session.get('resultsNews'));
              //console.log(resultsparsed);
              listparsed = _.map(resultsparsed, function(item) {
                News.insert({
                  'title': item.title,
                  'description': item.description,
                  'pubDate': item.pubDate[0],
                  'author': item['dc:creator'],
                  'date': new Date(),
                  'person': 'bot'
                });
              });
            });
        });
    }
    // Get XMl La Presse News
    ,
    // Get XMl La Presse Sport
    'callSportXML': function () {
        this.unblock();
        return Meteor.http.call("GET", "http://www.lapresse.ca/rss/229.xml", function(error, results) {
            xmlStr = results.content;
            xml2js.parseString(xmlStr, function (err, result) {
              resultsparsed = result.rss.channel[0].item;
              //Session.set('resultsNews', resultsparsed);
              //console.log(Session.get('resultsNews'));
              console.log(resultsparsed);
              listparsed = _.map(resultsparsed, function(item) {
                News.insert({
                  'title': item.title,
                  'description': item.description,
                  'pubDate': item.pubDate[0],
                  'author': item['dc:creator'],
                  'date': new Date(),
                  'person': 'bot'
                });
              });
            });
        });
    }
    // Get XMl La Presse Sport
    ,
    // HELLO
    'morningMessage': function () {

      Meteor.setTimeout(function(){
        News.insert({
          'title': "Hi, I'm your newspaper delivery",
          'pubDate': new Date(),
          'date': new Date(),
          'person': 'bot'
        });
      }, 700);

      Meteor.setTimeout(function(){
        News.insert({
          'title': "Ask me for News or a theme like Sports or Business",
          'pubDate': new Date(),
          'date': new Date(),
          'person': 'bot'
        });
      }, 1200);

    }
    // END HELLO


  });


  // At FIrst Launch
  if (News.find().count() == 0 ) {
    Meteor.call('morningMessage');
  }



});
