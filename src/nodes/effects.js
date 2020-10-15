export function init() {
  let list = [
    {
      name: "BitCrusher",
      function: () => BitCrusher(),
      props: { bitDepth: 0.5, sampleRate: 0.5 }
    },
    {
      name: "Buffer Shuffler",
      function: () => Shuffler(),

      props: {
        rate: 22050,
        chance: 0.25,
        reverseChance: 0.5,
        repitchChance: 0.5,
        repitchMin: 0.5,
        repitchMax: 2,
        pan: 0.5,
        mix: 0.5
      }
    },
    {
      name: "Chorus",
      function: () => Chorus(),

      props: {
        slowFrequency: 0.18,
        slowGain: 3,
        fastFrequency: 6,
        fastGain: 1,
        inputGain: 1
      }
    },
    {
      name: "Delay",
      function: () => Delay(),

      props: { feedback: 0.5, time: 11025, wetdry: 0.5 }
    },
    {
      name: "Distortion",
      function: () => Distortion(),

      props: { shape1: 0.1, shape2: 0.1, pregain: 5, postgain: 0.5 }
    },
    {
      name: "Flanger",
      function: () => Flanger(),

      props: { feedback: 0.81, offset: 0.125, frequency: 1 }
    },
    {
      name: "Ring Mod",
      function: () => RingMod(),

      props: { frequency: 220, gain: 1, mix: 1 }
    },
    {
      name: "Reverb",
      function: () => Reverb(),

      props: {
        wet1: 1,
        wet2: 0,
        dry: 0.5,
        roomSize: 0.925,
        damping: 0.5
      }
    },
    {
      name: "Vibrato",
      function: () => Vibrato(),
      props: { feedback: 0.01, amount: 0.5, frequency: 4 }
    }
  ];

  list.forEach(object => {
    function Node() {
      this.addOutput("Instrument", "instrument");
      this.addInput("Instrument", "instrument");
      Object.keys(object.props).forEach(key => {
        this.addInput(key, "number");
      });
    }

    //name to show
    Node.title = object.name;

    Node.prototype.onStart = function() {
      this.setOutputData(0, this.source);
    };

    Node.prototype.onAdded = function() {
      this.gibberishEffect = object.function();

      ///

      // this is a Gibberish Effect
      //this.effect = object.function();

      // this is a Gibberish Instrument
      //this.input = this.getInputData(0);
    };

    Node.prototype.onExecute = function() {
      //connect this.gibberishEffect and set input on that object to gibberishInput object
      Object.keys(object.props).forEach((key, i) => {
        let value = isNaN(this.getInputData(i + 1))
          ? object.props[key]
          : this.getInputData(i + 1);
        this.gibberishEffect[key] = value;
      });
    };

    Node.prototype.onConnectionsChange = function(
      connection,
      slot,
      connected,
      link_info
    ) {
      //only process the outputs events
      if (connection != LiteGraph.OUTPUT) {
        return;
      }

      //alex needs to fix what this does lol
    };

    //register in the system
    LiteGraph.registerNodeType("effect/" + object.name, Node);
  });
}
