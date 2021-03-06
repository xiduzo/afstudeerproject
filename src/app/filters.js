(function() {
  "use strict";

  angular
    .module("filters", [])

    .filter("fullUserName", function() {
      return function(user) {
        if (user.surname_prefix) {
          return (
            user.first_name + " " + user.surname_prefix + " " + user.surname
          );
        } else {
          return user.first_name + " " + user.surname;
        }
      };
    })

    .filter("fromNow", function() {
      return function(datetime, suffix) {
        return moment(datetime).fromNow();
      };
    })

    .filter("positiveInteger", function() {
      return function(number) {
        return number < 0 ? 0 : number;
      };
    })

    .filter("empasizeSubject", function() {
      return function(sentence, subject) {
        return sentence.replace(subject, "<strong>" + subject + "</strong>");
      };
    })

    .filter("hexToRgba", function() {
      return function(hex, opacity) {
        hex = hex.replace("#", "");
        return (
          "rgba(" +
          parseInt(hex.substring(0, 2), 16) +
          "," +
          parseInt(hex.substring(2, 4), 16) +
          "," +
          parseInt(hex.substring(4, 6), 16) +
          "," +
          opacity / 100 +
          ")"
        );
      };
    })

    .filter("roundUp5", function() {
      return function(number) {
        return number % 5 ? number - (number % 5) + 5 : number;
      };
    })

    .filter("momentDate", function() {
      return function(date, format) {
        return moment(date).format(format);
      };
    })

    .filter("daysToGo", function() {
      return function(date) {
        var end = moment(date);
        var today = moment().startOf("day");
        return Math.round(moment.duration(end - today).asDays());
      };
    })

    .filter("hoursToGo", function() {
      return function(date) {
        var end = moment(date);
        var today = moment();
        return Math.round(moment.duration(end - today).asHours());
      };
    })

    .filter("secondsToGo", function() {
      return function(date) {
        var end = moment(date);
        var today = moment();
        return Math.round(moment.duration(end - today).asSeconds());
      };
    })

    .filter("cardsDueThisWeek", function() {
      return function(cards, week) {
        return _.filter(cards, function(card) {
          if (card.due) {
            if (
              moment(card.due).isBetween(
                moment(week.start),
                moment(week.end),
                "day"
              ) ||
              moment(card.due).isSame(moment(week.start), "day") ||
              moment(card.due).isSame(moment(week.end), "day")
            ) {
              return card;
            }
          }
        });
      };
    }); // End of filters
})();
