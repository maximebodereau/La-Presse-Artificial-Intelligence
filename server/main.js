import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {

  Meteor.functions = {
    parsePageContent: function (error, result) {
      HTTP.call("GET", "http://www.lapresse.ca/sports/hockey/201612/26/01-5054676-bergevin-et-therrien-semblent-avoir-relance-le-canadien.php", function(error, result){
        if(error){
          console.log("error", error);
        }
        if(result){
          console.log("result", result);

        }
      });
    },
    parseXML: function (url) {
      HTTP.call("GET", url, function(error, results) {
          xmlStr = results.content;
          xml2js.parseString(xmlStr, function (err, result) {
            if (err) {
              console.log('coucou');
            }
            resultsparsed = result.rss.channel[0].item;
            listparsed = _.map(resultsparsed, function(item) {
              Meteor.setTimeout(function(){
                Meteor.functions.insertDB(item)
              }, 1376);
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
        //'enclosure': item.enclosure['url': url],
        'person': 'bot',
        'isNews': 'isNews',
        'archived': 'false'
      });
    },
    responseMessage: function (responseMessage) {
      Meteor.setTimeout(function(){
        News.insert({
          'title': responseMessage,
          'pubDate': new Date(),
          'date': new Date(),
          'person': 'bot',
          'archived': 'false'
        });
      }, 752);
    },
    userMessage: function (userMessage) {
      Meteor.setTimeout(function(){
        News.insert({
          'title': userMessage,
          'pubDate': new Date(),
          'date': new Date(),
          'person': 'guest',
          'archived': 'false',
          userId: Random.id()
        });
      }, 36);
    }
  };

  Meteor.methods({
    'askContentDetail': function () {
      Meteor.functions.parsePageContent();
    },
    'ifKeywordMatch': function (dataKeyword, dataKeyphrase) {
      if (dataKeyword == 'hi' || dataKeyword == 'hel') {
        Meteor.call('morningMessage');
      }
      if (dataKeyword == 'bonjour' || dataKeyword == 'salut') {
        Meteor.functions.responseMessage("Salut. Je suis à ton service. Demande moi pour des actualités sur la science, international, montreal ou le sport...");
        Meteor.functions.responseMessage("En gros répond moi par un mot-clef ou click sur un mot dans le message précédant...");
      }
      //Actions
      if (dataKeyword == 'archive' || dataKeyword == 'archives') {
        if (News.find({archived: "true"}).count() == 0) {
          Meteor.functions.responseMessage("Look, there is no archive.");
        } else {
          Meteor.functions.responseMessage("Ok, I put the " + Meteor.call('archivedNumber') + " old messages in day context, scroll up to time travel.");
          Session.set('needArchive', 'true');
        }
      }
      if ( dataKeyword == 'delet' || dataKeyword == 'supprimer') {
        Meteor.functions.responseMessage('Wait I clean the old messages...');
        Meteor.call("deleteOldMessages");
        if (News.find({archived: "true"}).count() <= 2) {
          Meteor.functions.responseMessage('Cleaned');
        }
        if (News.find({archived: "true"}).count() == 0) {
          Meteor.functions.responseMessage('No Archives to delete');
        }
      }
      //Kind of news
      if ( dataKeyword == 'news' || dataKeyword == 'actu') {
        Meteor.functions.responseMessage('Here the last news for you...');
        Meteor.call("callNewsXML");
      }
      if ( dataKeyword == 'sport') {
        Meteor.functions.responseMessage('And for the Sports..');
        Meteor.call("callSportXML");
      }
      if ( dataKeyword == 'hockey') {
        Meteor.functions.responseMessage("The Nordic.. Doesn't exists anymore.. But here some news");
        Meteor.call("callSportXML");
      }
      if ( dataKeyword == 'montrea' || dataKeyword == 'montreal') {
        Meteor.functions.responseMessage("It's a nice city, here the news...");
        Meteor.call("callMontrealXML");
      }
      if ( dataKeyword == 'art') {
        Meteor.call("callArtXML");
      }
      if ( dataKeyphrase == 'canadian politic') {
        Meteor.functions.responseMessage('Maintenant un peu de politique...');
        Meteor.call("callCanadianPoliticXML");
      }
      if ( dataKeyword == 'internationa' || dataKeyword == 'international') {
        Meteor.functions.responseMessage("À l'international maintenant...");
        Meteor.call("callInternationalXML");
      }
      if ( dataKeyword == 'europe') {
        Meteor.functions.responseMessage("En Direct de l'europe...");
        Meteor.call("callEuropeXML");
      }
      if ( dataKeyword == 'science') {
        Meteor.functions.responseMessage("Les dernières aventures scientifiques..");
        Meteor.call("callScienceXML");
      }

      // FUNNY RESPONSE
      if ( dataKeyword == 'genia') {
        Meteor.functions.responseMessage("Oui, vous êtes bien aussi");
      }
      if ( dataKeyphrase == 'dit mo') {
        Meteor.functions.responseMessage("Moi");
      }
    },
    // La Presse News XMl
    'callNewsXML': function () {
        this.unblock();
        return Meteor.functions.parseXML("http://www.lapresse.ca/rss/225.xml");
    },
    // Sport
    'callSportXML': function () {
        this.unblock();
        return Meteor.functions.parseXML("http://www.lapresse.ca/rss/229.xml");
    },
    // Sport
    'callSportHockeyXML': function () {
        this.unblock();
        return Meteor.functions.parseXML("http://www.lapresse.ca/rss/776.xml");
    },
    // MTL
    'callMontrealXML': function () {
        this.unblock();
        return Meteor.functions.parseXML("http://www.lapresse.ca/rss/257.xml");
    },
    // ART
    'callArtXML': function () {
        this.unblock();
        return Meteor.functions.parseXML("http://www.lapresse.ca/rss/216.xml");
    },
    // CANADIAN POLITICS
    'callCanadianPoliticXML': function () {
        this.unblock();
        return Meteor.functions.parseXML("http://www.lapresse.ca/rss/275.xml");
    },
    // INTERNATIONAL
    'callInternationalXML': function () {
        this.unblock();
        return Meteor.functions.parseXML("http://www.lapresse.ca/rss/387.xml");
    },
    // EUROPE
    'callEuropeXML': function () {
        this.unblock();
        return Meteor.functions.parseXML("http://www.lapresse.ca/rss/863.xml");
    },
    // SCIENCE
    'callScienceXML': function () {
        this.unblock();
        return Meteor.functions.parseXML("http://www.lapresse.ca/rss/988.xml");
    },
    //ACTIONS
    // Hello Message
    'morningMessage': function () {
      Meteor.functions.responseMessage("Hi, I'm your newspaper delivery...");
      Meteor.functions.responseMessage("Ask me for News, Sport, Montreal, Canadian Politics, International, Europe, Science...");
      if (News.find({archived: "true"}).count() >= 2) {
        Meteor.functions.responseMessage("By the way, you have "+ Meteor.call('archivedNumber') +" archived messages...");
      }

    },

    // Response to profanity
    'profanityMessage': function (profanityMessage) {
      Meteor.functions.responseMessage(profanityMessage);
    },

    // Get Article Data
    'getArticleDetail': function (theUrlDetail) {
      this.unblock();
      return Meteor.functions.parseXML(theUrlDetail);
    },

    // Get Archive Messages Count
    'archivedNumber': function () {
      return News.find({archived: "true"}).count();
    },
    'getArchive': function() {
      return News.find({archived: "true"}, {sort: {date: 1, pubDate: -1}});
    },
    // Archiving Messages in DB
    'updateforArchiving': function () {
      News.update({archived: "false"}, {$set: {archived: "true"}}, {multi: true});
      Meteor.functions.responseMessage('I archived ' + Meteor.call('archivedNumber') + ' previous messages, you could ask for achive when you want ! ');
    },
    'messageFromClientSide': function (responseMessage) {
      Meteor.functions.responseMessage(responseMessage);
    },
    'userMessage': function (userMessage) {
      Meteor.functions.userMessage(userMessage);
    },
    //Delete old messages
    'deleteOldMessages': function () {
      News.remove({archived: "true"}, {multi: true});
    }
  });

  Meteor.setTimeout(function(){
    Meteor.functions.responseMessage("Eyh ! Seems to be a long time you are here, are you enjoying ? Leave your email and save your preferences...");
  }, 120000);


  // Welcome Message
  if ( News.find().count() === 0 ) {
      Meteor.call('morningMessage');
  };


});
