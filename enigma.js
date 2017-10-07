var mod26 = function(input) {
  while(input < 0) {
    input += 26;
  }

  return input % 26;
}

class Rotor {
  constructor(mapping, actuationPosition) {
    this.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    this.translation = mapping.split('');
    this.actuationPosition = actuationPosition;
  }

  moduleType() {
    return 'rotor';
  }

  setLeftModule(leftModule) {
    this.leftModule = leftModule;
  }

  setRightModule(rightModule) {
    this.rightModule = rightModule;
  }

  leftSignal(inputIndex) {
    var outerRingIndex = mod26(inputIndex + this.rotorPosition);
    var outerRingCharacter = this.alphabet[outerRingIndex];
    var innerRingCharacter = this.translation[outerRingIndex];
    var innerRingIndex = mod26(this.alphabet.findIndex(function(element) {
      return element == innerRingCharacter;
    }) - this.rotorPosition);
    return innerRingIndex;
  }

  rightSignal(inputIndex) {
    var innerRingIndex = mod26(inputIndex + this.rotorPosition);
    var innerRingCharacter = this.alphabet[innerRingIndex];
    var translationIndex = this.translation.findIndex(function(element) {
      return element == innerRingCharacter;
    });
    var translationCharacter = this.alphabet[translationIndex];
    return mod26(translationIndex - this.rotorPosition);
  }

  getActuationPosition() {
    return this.actuationPosition;
  }

  getRotorPosition() {
    return this.rotorPosition;
  }

  getDisplayCharacter() {
    return this.alphabet[this.getRotorPosition()];
  }

  setRotorPosition(rotorPosition) {
    this.rotorPosition = mod26(rotorPosition);
  }

  readyToActuate() {
    return this.getActuationPosition() == this.getRotorPosition();
  }

  rotate() {
    this.rotorPosition = mod26(this.rotorPosition + 1);
  }

  actuate() {
    if(this.rightModule.moduleType() != 'rotor') {
      this.rotate();
    }
    else if(this.rightModule.readyToActuate()) {
      this.rotate();

      if(this.leftModule.moduleType() != 'rotor') {
        this.rightModule.rotate();
      }
    }

    return this.getDisplayCharacter();
  }
}

class Reflector {
  constructor(mapping) {
    this.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    this.translation = mapping.split('');
  };

  moduleType() {
    return 'reflector';
  }

  setRightModule(rightModule) {
    this.rightModule = rightModule;
  }

  leftSignal(inputIndex) {
    var outerRingCharacter = this.alphabet[inputIndex];
    var innerRingCharacter = this.translation[inputIndex];
    var innerRingIndex = this.alphabet.findIndex(function(element) {
      return element == innerRingCharacter;
    });
    return innerRingIndex;
  };
}

class Keyboard {
  constructor() {
    this.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  }

  moduleType() {
    return 'keyboard';
  }

  setLeftModule(leftModule) {
    this.leftModule = leftModule;
  }
}

class Enigma {
  constructor() {
    this.keyboard = new Keyboard();
  }

  installRotors(leftRotor, middleRotor, rightRotor) {
    this.leftRotor = leftRotor;
    this.middleRotor = middleRotor;
    this.rightRotor = rightRotor;

    this.leftRotor.setRightModule(this.middleRotor);
    this.middleRotor.setRightModule(this.rightRotor);
    this.rightRotor.setRightModule(this.keyboard);

    this.middleRotor.setLeftModule(this.leftRotor);
    this.rightRotor.setLeftModule(this.middleRotor);
  }

  installReflector(reflector) {
    this.reflector = reflector;

    this.reflector.setRightModule(this.leftRotor);
    this.leftRotor.setLeftModule(this.reflector);
  }

  setRotorPositions(leftRotorPosition, middleRotorPosition, rightRotorPosition) {
    this.leftRotor.setRotorPosition(leftRotorPosition);
    this.middleRotor.setRotorPosition(middleRotorPosition);
    this.rightRotor.setRotorPosition(rightRotorPosition);
  }

  keyPress(character) {
    var inputIndex = this.keyboard.alphabet.findIndex(function(element) {
      return element == character;
    });

    var leftCharacter = this.leftRotor.actuate();
    var middleCharacter = this.middleRotor.actuate();
    var rightCharacter = this.rightRotor.actuate();

    console.log(leftCharacter + middleCharacter + rightCharacter);

    var intermediateCharacter1 = this.rightRotor.leftSignal(inputIndex);
    var intermediateCharacter2 = this.middleRotor.leftSignal(intermediateCharacter1);
    var intermediateCharacter3 = this.leftRotor.leftSignal(intermediateCharacter2);
    var intermediateCharacter4 = this.reflector.leftSignal(intermediateCharacter3);
    var intermediateCharacter5 = this.leftRotor.rightSignal(intermediateCharacter4);
    var intermediateCharacter6 = this.middleRotor.rightSignal(intermediateCharacter5);
    var finalIndex = this.rightRotor.rightSignal(intermediateCharacter6);

    return this.keyboard.alphabet[finalIndex];
  }
}

var rotorI = new Rotor('EKMFLGDQVZNTOWYHXUSPAIBRCJ', 16);
var rotorII = new Rotor('AJDKSIRUXBLHWTMCQGZNPYFVOE', 4);
var rotorIII = new Rotor('BDFHJLCPRTXVZNYEIWGAKMUSQO', 21);
var reflectorB = new Reflector('YRUHQSLDPXNGOKMIEBFZCWVJAT');

var enigma = new Enigma();
enigma.installRotors(rotorI, rotorII, rotorIII);
enigma.installReflector(reflectorB);
enigma.setRotorPositions(7, 3, 23);

var keyPress = function(e) {
  var inputLetter = String.fromCharCode(e.which);
  var outputText = document.getElementById('outputTextArea');

  var outputLetter = enigma.keyPress(inputLetter);
  outputText.value = outputText.value + outputLetter;
};


