/**
* @filename PowerRusher.js
* @author   riv
* @desc     Rusher script that works with PowerRushee
*/

include("PowerRush.js");

PowerRush.rusher = function() {
  this.makePortal = function() {
    Pather.makePortal();
    delay(250);
  };
  this.useWaypoint = function(area) {
    if (me.area == area || Pather.useWaypoint(area, true))
      return true;
    Town.goToTown();
    return Pather.useWaypoint(area, true);
  };
  this.backToTown = function() {
    if (!Pather.usePortal(this.towns[me.act - 1], null) && !Town.goToTown())
      return false;
    delay(500);
    return true;
  };
  this.playersIn = function(area) {
    if (!area) area = me.area;
    var party = getParty();
    var count = 0;
    if (party) {
      do {
        if (party.name != me.name && party.area == area)
          count++;
      } while (party.getNext());
    }
    return count;
  };
  this.playersInArea = function(area) {
    var party = getParty();
    var count = 0;
    if (party) {
      do {
        if (party.name != me.name && party.area == area)
          count++;
      } while (party.getNext());
    }
    return count;
  };
  this.playersInAct = function(act) {
    if (!act) act = me.act;
    return this.playersInArea(this.towns[act - 1]) == this.rusheeCount();
  };

  this.giveWaypoints = function(list) {
    for (var i = 0; i < list.length; i++) {
      if (!this.useWaypoint(list[i]))
        return false;
      var wp = getUnit(2, "waypoint");
      if (wp && this.makePortal()) {
        say(this.Phrases.WaypointEnter);
        while (this.playersIn() < this.rusheeCount())
          Attack.securePosition(wp.x, wp.y, 15, 250, true);
        say(this.Phrases.WaypointLeave);
        while (this.playersIn())
          delay(250);
      }
    }
    this.useWaypoint(this.towns[me.act - 1]);
    say(this.Phrases.WaypointFinish);
    return true;
  };

  this.moveAway = function(unit, range) {
    var angle = 0;
    if (getDistance(me, unit) > 5)
      angle = Math.atan2(me.y - unit.y, me.x - unit.x);
    var angles = [0, Math.PI * 0.25, -Math.PI * 0.25, Math.PI * 0.5, -Math.PI * 0.5, Math.PI * 0.75, -Math.PI * 0.75, Math.PI];
    for (var i = 0; i < 64; i++) {
      var curAngle = (i < angles.length ? angle + angles[i] : Math.random() * Math.PI * 2);
      var curRange = (i < angles.length * 2 ? range : (Math.random() * 0.5 + 0.75) * range);
      var x = Math.round(Math.cos(curAngle) * curRange + unit.x);
      var y = Math.round(Math.sin(curAngle) * curRange + unit.y);
      try {
        if (!(getCollision(unit.area, x, y) & 0x1)) {
          return Pather.moveTo(x, y);
        }
      } catch (e) {
      }
    }
    return false;
  };
  this.nearbyMonster = function(range) {
    var monster = getUnit(1);
    if (monster) {
      do {
        if (Attack.checkMonster(monster) && getDistance(me, monster) < range)
          return monster;
      } while (monster.getNext());
    }
    return false;
  };
  this.clearAround = function(id, preset, targetDistance, clearRange, clearTime) {
    if (!preset)
      return false;
    var presetPosition = {
      area: me.area,
      x: preset.roomx * 5 + preset.x,
      y: preset.roomy * 5 + preset.y
    };
    this.moveAway(presetPosition, targetDistance);
    var merc = me.getMerc();
    var myPosition = {x: me.x, y: me.y};
    var timer = null;
    var tick = getTickCount();
    while (getTickCount() - tick < 30000) {
      var monster = this.nearbyMonster(clearRange * 0.75);
      if (!monster) {
        if (!timer) timer = getTickCount();
        if (timer && getTickCount() - timer >= clearTime)
          return true;
      } else {
        timer = null;
      }
      var target = getUnit(1, id);
      if (target && (getDistance(me, target) < targetDistance * 0.75 || getDistance(me, target) > targetDistance * 1.25)) {
        this.moveAway(target, targetDistance);
        myPosition = {x: me.x, y: me.y};
      }
      if (!target || getDistance(me, target) > clearRange * 1.5)
        Attack.clear(clearRange);
      if (getDistance(me, myPosition) > 5 || (merc && getDistance(me, merc) > 10))
        Pather.teleportTo(myPosition.x, myPosition.y);
      delay(200);
    }
    var target = getUnit(1, id);
    return target && getDistance(me, target) < targetDistance * 1.25;
  };
  this.waitAndClear = function(id, range) {
    var position = {x: me.x, y: me.y};
    var merc = me.getMerc();
    while (!this.playersIn()) {
      var target = getUnit(1, id);
      if (!target || getDistance(me, target) > range * 1.5)
        Attack.clear(range);
      if (getDistance(me, position) > 5 || (merc && getDistance(me, merc) > 10))
        Pather.teleportTo(position.x, position.y);
      delay(200);
    }
  };

  // ACT I

  this.den = function() {
    // NYI
    return true;
  };

  this.andariel = function() {
    if (!this.useWaypoint(35))
      return false;
    Precast.doPrecast(true);

    if (!Pather.moveToExit([36, 37], true) || !Pather.moveTo(22582, 9612))
      return false;
    this.makePortal();
    Attack.securePosition(me.x, me.y, 40, 3000, true);
    say(this.Phrases.AndarielEnter);
    while (!this.playersIn())
      Attack.securePosition(22582, 9612, 40, 250, true);
    Attack.kill(156);
    say(this.Phrases.AndarielLeave);
    while (this.playersIn())
      delay(250);
    if (!this.backToTown())
      return false;

    Pather.useWaypoint(40, true);
    while (!this.playersInAct(2))
      delay(250);
    return true;
  };

  this.a1wps = function() {
    return this.giveWaypoints(this.actWaypoints[1]);
  };

  // ACT II

  this.radament = function() {
    if (!this.useWaypoint(48))
      return false;
    Precast.doPrecast(true);

    if (!Pather.moveToExit(49, true))
      return false;
    if (!this.clearAround(229, getPresetUnit(49, 2, 355), 30, 10, 2000))
      return false;
    this.makePortal();
    say(this.Phrases.RadamentEnter);
    this.waitAndClear(229, 10);
    Pather.moveToPreset(me.area, 2, 355);
    Attack.kill(229);
    say(this.Phrases.RadamentLeave);

    while (this.playersIn()) {
      var book = getUnit(4, 552, 3);
      if (!book) book = me;
      Attack.securePosition(book.x, book.y, 25, 250, true);
    }
    var book = getUnit(4, 552, 3);
    if (book) Pather.moveToUnit(book);
    this.makePortal();
    var position = {x: me.x, y: me.y};
    say(this.Phrases.RadamentBookEnter);
    while (this.playersIn() < this.rusheeCount())
      Attack.securePosition(position.x, position.y, 25, 250, true);
    say(this.Phrases.RadamentBookLeave);
    while (this.playersIn())
      delay(250);
    return this.backToTown();
  };

  this.cube = function() {
    if (!this.useWaypoint(57))
      return false;
    Precast.doPrecast(true);

    if (!Pather.moveToExit(60, true) || !Pather.moveToPreset(me.area, 2, 354))
      return false;

    this.makePortal();
    
    Attack.securePosition(me.x, me.y, 25, 2000, true);
    say(this.Phrases.CubeEnter);
    while (this.playersIn() < this.rusheeCount())
      Attack.securePosition(me.x, me.y, 25, 250, true);
    say(this.Phrases.CubeLeave);
    while (this.playersIn())
      delay(250);
    return this.backToTown();
  };

  this.amulet = function() {
    if (!this.useWaypoint(44))
      return false;
    Precast.doPrecast(true);

    if (!Pather.moveToExit([45, 58, 61], true) || !Pather.moveTo(15044, 14045))
      return false;
    this.makePortal();
    Attack.clear(25);
    say(this.Phrases.AmuletEnter);
    while (!this.playersIn()) {
      Pather.moveTo(15044, 14047);
      Attack.clear(15);
      delay(250);
    }
    say(this.Phrases.AmuletLeave);
    while (this.playersIn())
      delay(250);
    return this.backToTown();
  };

  this.staff = function() {
    if (!this.useWaypoint(43))
      return false;
    Precast.doPrecast(true);

    if (!Pather.moveToExit([62, 63, 64], true) || !Pather.moveToPreset(me.area, 2, 356))
      return false;
    var spot = {x: me.x, y: me.y};
    this.makePortal();
    Attack.clear(25);
    say(this.Phrases.StaffEnter);
    while (!this.playersIn()) {
      Pather.moveToUnit(spot);
      Attack.clear(15);
      delay(250);
    }
    say(this.Phrases.StaffLeave);
    while (this.playersIn())
      delay(250);
    return this.backToTown();
  };

  this.summoner = function() {
    if (!this.useWaypoint(74))
      return false;
    Precast.doPrecast(true);

    var preset = getPresetUnit(me.area, 2, 357), spot;
    switch (preset.roomx * 5 + preset.x) {
    case 25011:
      spot = {x: 25081, y: 5446};
      break;
    case 25866:
      spot = {x: 25830, y: 5447};
      break;
    case 25431:
      switch (preset.roomy * 5 + preset.y) {
      case 5011:
        spot = {x: 25449, y: 5081};
        break;
      case 5861:
        spot = {x: 25447, y: 5822};
        break;
      }
      break;
    }

    if (!Pather.moveToUnit(spot))
      return false;

    this.makePortal();
    Attack.clear(25);
    say(this.Phrases.SummonerEnter);
    while (!this.playersIn()) {
      Pather.moveToUnit(spot);
      Attack.clear(15);
      delay(250);
    }
    Attack.clear(15, 0, 250);
    Pather.moveToPreset(me.area, 2, 357);
    var journal = getUnit(2, 357);
    for (var i = 0; i < 5; i++) {
      journal.interact();
      delay(1000);
      me.cancel();
      if (i == 0) {
        say(this.Phrases.SummonerLeave);
        while (this.playersIn())
          delay(250);
      }
      if (Pather.getPortal(46))
        break;
    }
    return Pather.usePortal(46);
  };

  this.duriel = function() {
    if (!this.useWaypoint(46))
      return false;
    Precast.doPrecast(true);

    if (!Pather.moveToExit(getRoom().correcttomb, true) || !Pather.moveToPreset(me.area, 2, 152))
      return false;

    this.makePortal();
    Attack.securePosition(me.x, me.y, 30, 2000, true, true);
    say(this.Phrases.DurielEnter);
    while (!this.playersIn()) {
      Pather.moveToPreset(me.area, 2, 152, 0, -5);
      Attack.clear(15);
      delay(250);
    }
    while (!getUnit(2, 100))
      delay(250);

    Pather.useUnit(2, 100, 73);
    Attack.kill(211);
    Pather.teleport = false;
    Pather.moveTo(22579, 15706);
    Pather.teleport = true;
    Pather.moveTo(22577, 15649, 10);
    Pather.moveTo(22577, 15609, 10);
    this.makePortal();
    say(this.Phrases.DurielDead);
    while (!this.playersIn())
      delay(250);
    return this.backToTown();
  };
  this.jerhyn = function() {
    if (!this.backToTown())
      return false;
    Pather.useWaypoint(52);
    Pather.moveToExit([51, 50], true);
    Pather.moveTo(10022, 5046);
    while (this.playersInArea(73))
      delay(250);
    this.makePortal();
    delay(250);
    say(this.Phrases.JerhynPortal);
    if (!Pather.usePortal(null, me.name))
      return false;
    if (!this.backToTown())
      return false;
    Pather.useWaypoint(75);
    while (!this.playersInAct(3))
      delay(250);
    return true;
  };

  this.a2wps = function() {
    return this.giveWaypoints(this.actWaypoints[2]);
  };

  // ACT III

  this.tome = function() {
    if (!this.useWaypoint(80))
      return false;
    Precast.doPrecast(true);
    if (!Pather.moveToExit(94, true) || !Pather.moveToPreset(me.area, 2, 193))
      return false;

    var spot = {x: me.x, y: me.y};
    this.makePortal();
    Attack.clear(25);
    say(this.Phrases.TomeEnter);
    while (!this.playersIn()) {
      Pather.moveToUnit(spot);
      Attack.clear(15);
      delay(250);
    }
    var jade = getUnit(4, 546, 3);
    if (jade) Pickit.pickItem(jade);
    say(this.Phrases.TomeLeave);
    while (this.playersIn())
      delay(250);
    if (!this.backToTown())
      return false;
    jade = me.getItem(546);
    if (jade) {
      jade.drop();
      say(this.Phrases.BirdDrop);
    }
    return true;
  };

  this.bird = function() {
    if (this.waitForChat(this.Phrases.BirdStart) && !me.getQuest(20, 0))
      quit(); // don't complete the quest for the rusher
    return true;
  };

  this.travincal = function() {
    if (!this.useWaypoint(83))
      return false
    Precast.doPrecast(true);
    var coords = [me.x, me.y];

    Pather.moveTo(coords[0] + 81, coords[1] - 135);
    this.makePortal();
    Attack.clear(25);
    say(this.Phrases.TravincalEnter);
    while (!this.playersIn()) {
      Pather.moveTo(coords[0] + 81, coords[1] - 135);
      Attack.clear(15);
      delay(250);
    }

    Pather.moveTo(coords[0] + 97, coords[1] - 68);
    Attack.kill(getLocaleString(2863));
    Attack.kill(getLocaleString(2862));
    Attack.kill(getLocaleString(2860));
    var jade = getUnit(4, 546, 3);
    if (jade) Pickit.pickItem(jade);

    Pather.moveTo(coords[0] + 81, coords[1] - 135);
    say(this.Phrases.TravincalLeave);
    while (this.playersIn())
      delay(250);
    if (!this.backToTown())
      return false;
    jade = me.getItem(546);
    if (jade) {
      jade.drop();
      say(this.Phrases.BirdDrop);
    }
    return true;
  };

  this.mephisto = function() {
    if (!this.useWaypoint(101))
      return false;
    Precast.doPrecast(true);

    if (!Pather.moveToExit(102, true) || !Pather.moveTo(17591, 8070))
      return false;

    var monster = getUnit(1);
    var monsterList = [];
    if (monster) {
      do {
        if (Attack.checkMonster(monster) && getDistance(monster, 17627, 8070) <= 30)
          monsterList.push(monster);
      } while (monster.getNext());
    }
    if (monsterList.length) {
      Pather.moveTo(17627, 8070);
      Attack.clearList(monsterList);
    }
    Pather.moveTo(17591, 8070);
    this.makePortal();
    monster = getUnit(1, "hydra");
    if (monster) {
      do {
        while (monster.mode != 0 && monster.mode != 12 && monster.hp > 0)
          delay(250);
      } while (monster.getNext());
    }
    say(this.Phrases.MephistoEnter);
    while (!this.playersIn()) {
      Pather.moveTo(17591, 8070);
      delay(250);
    }
    Attack.kill(242);
    Pather.moveTo(17591, 8070);
    delay(2000);
    say(this.Phrases.MephistoLeave);
    Pather.usePortal(null);
    while (!this.playersInAct(4))
      delay(250);
    return true;
  };

  this.a3wps = function() {
    return this.giveWaypoints(this.actWaypoints[3]);
  };

  // ACT IV

  this.izual = function() {
    if (!this.useWaypoint(106))
      return false;
    Precast.doPrecast(true);

    if (!Pather.moveToExit(105, true))
      return false;
    if (!this.clearAround(256, getPresetUnit(105, 1, 256), 50, 20, 2000))
      return false;
    this.makePortal();
    say(this.Phrases.IzualEnter);
    this.waitAndClear(256, 20);
    Pather.moveToPreset(105, 1, 256);
    Attack.kill(256);
    say(this.Phrases.IzualLeave);
    while (this.playersIn())
      delay(250);

    return this.backToTown();
  };

  this.diablo = function() {
    var getLayout = function(seal, value) {
      var sealPreset = getPresetUnit(108, 2, seal);
      if (!seal) {
        throw new Error("Seal preset not found. Can't continue.");
      }
      if (sealPreset.roomy * 5 + sealPreset.y === value || sealPreset.roomx * 5 + sealPreset.x === value)
        return 1;
      return 2;
    };
    var openSeal = function(id) {
      Pather.moveToPreset(108, 2, id, 4);
      var seal = getUnit(2, id);
      if (seal) {
        for (var i = 0; i < 3; i++) {
          seal.interact();
          var tick = getTickCount();
          while (getTickCount() - tick < 500) {
            if (seal.mode)
              return true;
            delay(10);
          }
        }
      }
      return false;
    };
    var chaosPreattack = function(name, amount) {
      if (me.classid == 3) {
        var target = getUnit(1, name);
        if (!target)
          return;
        var positions = [[6, 11], [0, 8], [8, -1], [-9, 2], [0, -11], [8, -8]];
        for (var i = 0; i < positions.length; i++) {
          if (Attack.validSpot(target.x + positions[i][0], target.y + positions[i][1])) { // check if we can move there
            Pather.moveTo(target.x + positions[i][0], target.y + positions[i][1]);
            Skill.setSkill(Config.AttackSkill[2], 0);
            for (var n = 0; n < amount; n++)
              Skill.cast(Config.AttackSkill[1], 1);
            break;
          }
        }
      }
    };
    var getBoss = function(name) {
      var glow = getUnit(2, 131);
      for (var i = 0; i < (name === getLocaleString(2853) ? 14 : 12); i++) {
        var boss = getUnit(1, name);
        if (boss) {
          if (name === getLocaleString(2852))
            chaosPreattack(getLocaleString(2852), 8);
          Attack.kill(name);
          Pickit.pickItems();
          return true;
        }
        delay(250);
      }
      return !!glow;
    };


    if (!this.useWaypoint(107))
      return false;
    Precast.doPrecast(true);

    Pather.moveTo(7790, 5544);
    var layouts = [getLayout(396, 5275),
                   getLayout(394, 7773),
                   getLayout(392, 7893)];

    if (!openSeal(395) || !openSeal(396))
      throw new Error("Failed to open seals");
    if (layouts[0] == 1)
      Pather.moveTo(7691, 5292);
    else
      Pather.moveTo(7695, 5316);
    if (!getBoss(getLocaleString(2851)))
      throw new Error("Failed to kill Vizier");

    if (!openSeal(394))
      throw new Error("Failed to open seals");
    if (layouts[1] == 1)
      Pather.moveTo(7771, 5196);
    else
      Pather.moveTo(7798, 5186);
    if (!getBoss(getLocaleString(2852)))
      throw new Error("Failed to kill de Seis");

    if (!openSeal(392) || !openSeal(393))
      throw new Error("Failed to open seals");
    if (layouts[2] === 1)
      delay(1);
    else
      Pather.moveTo(7928, 5295); // temp
    if (!getBoss(getLocaleString(2853)))
      throw new Error("Failed to kill Infector");

    Pather.moveTo(7763, 5267);
    this.makePortal();
    Pather.moveTo(7727, 5267);
    say(this.Phrases.DiabloEnter);
    while (!this.playersIn())
      delay(250);

    Pather.moveTo(7763, 5267);
    while (!getUnit(1, 243))
      delay(500);

    Attack.kill(243);
    say(this.Phrases.DiabloLeave);

    if (!this.backToTown())
      return false;
    delay(250);
    if (me.gametype > 0) {
      Pather.useWaypoint(109);
      while (!this.playersInAct(5))
        delay(250);
    }
    return true;
  };

  this.a4wps = function() {
    return this.giveWaypoints(this.actWaypoints[4]);
  };

  // ACT V

  this.shenk = function() {
    if (!this.useWaypoint(111))
      return false;
    Precast.doPrecast(true);

    Pather.moveTo(3850, 5097);
    Attack.clear(25);
    this.makePortal();
    say(this.Phrases.ShenkEnter);
    while (!this.playersIn()) {
      Pather.moveTo(3850, 5097);
      Attack.clear(15);
      delay(250);
    }
    Pather.moveTo(3883, 5113);
    Attack.kill(getLocaleString(22435));
    say(this.Phrases.ShenkLeave);
    while (this.playersIn())
      delay(250);
    return this.backToTown();
  };

  this.anya = function() {
    if (!this.useWaypoint(113))
      return false;
    Precast.doPrecast(true);

    if (!Pather.moveToExit(114, true) || !Pather.moveToPreset(me.area, 2, 460))
      return false;

    Attack.clear(20);
    var anya = getUnit(2, 558);
    Pather.moveToUnit(anya);
    sendPacket(1, 0x13, 4, 2, 4, anya.gid);
//    if (!anya.interact())
//      return false;
    delay(300);
    me.cancel();
    me.cancel();
    this.makePortal();
    say(this.Phrases.AnyaEnter);
    while (!this.playersIn()) {
      Pather.moveToUnit(anya);
      Attack.clear(20);
      delay(250);
    }
    say(this.Phrases.AnyaLeave);
    while (this.playersIn())
      delay(250);
    return this.backToTown();
  };

  this.ancients = function() {
    if (!this.useWaypoint(118))
      return false;
    Precast.doPrecast(true);

    if (!Pather.moveToExit(120, true))
      return false;

    Pather.moveTo(10057, 12645);
    this.makePortal();
    say(this.Phrases.AncientsEnter);

    while (!this.playersIn())
      delay(250);
    var altar = getUnit(2, 546);
    while (altar.mode != 2) {
      Pather.moveToUnit(altar);
      altar.interact();
      delay(1000);
      me.cancel();
    }

    while (!getUnit(1, 542))
      delay(250);

    Attack.clear(50); // additional check for immunities?
    Pather.moveTo(10057, 12645);
    this.makePortal();
    say(this.Phrases.AncientsLeave);

    if (this.Bumper) {
      while (this.playersIn())
        delay(250);
      return this.backToTown()
    }
    return true;
  };

  this.baal = function() {
    var needReclear = null;
    var helpListener = function(nick, msg) {
      if (nick == PowerRush.leaderName) {
        var m = msg.match(/help ([0-9]+)/);
        if (m) needReclear = Number(m[1]);
      }
    };
    var getExitTo = function(target) {
      var exits = getArea().exits;
      for (var i = 0; exits && i < exits.length; i++) {
        if (exits[i].target == target)
          return {x: exits[i].x, y: exits[i].y};
      }
      return null;
    };
    var clearArea = function() {
      var from = getExitTo(me.area == 128 ? 120 : me.area - 1);
      var to = (me.area == 131 ? {x: 15113, y: 5040} : getExitTo(me.area + 1));
      if (!from || !to)
        return false;
      if (getDistance(me, to) < getDistance(me, from)) {
        var tmp = from;
        from = to;
        to = tmp;
      }
      var path = getPath(me.area, from.x, from.y, to.x, to.y, 0, 20);
      if (!path) return false;
      for (var i = 0; i < path.length; i++) {
        if (!Attack.securePosition(path[i].x, path[i].y, 35, 250))
          return false;
      }
      return true;
    };

    if (!this.Bumper) {
      say(this.Phrases.BaalClearing);

      if (me.area != 120) {
        if (!this.useWaypoint(118) ||
            !Pather.moveToExit(120, true))
          return false;
      }
      Precast.doPrecast(true);

      if (!Pather.moveToExit(128, true) || !clearArea())
        return false;
      if (!Pather.moveToExit(129, true) || !clearArea())
        return false;
      if (!Pather.moveToExit(130, true) || !clearArea())
        return false;
      if (!Pather.moveToExit(131, true) || !clearArea())
        return false;
      addEventListener("chatmsg", helpListener);
      say(this.Phrases.BaalClear);
    } else {
      if (!this.useWaypoint(129))
        return false;
      Precast.doPrecast(true);
      if (!Pather.moveToExit([130, 131], true))
        return false;
    }

    var preattack = function() {
      switch (me.classid) {
      case 1:
        if ([56, 59, 64].indexOf(Config.AttackSkill[1]) > -1) {
          if (me.getState(121))
            delay(500);
          else
            Skill.cast(Config.AttackSkill[1], 0, 15093, 5024);
        }
        return true;
      case 3: // Paladin
        if (Config.AttackSkill[3] !== 112)
          return false;

        if (getDistance(me, 15093, 5029) > 3)
          Pather.moveTo(15093, 5029);
        if (Config.AttackSkill[4] > 0)
          Skill.setSkill(Config.AttackSkill[4], 0);
        Skill.cast(Config.AttackSkill[3], 1);

        return true;
      case 5: // Druid
        if (Config.AttackSkill[3] === 245) {
          Skill.cast(Config.AttackSkill[3], 0, 15093, 5029);
          return true;
        }
        break;
      case 6:
        if (Config.UseTraps) {
          var check = ClassAttack.checkTraps({x: 15093, y: 5029});
          if (check) {
            ClassAttack.placeTraps({x: 15093, y: 5029}, 5);
            return true;
          }
        }
        break;
      }
      return false;
    };
    var checkThrone = function() {
      var monster = getUnit(1);
      if (monster) {
        do {
          if (Attack.checkMonster(monster) && monster.y < 5080) {
            switch (monster.classid) {
            case 23:
            case 62:
              return 1;
            case 105:
            case 381:
              return 2;
            case 557:
              return 3;
            case 558:
              return 4;
            case 571:
              return 5;
            default:
              Attack.getIntoPosition(monster, 10, 0x4);
              Attack.clear(15);
              return false;
            }
          }
        } while (monster.getNext());
      }
      return false;
    };
    var clearThrone = function() {
      var pos = [15097, 5054, 15085, 5053, 15085, 5040, 15098, 5040, 15099, 5022, 15086, 5024];
      var monList = [];
      if (Config.AvoidDolls) {
        var monster = getUnit(1, 691);
        if (monster) {
          do {
            if (monster.x >= 15072 && monster.x <= 15118 && monster.y >= 5002 && monster.y <= 5079 && Attack.checkMonster(monster) && Attack.skipCheck(monster))
              monList.push(copyUnit(monster));
          } while (monster.getNext());
        }
        if (monList.length)
          Attack.clearList(monList);
      }
      for (var i = 0; i < pos.length; i += 2) {
        Pather.moveTo(pos[i], pos[i + 1]);
        Attack.clear(30);
      }
    };
    var checkHydra = function() {
      var monster = getUnit(1, "hydra");
      if (monster) {
        do {
          if (monster.mode !== 12 && monster.getStat(172) !== 2) {
            Pather.moveTo(15118, 5002);
            while (monster.mode !== 12) {
              delay(500);
              if (!copyUnit(monster).x) {
                break;
              }
            }
            break;
          }
        } while (monster.getNext());
      }
      return true;
    };

    Pather.moveTo(15113, 5040);
    Attack.clear(15);
    clearThrone();
    Pather.moveTo(15092, 5011);
    this.makePortal();

    var tick = getTickCount();
    var cleared5 = false;
    var baalSaid = false;
    Pather.moveTo(15093, me.classid == 3 ? 5029 : 5039);
  MainLoop:
    while (true) {
      if (needReclear) {
        while (me.area > needReclear && me.area >= 129)
          Pather.moveToExit(me.area - 1, true);
        clearArea();
        say(this.Phrases.BaalClear);
        needReclear = null;
        while (me.area < 131)
          Pather.moveToExit(me.area + 1, true);
      }

      if (cleared5 || !getUnit(1, 543)) {
        Pather.moveTo(15092, 5011);
        if (!baalSaid) {
          say(this.Phrases.BaalReady);
          baalSaid = true;
        }
        if (this.Bumper)
          break MainLoop;
        var leader = getUnit(0, this.leaderName);
        if (leader && getDistance(me, leader) < 10)
          break MainLoop;
        delay(500);
      } else {
        if (getDistance(me, 15093, me.classid == 3 ? 5029 : 5039) > 3)
          Pather.moveTo(15093, me.classid == 3 ? 5029 : 5039);

        switch (checkThrone()) {
        case 1:
          Attack.clear(40);
          tick = getTickCount();
          Precast.doPrecast(true);
          break;
        case 2:
          Attack.clear(40);
          tick = getTickCount();
          break;
        case 4:
          Attack.clear(40);
          tick = getTickCount();
          break;
        case 3:
          Attack.clear(40);
          checkHydra();
          tick = getTickCount();
          break;
        case 5:
          Attack.clear(40);
          cleared5 = true;
          break;
        default:
          if (getTickCount() - tick < 7000) {
            if (me.getState(2)) {
              Skill.setSkill(109, 0);
            }
            break;
          }
          if (!preattack())
            delay(100);
          break;
        }
        Precast.doPrecast(false);
        delay(10);
      }
    }
    if (!this.Bumper)
      removeEventListener("chatmsg", helpListener);

    Pather.moveTo(15092, 5011);
    Precast.doPrecast(true);
    while (getUnit(1, 543))
      delay(500);
    delay(1000);
    var portal = getUnit(2, 563);
    if (portal)
      Pather.usePortal(null, null, portal);
    else
      throw new Error("Couldn't find portal.");
    this.makePortal();
    say(this.Phrases.BaalEnter);
    while (!this.playersIn())
      delay(250);

    Pather.moveTo(15134, 5923);
    Attack.kill(544); // Baal
    Pickit.pickItems();
    say(this.Phrases.BaalLeave);
    while (this.playersIn())
      delay(250);

    return this.backToTown();
  };

  this.a5wps = function() {
    return this.giveWaypoints(this.actWaypoints[5]);
  };

  // core

  this.init();

  while (!this.questQueue && !this.finished) {
    me.overhead("Waiting for leader");
    delay(500);
  }

  while (this.questQueue.length && !this.finished) {
    var quest = this.questQueue.shift();
    me.overhead("Starting " + quest);

    if (this.needGold) {
      if (Town.goToTown(this.questAct[quest])) {
        if (me.getStat(14) < this.needGold && Town.openStash()) {
          gold(Math.min(me.getStat(15), this.needGold - me.getStat(14)), 4);
          delay(500);
          me.cancel();
        }
        Town.move("portalspot");
        gold(this.needGold);
        delay(500);
        say(this.Phrases.GoldDrop);
      }
      this.needGold = 0;
    }
    if (me.inTown)
      Town.doChores();

    try {
      if (!this[quest]()) {
        D2Bot.printToConsole("Error executing " + quest);
        Town.goToTown();
      }
    } catch (err) {
      D2Bot.printToConsole("Error executing " + quest + ": " + err.message);
      Town.goToTown();
    }
  }

  return true;
}

function PowerRusher() {
  return PowerRush.rusher();
}
