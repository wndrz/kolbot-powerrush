// PowerRush common config
// place in libs/PowerRush.js
// requires libs/bots/PowerRusher.js and libs/bots/PowerRushee.js

// Instructions:
//  Rushee leader uses Lead entry, rest use Follow
//  Rusher config: Scripts.PowerRusher=true, Config.PublicMode=2, Config.Leader="", possibly disable pickit/lock inventory
//  Rushee leader: Scripts.PowerRushee=true, Config.PublicMode=1, Config.LifeChicken=0, disable pickit
//  Other rushees: Scripts.PowerRushee=true, Config.PublicMode=2, Config.Leader="", Config.LifeChicken=0, disable pickit
// Start rushee leader/other rushee profiles. Start rusher profile if AutoRusher is not enabled (or start it anyway to save a few seconds).
// For bird quest, rusher must not have completed it

var PowerRush = {
  Rushers: ["Rivvy", "Najka", "rivhammer"], // array of valid rusher names, case sensitive
  RusheeCount: 3, // number of rushees to wait for
  RusheeLeader: "RushLeader", // profile of the player that will do the quests, case sensitive
  Bumper: null, // bumper name; null for wsk walk
  RushMode: "fullwps", // quick, full, wps, fullwps
  SwitchDifficulty: true, // Restart rushee profiles at the end of act 5 to skip the Congratulations and unbug the difficulty button
                          // Make sure to set leader profile difficulty to "Highest"

  AutoRusher: [
    // automatically switch rusher profiles based on difficulty and quest
    // add lines of [diff, quest, name], which indicate that profile 'name' will be started for the specified quest
    // e.g.
    // [0, "andariel", "RusherSorc"],
    // [2, "travincal", "RusherPala"]
    [0, "andariel", "RusherSorc"],
    [2, "travincal", "RusherPala"],
  ],

  Phrases: { // custom phrases
    GoldDrop: "Dropped gold, buy TP tome",

    WaypointEnter: "Waypoint up",
    WaypointLeave: "Go back to town and wait for next",
    WaypointFinish: "Waypoints done",

    AndarielEnter: "Come for Andariel",
    AndarielLeave: "Go to act 2",

    RadamentEnter: "Come for Radament",
    RadamentLeave: "Radament dead",
    RadamentBookEnter: "Come for Book of Skill",
    RadamentBookLeave: "Go back to town",

    CubeEnter: "Come for cube",
    CubeLeave: "Grab cube and go back to town",

    AmuletEnter: "Come for amulet",
    AmuletLeave: "Go back to town and talk to Drognan",

    StaffEnter: "Come for staff",
    StaffLeave: "Go back to town and complete the staff",

    SummonerEnter: "Come for summoner",
    SummonerLeave: "Summoner dead",

    DurielEnter: "Come place staff and go back to town",
    DurielDead: "Come talk to Tyrael",
    JerhynPortal: "Use Harem TP to talk to Jerhyn and go to act 3",

    TomeEnter: "Come for tome",
    TomeLeave: "Grab tome and go back to town",

    BirdDrop: "Jade figurine dropped in town",
    BirdStart: "Starting golden bird",
    BirdEnd: "Get your potion from Alkor",

    TravincalEnter: "Come for Travincal council",
    TravincalLeave: "Go back to town and talk to Cain",

    MephistoEnter: "Come for Mephisto",
    MephistoLeave: "Go to act 4",

    IzualEnter: "Come for Izual",
    IzualLeave: "Izual dead",

    DiabloEnter: "Come for Diablo",
    DiabloLeave: "Diablo dead",

    ShenkEnter: "Come for Shenk",
    ShenkLeave: "Shenk dead",

    AnyaEnter: "Get potion from Malah and come free Anya",
    AnyaLeave: "Free Anya and go back to town to get your scroll",

    AncientsEnter: "Come for Ancients",
    AncientsLeave: "Ancients completed",

    BaalClearing: "No bumpers detected, clearing path to Baal",
    BaalClear: "Path is clear",
    BaalReady: "Get ready for Baal",
    BaalEnter: "Come for Baal",
    BaalLeave: "Baal dead",

    End: "Rush complete"
  },

  // DO NOT EDIT BELOW THIS LINE

  rushLists: {
    // bird has to be placed at the end so rusher can leave to avoid completing the quest
    // waypoints should be placed at a point when all waypoints are accessible (except halls of pain and wsk)
    // waypoints should not be placed at the beginning of an act or the rusher might get stuck
    "quick":   ["andariel",
                "cube", "amulet", "staff", "summoner", "duriel", "jerhyn",
                "travincal", "mephisto",
                "diablo",
                "ancients", "baal"],
    "full":    ["andariel",
                "radament", "cube", "amulet", "staff", "summoner", "duriel", "jerhyn",
                "tome", "travincal", "mephisto",
                "izual", "diablo",
                "shenk", "anya", "ancients", "baal", "bird"],
    "wps":     ["a1wps", "a2wps", "a3wps", "a4wps", "a5wps"],
    "fullwps": ["andariel",
                "radament", "cube", "amulet", "staff", "summoner", "duriel", "jerhyn",
                "tome", "travincal", "mephisto",
                "izual", "diablo",
                "shenk", "anya",
                "a1wps", "a2wps", "a3wps", "a4wps", "a5wps",
                "ancients", "baal", "bird"],
  },

  difficulties: ["Normal", "Nightmare", "Hell"],
  towns: [1, 40, 75, 103, 109],
  questAct: {
    "den": 1,
    "andariel": 1,
    "a1wps": 1,

    "radament": 2,
    "cube": 2,
    "amulet": 2,
    "staff": 2,
    "summoner": 2,
    "duriel": 2,
    "jerhyn": 2,
    "a2wps": 2,

    "tome": 3,
    "bird": 3,
    "travincal": 3,
    "mephisto": 3,
    "a3wps": 3,

    "izual": 4,
    "diablo": 4,
    "a4wps": 4,

    "shenk": 5,
    "anya": 5,
    "ancients": 5,
    "baal": 5,
    "a5wps": 5,
  },

  actWaypoints: [[],
    [3, 4, 5, 6, 27, 29, 32, 35],
    [48, 42, 57, 43, 44, 52, 74, 46],
    [76, 77, 78, 79, 80, 81, 83, 101],
    [106, 107],
    [111, 112, 113, 115, 117, 118],
  ],

  getRusher: function() {
    var party = getParty();
    if (!party) return null;
    do {
      if (this.Rushers.indexOf(party.name) >= 0)
        return party.name;
    } while (party.getNext());
    return null;
  },
  checkParty: function(name) {
    var party = getParty();
    if (!party) return false;
    do {
      if (party.name == name)
        return true;
    } while (party.getNext());
    return false;
  },
  leaderName: null,
  questList: null,
  questQueue: null,
  needGold: 0,
  birdDropped: false,
  finished: false,
  buffer: [],
  onMsg: function(nick, msg) {
    if (!this.leaderName || nick == this.leaderName || this.Rushers.indexOf(nick) >= 0) {
      if (!this.questQueue) {
        var m = msg.match(/start ([a-z0-9]+) ([0-9]+)/);
        if (!m) m = msg.match(/start ([a-z0-9]+)/);
        if (m) {
          this.leaderName = nick;
          this.questQueue = this.questList;
          while (this.questQueue.length && this.questQueue[0] != m[1])
            this.questQueue.shift();
          if (m.length > 2)
            this.needGold = Number(m[2]);
        }
      } else if (msg == this.Phrases.BirdDrop) {
        this.birdDropped = true;
      } else if (msg == this.Phrases.End) {
        this.finished = true;
      } else {
        this.buffer.push(msg);
      }
    }
  },
  waitForChat: function(text, end) {
    var tick = getTickCount();
    var timeout = false;
    var terminate = false;
    if (typeof(end) == "number") timeout = end;
    else if (typeof(end) == "string") terminate = end;
    while (!timeout || getTickCount() - tick < timeout) {
      if (this.finished || (this.rusheeLeader && !this.checkParty(this.rusheeLeader)))
        return false;
      while (this.buffer.length) {
        var msg = this.buffer.shift();
        if (msg === text) return true;
        if (msg === terminate) return false;
      }
      delay(500);
    }
    return false;
  },
  rusheeCount: function() {
    var party = getParty();
    if (!party) return 0;
    var count = 0;
    do {
      if (this.Rushers.indexOf(party.name) < 0)
        count++;
    } while (party.getNext());
    return count;
  },
  removeQuest: function(name) {
    var pos = this.questList.indexOf(name);
    if (pos >= 0) this.questList.splice(pos, 1);
  },
  getRusherIndex: function(diff, quest) {
    if (!this.AutoRusher.length) return null;
    var pos = this.AutoRusher.length - 1;
    var questid = this.questList.indexOf(quest);
    while (pos > 0) {
      if (this.AutoRusher[pos][0] < diff)
        break;
      if (this.AutoRusher[pos][0] == diff &&
          this.questList.indexOf(this.AutoRusher[pos][1]) <= questid)
        break;
      pos--;
    }
    return pos;
  },
  rusherIndex: null,
  init: function() {
    this.questList = (this.rushLists[this.RushMode] || []);
    if (me.diff != 0) {
      this.removeQuest("cube");
    }
    if (me.diff == 2) {
      this.removeQuest("ancients");
      this.removeQuest("baal");
    }
    if (me.gametype == 0) {
      this.removeQuest("shenk");
      this.removeQuest("anya");
      this.removeQuest("ancients");
      this.removeQuest("baal");
    }
    if (me.profile == this.RusheeLeader) {
      this.resetQuests();
      if (this.questQueue.length && this.AutoRusher.length) {
        this.rusherIndex = this.getRusherIndex(me.diff, this.questQueue[0]);
        D2Bot.start(this.AutoRusher[this.rusherIndex][2]);
      }
    }
    addEventListener("chatmsg", function(nick, msg) {PowerRush.onMsg(nick, msg);});
    while (this.rusheeCount() < this.RusheeCount || !this.getRusher()) {
      me.overhead("Waiting for players to join");
      delay(500);
    }
    var party = getParty();
    if (party) {
      do {
        while (party.name != me.name && !party.area) {
          me.overhead("Waiting for party info");
          delay(500);
        }
      } while (party.getNext());
    }
    if (!this.checkParty(this.Bumper))
      this.Bumper = null;
  },

};
