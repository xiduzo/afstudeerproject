(function() {
  "use strict";

  angular
    .module("cmd.constants", [])

    .constant("DEBUG_ENABLED", true)

    .constant(
      "LDAP_LOGIN_API",
      "https://oege.ie.hva.nl/~vddxx/ldapper/index.php"
    )
    // .constant("REST_API_URL", "http://127.0.0.1:8000/api/")
    .constant("REST_API_URL", "https://back.beyond.jstur.org/api/")

    .constant("CREDENTIAL_USER", "bigd")
    .constant("CREDENTIAL_PASS", "aapnootbier")

    .constant("TRELLO_KEY", "85ea9af753540fb15c161d5eedd67a49")
    .constant(
      "TRELLO_SECRET",
      "92b46d2d43997521d21894e6f88b843ddae5d903163d813356cfa7b376a85e2b"
    )

    .constant("STUDENT_ACCESS_LEVEL", 1)
    .constant("LECTURER_ACCESS_LEVEL", 2)
    .constant("COORDINATOR_ACCESS_LEVEL", 3)

    .constant("MAX_STAR_RATING", 4)

    .constant("HTTP_STATUS", {
      SUCCESS: 200,
      CREATED: 201,
      ACCEPTED: 202,
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      THROTTLED: 429,
      INTERNAL_SERVER_ERROR: 500,
      BAD_GATEWAY: 502,
      SERICE_UNAVIALABLE: 503,
      GATEWAY_TIMEOUT: 504
    })

    .constant("COLORS", [
      // CMD colors first
      "#FFCC00",
      "#00AD68",
      "#EB5D56",
      "#595959",

      // Other sexy colors next
      "#00BCD4",
      "#3F51B5",
      "#8BC34A",
      "#f44336",
      "#FFEB3B",
      "#03A9F4",

      // And some backup colors when things are getting crazy
      "#FF9800",
      "#673AB7",
      "#4CAF50",
      "#795548",
      "#9C27B0",
      "#9E9E9E",
      "#607D8B",
      "#FFC107",
      "#009688",
      "#2196F3",
      "#FF5722",
      "#E91E63"
    ]); // End of constants
})();
