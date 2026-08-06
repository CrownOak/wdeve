/* BONK INTEL — the canonical ship role table.
   ONE table, one truth. The grid lens and the fight reader both classify hulls,
   and two copies would drift the day someone tunes one of them. Loaded by every
   page that mounts either module, before the modules themselves.

   Classification is by SDE ship GROUP name, not by hull, so a new ship released
   into an existing group is classified correctly the day it ships. */
(function () {
  if (window.BONKROLES) return;

  var ROLES = [
    [/Interceptor|Interdictor|Heavy Interdiction/i, "TACKLE"],
    [/Logistics|Force Auxiliary/i, "LOGI"],
    [/Recon Ship|Electronic Attack|Black Ops|Covert Ops|Stealth Bomber/i, "EWAR"],
    [/Carrier|Dreadnought|Titan|Supercarrier|Capital Industrial|Lancer/i, "CAPITAL"],
    [/Mining Barge|Exhumer|Hauler|Freighter|Capsule|Shuttle|Corvette|Expedition Frigate|Industrial|Deep Space Transport|Blockade Runner/i, "SOFT"],
    [/Mobile |Structure|Citadel|Engineering|Refinery/i, "STRUCTURE"]
  ];

  /* Anything that is a real warship and matches nothing above is DPS. That default
     is deliberate: an unknown combat hull should read as a threat, never as nothing. */
  window.BONKROLES = {
    table: ROLES,
    of: function (groupName) {
      if (!groupName) return "DPS";
      for (var i = 0; i < ROLES.length; i++) if (ROLES[i][0].test(groupName)) return ROLES[i][1];
      return "DPS";
    },
    /* the counter read, shared so the grid lens and a fight report never disagree
       about what a composition does to you. Every line names the number it came from. */
    counters: function (r, total) {
      var out = [];
      if (r.CAPITAL) out.push(r.CAPITAL + " capital" + (r.CAPITAL === 1 ? "" : "s") + " on field. If you meet this, you are not fighting it with a fleet this size.");
      if (r.LOGI >= 3) out.push(r.LOGI + " logi. Nothing dies until the reps break.");
      else if (r.LOGI) out.push(r.LOGI + " logi. Alpha it or accept a long fight.");
      if (r.TACKLE >= 3 && r.DPS >= 10) out.push("They can hold a fleet down. Anything slow that lands here does not leave.");
      else if (r.TACKLE >= 2) out.push(r.TACKLE + " tackle. Do not orbit anything you cannot leave.");
      if (r.EWAR >= 2) out.push(r.EWAR + " EWAR. Expect to be jammed at the worst moment.");
      if (total && r.SOFT === total) out.push("Nothing here can hurt you.");
      return out;
    }
  };
})();
