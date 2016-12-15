import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {

  Meteor.functions = {
    parseXML: function (url) {
      Meteor.http.call("GET", url, function(error, results) {
          xmlStr = results.content;
          xml2js.parseString(xmlStr, function (err, result) {
            resultsparsed = result.rss.channel[0].item;
            //Session.set('resultsNews', resultsparsed);
            // console.log(Session.get('resultsNews'));
            console.log(resultsparsed);
            listparsed = _.map(resultsparsed, function(item) {
              Meteor.functions.insertDB(item)
            });
          });
      });
    },
    
    insertDB: function (item) {
      News.insert({
        'title': item.title,
        'description': item.description,
        'pubDate': item.pubDate[0],
        'author': item['dc:creator'],
        'source': item['dc:source'],
        'date': new Date(),
        'url': item.link,
        'person': 'bot',
        'isNews': 'isNews'
      });
    }
  };

  Meteor.methods({
    // La Presse News
    'callNewsXML': function () {
        this.unblock();
        return Meteor.functions.parseXML("http://www.lapresse.ca/rss/225.xml");
    }
    ,
    // Sport
    'callSportXML': function () {
        this.unblock();
        return Meteor.functions.parseXML("http://www.lapresse.ca/rss/229.xml");
    }
    ,
    // MTL
    'callMontrealXML': function () {
        this.unblock();
        return Meteor.functions.parseXML("http://www.lapresse.ca/rss/257.xml");
    }
    ,
    // ART
    'callArtXML': function () {
        this.unblock();
        return Meteor.functions.parseXML("http://www.lapresse.ca/rss/216.xml");
    }
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
          'title': "Ask me for News, Sport, Montreal",
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
