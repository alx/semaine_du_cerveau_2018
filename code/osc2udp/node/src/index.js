var oscMin = require("osc-min"),
  udp = require("dgram");

var oscIn = {
  ip: "192.168.129.160",
  port: 57121
};

if (process.argv[2] != null) {
  oscIn.port = parseInt(process.argv[2]);
}

var udpOut = {
  ip: "192.168.129.201",
  port: 9999
};

const dataLength = 100;
let level0 = 30;
let difficulty = 10;

let currentAltitude = 0;

//console.log(`OSC listener running at http://${oscIn.ip}:${oscIn.port}`);

const oscAddresses = [
  "/muse/eeg", //x5
  "/muse/acc", //x3
  "/muse/gyro", //x3
  "/muse/batt", //x4
  "/muse/elements/blink", //x1
  "/muse/elements/jaw_clench", //x1
  "/muse/elements/touching_forehead", //x1
  "/muse/elements/horseshoe", //x4
  "/muse/elements/alpha_absolute",
  "/muse/elements/beta_absolute",
  "/muse/elements/delta_absolute",
  "/muse/elements/theta_absolute",
  "/muse/elements/gamma_absolute"
];

let data = {
  delta: [0],
  theta: [0],
  alpha: [0],
  beta: [0],
  gamma: [0]
};

const colorBand = {
  delta: "red",
  theta: "cyan",
  alpha: "blue",
  beta: "green",
  gamma: "yellow"
};

const sock = udp.createSocket("udp4", function(msg, rinfo) {
  try {
    const message = oscMin.fromBuffer(msg);
    const element = message.elements[0];
    //console.log(oscAddresses.contains(element.address) ? 1 : 0);
    if (
      oscAddresses.indexOf(element.address) != -1 &&
      element.address.indexOf("_absolute") != -1
    ) {
      var bandRegexp = /\/(.[^\/]*)_.*/g;
      var match = bandRegexp.exec(element.address);
      var band = match[1];

      if (data[band].length == dataLength) {
        data[band].shift();
      }
      const currentValue = parseInt(element.args[0].value * 100) + level0;
      data[band].push(currentValue < 0 ? 0 : currentValue);

      //console.log(match[1]); // abc
      //console.log(element);
      //console.log(element.address);

      //console.log(message);
    }
  } catch (e) {
    console.log(e);
  }
});

sock.bind(oscIn.port, oscIn.ip);

var blessed = require("blessed"),
  contrib = require("blessed-contrib"),
  screen = blessed.screen();

screen.key(["escape", "q", "C-c"], function(ch, key) {
  return process.exit(0);
});

screen.key(["up"], function(ch, key) {
  difficulty += 1;
});

screen.key(["down"], function(ch, key) {
  difficulty -= 1;
});

screen.key(["pageup"], function(ch, key) {
  level0 += 1;
});

screen.key(["pagedown"], function(ch, key) {
  level0 -= 1;
});

var grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

var line = grid.set(4, 0, 8, 12, contrib.line, {
  style: {
    line: "yellow",
    text: "green",
    baseline: "black"
  },
  showLegend: true,
  wholeNumbersOnly: false, //true=do not show fraction in y axis
  label: "Muse Monitor"
});

var donut = grid.set(0, 0, 4, 8, contrib.donut, {
  label: "Status",
  radius: 8,
  arcWidth: 3,
  remainColor: "black",
  yPadding: 2
});

var donutUdp = grid.set(0, 8, 4, 2, contrib.donut, {
  label: "Udp",
  radius: 8,
  arcWidth: 3,
  remainColor: "black"
});

var barAltitude = grid.set(0, 10, 4, 1, contrib.bar, {
  label: "Altitude",
  barWidth: 4,
  barSpacing: 6,
  xOffset: 0,
  maxHeight: 9
});

var barConstants = grid.set(0, 11, 4, 1, contrib.bar, {
  label: "Constants",
  barWidth: 4,
  barSpacing: 6,
  xOffset: 0,
  maxHeight: 9
});

function refreshDonut() {
  let donutData = [];
  for (var band in data) {
    let bandColor = "red";
    const lastBandValue = data[band][data[band].length - 1];
    if (lastBandValue < difficulty) {
      bandColor = "green";
    }
    donutData.push({ percent: 100, label: band, color: bandColor });
  }
  donut.setData(donutData);
}

function refreshDonutUdp() {
  let donutLabel = "stall";
  let donutColor = "blue";
  let onBand = 0;

  for (var band in data) {
    const lastBandValue = data[band][data[band].length - 1];
    if (lastBandValue < difficulty) {
      onBand += 1;
    }
  }

  switch (onBand) {
    case 0:
    case 1:
      if (currentAltitude > 0) {
        donutLabel = "down";
        donutColor = "red";
        currentAltitude -= 1;
      }
    case 2:
      break;
    case 3:
    case 4:
    case 5:
      donutLabel = "up";
      donutColor = "green";
      currentAltitude += 1;
  }

  donutUdp.setData([
    {
      percent: 100,
      label: donutLabel,
      color: donutColor
    }
  ]);
}

function refreshBandData() {
  let bandData = [];

  for (var band in data) {
    const lastBandValue = data[band][data[band].length - 1];
    //const bandMean = data[band].reduce(function(a,b){return a+b;}) / data[band].length;
    bandData.push({
      title: `${band} - ${lastBandValue}`,
      x: data[band].map((band, index) => `t${index}`),
      y: data[band],
      style: {
        line: colorBand[band]
      }
    });
  }

  line.setData(bandData);
}

function refreshAltitude() {
  barAltitude.setData({
    titles: ["Alt."],
    data: [currentAltitude]
  });
}

function refreshConstants() {
  barConstants.setData({
    titles: ["Lvl0", "Diff"],
    data: [level0, difficulty]
  });
}

function refresh() {
  refreshBandData();
  refreshDonut();
  refreshDonutUdp();
  refreshAltitude();
  refreshConstants();
  screen.render();
}

setInterval(refresh, 10);
