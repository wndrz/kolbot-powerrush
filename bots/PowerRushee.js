/**
* @filename PowerRushee.js
* @author   riv
* @desc     Rushee script that works with PowerRusher
*/

include("PowerRush.js");

PowerRush.rushee = function() {
  this.grabItem = function(id, chestid) {
    if (me.getItem(id)) return true;
    if (chestid) {
      var chest = getUnit(2, chestid);
      if (chest) Misc.openChest(chest);
    }
    for (var i = 0; i < 12; i++) {
      var item = getUnit(4, id, 3);
      if (item && Pickit.pickItem(item) && (id == 523 || me.getItem(id)))
        return true;
      delay(500);
    }
    return false;
  };
  this.talkTo = function(npc, townloc, menuid) {
    var unit = getUnit(1, npc);
    if (!unit) {
      if (!Town.move(townloc || npc))
        return false;
      unit = getUnit(1, npc);
    }
    if (!unit || !unit.openMenu())
      return false;
    if (menuid)
      return Misc.useMenu(menuid);
    me.cancel();
    return true;
  };
  this.useItem = function(id) {
    var item = me.getItem(id);
    if (!item) return false;
    clickItem(1, item);
    return true;
  };
  this.toTown = function(act) {
    if (me.mode == 17) {
      me.revive();
      while (!me.inTown)
        delay(500);
    }

    if (!act) act = me.act;
    if (!Pather.accessToAct(act)) {
      throw new Error("No access to act " + act);
    }

    var town = this.towns[act - 1];
    if (me.area != town) {
      if (!Pather.usePortal(town, null) && !Town.goToTown(act))
        return false;
    }
    return true;
  };

  this.myWaypoints = null;
  this.openWaypoint = function() {
    var wp = getUnit(2, "waypoint");
    if (!wp) return false;
    if (getDistance(me, wp) > 5)
      Pather.moveToUnit(wp);
    Misc.click(0, 0, wp);
    var tick = getTickCount();
    while (getTickCount() - tick < Math.max(2000, me.ping * 2)) {
      if (getUIFlag(0x14))
        return true;
      delay(10);
    }
    return false;
  };
  this.getWaypoints = function() {
    var list = [];
    if (!this.toTown() || !Town.move("waypoint"))
      return list;
    if (this.openWaypoint()) {
      for (var i = 0; i < Pather.wpAreas.length; i++) {
        if (getWaypoint(i))
          list.push(Pather.wpAreas[i]);
      }
      me.cancel();
    }
    return list;
  };
  this.checkWaypoints = function(list) {
    if (!this.myWaypoints)
      this.myWaypoints = new Set(this.getWaypoints());
    for (var i = 0; i < list.length; i++)
      if (!this.myWaypoints.has(list[i]))
        return false;
    return true;
  };
  this.checkQuest = function(quest) {
    switch (quest) {
    case "den":       return !!me.getQuest(1, 0);
    case "andariel":  return !!me.getQuest(7, 0);

    case "radament":  return !!(me.getQuest(9, 0) || me.getQuest(9, 1)); // ?
    case "cube":      return !!me.getItem(549);
    case "amulet":    return !!(me.getQuest(14, 0) || me.getQuest(14, 3) || me.getItem(521));
    case "staff":     return !!(me.getQuest(14, 0) || me.getQuest(14, 3) || me.getItem(92));
    case "summoner":  return !!me.getQuest(13, 0);
    case "duriel":    return !!(me.getQuest(14, 0) || me.getQuest(14, 3));
    case "jerhyn":    return !!me.getQuest(15, 0);

    case "tome":      return !!me.getQuest(17, 0);
    case "travincal": return !!me.getQuest(21, 0);
    case "mephisto":  return !!me.getQuest(23, 0);

    case "izual":     return !!me.getQuest(25, 0);
    case "diablo":    return !!me.getQuest(28, 0);

    case "shenk":     return !!(me.getQuest(35, 0) || me.getQuest(35, 1));
    case "anya":      return !!(me.getQuest(37, 0) || me.getQuest(37, 1));
    case "ancients":  return !!(me.getQuest(40, 0) || me.getQuest(39, 0)); // kinda pointless
    case "baal":      return !!me.getQuest(40, 0);

    case "bird":      return !!me.getQuest(20, 0);

    case "a1wps":     return this.checkWaypoints(this.actWaypoints[1]);
    case "a2wps":     return this.checkWaypoints(this.actWaypoints[2]);
    case "a3wps":     return this.checkWaypoints(this.actWaypoints[3]);
    case "a4wps":     return this.checkWaypoints(this.actWaypoints[4]);
    case "a5wps":     return this.checkWaypoints(this.actWaypoints[5]);

    default:          return true;
    }
  };
  this.resetQuests = function() {
    this.questQueue = this.questList;
    this.myWaypoints = null;
    while (this.questQueue.length && this.checkQuest(this.questQueue[0]))
      this.questQueue.shift();
  };

  this.takeWaypoints = function() {
    Town.move("portalspot");
    while (this.waitForChat(this.Phrases.WaypointEnter, this.Phrases.WaypointFinish)) {
      if (!Pather.usePortal(null, this.rusher))
        throw new Error("Failed to take rusher's portal");
      delay(500);
      if (this.openWaypoint())
        me.cancel();
      this.waitForChat(this.Phrases.WaypointLeave);
      if (!this.toTown())
        throw new Error("Failed to return to town");
    }
    return true;
  };

  // ACT I

  this.den = function() {
    // NYI
    return true;
  };

  this.andariel = function() {
    if (this.leader) {
      Town.move("portalspot");
      this.waitForChat(this.Phrases.AndarielEnter);
      if (!Pather.usePortal(null, this.rusher))
        throw new Error("Failed to take rusher's portal");
      this.waitForChat(this.Phrases.AndarielLeave);
      if (!this.toTown())
        throw new Error("Failed to return to town");
      delay(1000);
    } else {
      this.waitForChat(this.Phrases.AndarielLeave);
    }
    return this.talkTo("warriv", "warriv", 0x0D36);
  };

  this.a1wps = this.takeWaypoints;

  // ACT II

  this.radament = function() {
    Town.move("portalspot");
    if (this.leader) {
      this.waitForChat(this.Phrases.RadamentEnter);
      if (!Pather.usePortal(null, this.rusher))
        throw new Error("Failed to take rusher's portal");
      this.waitForChat(this.Phrases.RadamentLeave);
      if (!this.toTown())
        throw new Error("Failed to return to town");
    }
    this.waitForChat(this.Phrases.RadamentBookEnter);
    if (!Pather.usePortal(null, this.rusher))
      throw new Error("Failed to take rusher's portal");
    if (!this.grabItem(552) || !this.useItem(552))
      D2Bot.printToConsole("Error in radament: failed to read Book of Skill");
    this.waitForChat(this.Phrases.RadamentBookLeave);
    if (!this.toTown())
      throw new Error("Failed to return to town");
    if (this.leader)
      this.talkTo("atma");
    return true;
  };

  this.cube = function() {
    Town.move("portalspot");
    this.waitForChat(this.Phrases.CubeEnter);
    if (!Pather.usePortal(null, this.rusher))
      throw new Error("Failed to take rusher's portal");
    this.grabItem(549, 354);
    this.waitForChat(this.Phrases.CubeLeave);
    if (!this.toTown())
      throw new Error("Failed to return to town");
    return true;
  };

  this.amulet = function() {
    if (this.leader) {
      Town.move("portalspot");
      this.waitForChat(this.Phrases.AmuletEnter);
      if (!Pather.usePortal(null, this.rusher))
        throw new Error("Failed to take rusher's portal");
      this.grabItem(521, 149);
      this.waitForChat(this.Phrases.AmuletLeave);
      if (!this.toTown())
        throw new Error("Failed to return to town");
      delay(500);
      return this.talkTo(NPC.Drognan);
    } else {
      Town.move("cain");
      return this.waitForChat(this.Phrases.AmuletLeave);
    }
  };

  this.staff = function() {
    if (this.leader) {
      Town.move("portalspot");
      this.waitForChat(this.Phrases.StaffEnter);
      if (!Pather.usePortal(null, this.rusher))
        throw new Error("Failed to take rusher's portal");
      this.grabItem(92, 356);
      this.waitForChat(this.Phrases.StaffLeave);
      if (!this.toTown())
        throw new Error("Failed to return to town");
      delay(1000);
      
      var staff = me.getItem(92),
          amulet = me.getItem(521);
      if (!staff)
        throw new Error("Staff shaft not found");
      if (!amulet)
        throw new Error("Amulet not found");
      Storage.Cube.MoveTo(amulet);
      Storage.Cube.MoveTo(staff);
      Cubing.openCube();
      transmute();
      delay(750 + me.ping);
      Cubing.emptyCube();
      me.cancel();
      if (!me.getItem(91))
        throw new Error("Failed to cube staff");
      return true;
    } else {
      Town.move("cain");
      return this.waitForChat(this.Phrases.StaffLeave);
    }
  };

  this.summoner = function() {
    if (this.leader) {
      Town.move("portalspot");
      this.waitForChat(this.Phrases.SummonerEnter);
      if (!Pather.usePortal(null, this.rusher))
        throw new Error("Failed to take rusher's portal");
      this.waitForChat(this.Phrases.SummonerLeave);
      if (!this.toTown())
        throw new Error("Failed to return to town");
      delay(1000);
    } else {
      this.waitForChat(this.Phrases.SummonerLeave);
    }
    return this.talkTo(NPC.Cain, "cain");
  };

  this.duriel = function() {
    Town.move("portalspot");
    if (this.leader) {
      this.waitForChat(this.Phrases.DurielEnter);
      while (true) {
        if (!Pather.usePortal(null, this.rusher))
          throw new Error("Failed to take rusher's portal");
        var staff = me.getItem(91);
        var orifice = getUnit(2, 152);
        if (!staff)
          throw new Error("Staff not found");
        if (!orifice)
          throw new Error("Orifice not found");
        if (Misc.openChest(orifice) && staff.toCursor() && submitItem())
          break;
        if (me.mode == 17) {
          D2Bot.printToConsole("Died while opening Duriel's chamber, trying again");
          me.revive();
          while (!me.inTown)
            delay(500);
          Town.move("portalspot");
        } else {
          throw new Error("Failed to open Duriel's chamber");
        }
      }
      delay(750 + me.ping);
      if (!this.toTown())
        throw new Error("Failed to return to town");

      this.waitForChat(this.Phrases.DurielDead);
      if (!Pather.usePortal(null, this.rusher))
        throw new Error("Failed to take rusher's portal");
      delay(1000);
      var npc = getUnit(1, "tyrael");
      for (var i = 0; i < 3; i++) {
        if (getDistance(me, npc) > 3) {
          Pather.moveToUnit(npc);
        }
        npc.interact();
        delay(1000 + me.ping);
        me.cancel();
        if (Pather.getPortal(null)) {
          me.cancel();
          break;
        }
      }
      if (!this.toTown())
        throw new Error("Failed to return to town");
      return true;
    } else {
      return this.waitForChat(this.Phrases.DurielDead);
    }
  };
  this.jerhyn = function() {
    Town.move("portalspot");
    this.waitForChat(this.Phrases.JerhynPortal);
    if (!Pather.usePortal(null, this.rusher))
      throw new Error("Failed to take rusher's portal");
    Pather.moveToExit(40, true);
    this.talkTo("jerhyn", "palace");
    Pather.moveToExit(50, true);
    if (!this.toTown())
      throw new Error("Failed to return to town");
    return this.talkTo("meshif", "meshif", 0x0D38);
  };

  this.a2wps = this.takeWaypoints;

  // ACT III

  this.tome = function() {
    if (this.leader) {
      Town.move("portalspot");
      this.waitForChat(this.Phrases.TomeEnter);
      if (!Pather.usePortal(null, this.rusher))
        throw new Error("Failed to take rusher's portal");
      this.grabItem(548, 193);
      this.waitForChat(this.Phrases.TomeLeave);
      if (!this.toTown())
        throw new Error("Failed to return to town");
      delay(500);
      return this.talkTo(NPC.Alkor);
    } else {
      Town.move("cain");
      return this.waitForChat(this.Phrases.TomeLeave);
    }
  };

  this.bird = function() {
    if (this.leader) {
      if (!me.getQuest(20, 0) && me.getItem(546)) {
        say(this.Phrases.BirdStart);
        if (this.talkTo("meshif") && this.talkTo(NPC.Alkor)) {
          say(this.Phrases.BirdEnd);
          this.useItem(545);
        }
      }
      say(this.Phrases.End);
    } else {
      if (this.waitForChat(this.Phrases.BirdStart)) {
        Town.goToTown(3);
        Pather.move(5083, 5008);
        if (this.waitForChat(this.Phrases.BirdEnd)) {
          this.talkTo(NPC.Alkor);
          this.useItem(545);
        }
      }
    }
    return true;
  };

  this.travincal = function() {
    if (this.leader) {
      Town.move("portalspot");
      this.waitForChat(this.Phrases.TravincalEnter);
      if (this.birdDropped)
        this.grabItem(546);
      if (!Pather.usePortal(null, this.rusher))
        throw new Error("Failed to take rusher's portal");
      this.waitForChat(this.Phrases.TravincalLeave);
      if (!this.toTown())
        throw new Error("Failed to return to town");
    } else {
      this.waitForChat(this.Phrases.TravincalLeave);
    }
    return this.talkTo(NPC.Cain, "cain");
  };

  this.mephisto = function() {
    Town.move("portalspot");
    if (this.leader) {
      this.waitForChat(this.Phrases.MephistoEnter);
      if (this.birdDropped)
        this.grabItem(546);
      if (!Pather.usePortal(null, this.rusher))
        throw new Error("Failed to take rusher's portal");
    }
    this.waitForChat(this.Phrases.MephistoLeave);
    if (!this.leader)
      Pather.usePortal(null, this.rusher);
    for (var i = 0; i < 10 && me.area != 103; i++) {
      if (me.mode == 17) {
        me.revive();
        while (!me.inTown)
          delay(500);
        Town.move("portalspot");
        Pather.usePortal(null, this.rusher);
      }
      delay(250);
      Pather.usePortal(null);
      delay(250);
    }
    return me.area == 103;
  };

  this.a3wps = this.takeWaypoints;

  // ACT IV

  this.izual = function() {
    if (this.leader) {
      Town.move("portalspot");
      this.waitForChat(this.Phrases.IzualEnter);
      if (!Pather.usePortal(null, this.rusher))
        throw new Error("Failed to take rusher's portal");
      this.waitForChat(this.Phrases.IzualLeave);
      if (!this.toTown())
        throw new Error("Failed to return to town");
      delay(500);
    } else {
      Town.move(NPC.Tyrael);
      this.waitForChat(this.Phrases.IzualLeave);
    }
    return this.talkTo(NPC.Tyrael);
  };

  this.diablo = function() {
    if (this.leader) {
      Town.move("portalspot");
      this.waitForChat(this.Phrases.DiabloEnter);
      if (!Pather.usePortal(null, this.rusher))
        throw new Error("Failed to take rusher's portal");
      this.waitForChat(this.Phrases.DiabloLeave);
      if (!this.toTown())
        throw new Error("Failed to return to town");
      delay(500);
    } else {
      Town.move(NPC.Tyrael);
      this.waitForChat(this.Phrases.DiabloLeave);
    }
    this.talkTo(NPC.Tyrael);
    delay(me.ping + 250);
    if (getUnit(2, 566) && Pather.useUnit(2, 566, 109))
      return true;
    return this.talkTo(NPC.Tyrael, NPC.Tyrael, 0x58D2);
  };

  this.a4wps = this.takeWaypoints;

  // ACT V

  this.shenk = function() {
    if (this.leader) {
      Town.move("portalspot");
      this.waitForChat(this.Phrases.ShenkEnter);
      if (!Pather.usePortal(null, this.rusher))
        throw new Error("Failed to take rusher's portal");
      this.waitForChat(this.Phrases.ShenkLeave);
      if (!this.toTown())
        throw new Error("Failed to return to town");
      delay(500);
    } else {
      Town.move(NPC.Larzuk);
      this.waitForChat(this.Phrases.ShenkLeave);
    }
    return this.talkTo(NPC.Larzuk);
  };

  this.anya = function() {
    Town.move(NPC.Malah);
    if (this.leader) {
      this.waitForChat(this.Phrases.AnyaEnter);
      if (!this.talkTo(NPC.Malah))
        throw new Error("Failed to talk to Malah");
      if (!Pather.usePortal(null, this.rusher))
        throw new Error("Failed to take rusher's portal");
      delay(250);
      var anya = getUnit(2, 558);
      if (!Pather.moveToUnit(anya) || !anya.interact())
        throw new Error("Failed to talk to Anya");
      this.waitForChat(this.Phrases.AnyaLeave);
      me.cancel();
      if (!this.toTown())
        throw new Error("Failed to return to town");
      delay(500);
    } else {
      this.waitForChat(this.Phrases.AnyaLeave);
    }
    this.talkTo(NPC.Malah);
    return this.useItem(646);
  };

  this.ancients = function() {
    if (this.leader) {
      Town.move("portalspot");
      this.waitForChat(this.Phrases.AncientsEnter);
      if (!Pather.usePortal(null, this.rusher))
        throw new Error("Failed to take rusher's portal");
      this.waitForChat(this.Phrases.AncientsLeave);
      if (this.Bumper)
        return this.toTown();
      if (me.mode == 17) {
        me.revive();
        while (!me.inTown)
          delay(500);
        Town.move("portalspot");
        return Pather.usePortal(null, this.rusher);
      }
    }
    return true;
  };

  this.baal = function() {
    if (me.name === this.Bumper) {
      Town.move("portalspot");
      this.waitForChat(this.Phrases.BaalEnter);
      if (!Pather.usePortal(null, this.rusher))
        throw new Error("Failed to take rusher's portal");
      this.waitForChat(this.Phrases.BaalLeave);
      return this.toTown();
    } else if (this.leader && !this.Bumper) {
      if (me.area != 120 && !Pather.usePortal(120, null))
        throw new Error("Failed to go to Arreat Summit");
      this.waitForChat(this.Phrases.BaalClear);
      if (!Pather.moveToExit(128, true))
        return false;
      while (true) {
        Pather.makePortal();
        if (me.area < 131) {
          if (Pather.moveToExit(me.area + 1, true))
            continue;
        } else {
          if (Pather.moveTo(15115, 5050))
            break;
        }
        if (me.mode == 17) {
          say("help " + me.area);
          this.waitForChat(this.Phrases.BaalClear);
          D2Bot.printToConsole ("Died in " + getArea().name + ", trying again");
          me.revive();
          while (!me.inTown)
            delay(500);
          Town.move("portalspot");
          if (!Pather.usePortal(null, me.name))
            throw new Error("Failed to take portal");
        }
      }
      Pather.makePortal();
      this.waitForChat(this.Phrases.BaalReady);
      if (me.mode == 17) {
        me.revive();
        while (!me.inTown)
          delay(500);
        Town.move("portalspot");
        if (!Pather.usePortal(null, me.name))
          throw new Error("Failed to take portal");
      }
      Pather.moveTo(15092, 5011);
      this.waitForChat(this.Phrases.BaalEnter);
      var portal = getUnit(2, 563);
      if (!portal || !Pather.usePortal(null, null, portal))
        throw new Error("Couldn't take portal to Baal.");
      this.waitForChat(this.Phrases.BaalLeave);
      return this.toTown();
    } else {
      return this.waitForChat(this.Phrases.BaalLeave);
    }
  };

  this.a5wps = this.takeWaypoints;

  // core

  var startTime = getTickCount();

  this.init();

  this.leader = (me.profile == this.RusheeLeader);
  this.rusher = this.getRusher();

  if (this.leader) {
    D2Bot.printToConsole("Starting " + this.difficulties[me.diff] + " rush");

    if (!this.Bumper && this.questList.indexOf("baal") >= 0) {
      var tptome = me.findItem(518, 0, 3);
      if (!tptome) {
        this.needGold = 2200;
      } else if (tptome.getStat(70) < 13) {
        this.needGold = (20 - tptome.getStat(70)) * 100;
      }
    }

    var quest = (this.questQueue.length ? this.questQueue[0] : "end");

    if (this.needGold)
      say("start " + quest + " " + this.needGold);
    else
      say("start " + quest);
  } else {
    while (!this.questQueue && !this.finished) {
      me.overhead("Waiting for leader");
      delay(500);
    }
  }

  while (this.questQueue.length && !this.finished) {
    var quest = this.questQueue.shift();

    if (this.leader) {
      if (this.AutoRusher.length) {
        var nextIndex = this.getRusherIndex(me.diff, quest);
        if (nextIndex != this.rusherIndex) {
          D2Bot.stop(this.AutoRusher[this.rusherIndex][2]);
          this.rusherIndex = nextIndex;
          D2Bot.start(this.AutoRusher[this.rusherIndex][2]);
          while (!this.getRusher() || this.getRusher() == this.rusher)
            delay(500);
        }
      }
      if (this.leader && this.rusher != this.getRusher()) {
        this.resetQuests();
        say("start " + this.questQueue[0]);
      }
    }
    this.rusher = this.getRusher();

    if (this.leader) D2Bot.printToConsole("Starting " + quest);
    me.overhead("Starting " + quest);

    try {
      if (!this.leader || this.Bumper || quest != "baal" || me.area != 120) {
        if (!this.toTown(this.questAct[quest])) {
          throw new Error("Failed to go to town");
        }
      }

      if (this.leader && this.needGold) {
        Town.move("portalspot");
        this.waitForChat(this.Phrases.GoldDrop);
        this.grabItem(523);
        Town.fillTome(518);
        this.needGold = 0;
      }

      if (!this[quest]()) {
        D2Bot.printToConsole("Error executing " + quest);
        this.toTown();
      }
    } catch (err) {
      D2Bot.printToConsole("Error executing " + quest + ": " + err.message);
      this.toTown();
    }
  }

  if (this.leader) {
    var min = Math.floor((getTickCount() - startTime) / 60000).toString();
    while (min.length < 2)
      min = "0" + min;
    var sec = (Math.floor((getTickCount() - startTime) / 1000) % 60).toString();
    while (sec.length < 2)
      sec = "0" + sec;
    D2Bot.printToConsole(this.difficulties[me.diff] + " rush complete (" + min + ":" + sec + ")");
  }

  this.myWaypoints = null;
  var remaining = [];
  for (var i = 0; i < this.questList.length; i++) {
    if (!this.checkQuest(this.questList[i]))
      remaining.push(this.questList[i]);
  }
  if (this.questList.length) {
    D2Bot.printToConsole("Missing " + this.difficulties[me.diff] + " quests: " + remaining.join(", "));
  }

  if (this.SwitchDifficulty) {
    if (me.diff == 2 && !remaining.length) {
      if (this.leader && this.AutoRusher) {
        if (this.rusherIndex)
          D2Bot.stop(this.AutoRusher[this.rusherIndex][2]);
      }
      D2Bot.stop();
    } else if (me.diff < 2 && me.getQuest(me.gametype ? 40 : 26, 0)) {
      if (this.leader && this.AutoRusher) {
        var nextIndex = this.getRusherIndex(me.diff + 1, this.questList[0]);
        if (nextIndex != this.rusherIndex) {
          if (this.rusherIndex)
            D2Bot.stop(this.AutoRusher[this.rusherIndex][2]);
          D2Bot.start(this.AutoRusher[nextIndex][2]);
        }
      }
      D2Bot.restart();
    }
  }

  return true;
}

function PowerRushee() {
  return PowerRush.rushee();
}
