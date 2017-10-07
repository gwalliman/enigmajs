var mod26 = function(input) {
  while(input < 0) {
    input += 26;
  }

  return input % 26;
}

var findCharacter = function(array, character) {
  return mod26(array.findIndex(function(element) {
    return element == character;
  }));
}

class Rotor {
  constructor(mapping, actuationPosition) {
    this.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    this.translation = mapping.split('');
    this.actuationPosition = actuationPosition;

    this.offsets = [];
    this.offsetsTranslation = [];

    for(var x = 0; x < this.alphabet.length; x++) {
      var originalCharacter = this.alphabet[x];
      var soughtCharacter = this.translation[x];

      var originalCharacterPosition = x;
      var soughtCharacterPosition = findCharacter(this.alphabet, soughtCharacter);

      var offset = mod26(soughtCharacterPosition - originalCharacterPosition);

      this.offsets.push(offset);
      this.offsetsTranslation[soughtCharacterPosition] = -offset;
    }
  }

  moduleType() {
    return 'rotor';
  }

  getDisplayCharacter() {
    return this.alphabet[this.getRotorPosition()];
  }

  readyToActuate() {
    return this.getActuationPosition() == this.getRotorPosition();
  }

  isLeftRotor() {
    return this.leftModule.moduleType() != 'rotor';
  }

  isMiddleRotor() {
    return !this.isLeftRotor() && !this.isRightRotor();
  }

  isRightRotor() {
    return this.rightModule.moduleType() != 'rotor';
  }

  setLeftModule(leftModule) {
    this.leftModule = leftModule;
  }

  setRightModule(rightModule) {
    this.rightModule = rightModule;
  }

  getRotorPosition() {
    return this.rotorPosition;
  }

  setRotorPosition(rotorPosition) {
    this.rotorPosition = mod26(rotorPosition);
  }

  getRingPosition() {
    return this.ringPosition;
  }

  setRingPosition(ringPosition) {
    this.ringPosition = mod26(ringPosition);
  }

  getActuationPosition() {
    return this.actuationPosition;
  }

  leftSignal(inputIndex) {
    var outerRingIndex = mod26(inputIndex + this.rotorPosition - this.ringPosition);
    var offset = this.offsets[outerRingIndex];
    console.log(this.alphabet[outerRingIndex] + ' -> ' + this.alphabet[mod26(inputIndex + offset)]);
    return this.leftModule.leftSignal(mod26(inputIndex + offset));
  }

  rightSignal(inputIndex) {
    var innerRingIndex = mod26(inputIndex + this.rotorPosition - this.ringPosition);
    var offset = this.offsetsTranslation[innerRingIndex];
    console.log(this.alphabet[innerRingIndex] + ' -> ' + this.alphabet[mod26(inputIndex + offset)]);
    return this.rightModule.rightSignal(mod26(inputIndex + offset));
  }

  rotate() {
    this.setRotorPosition(this.rotorPosition + 1);
  }

  actuate() {
    if(this.isRightRotor()) {
      this.rotate();
    }
    else if(this.rightModule.readyToActuate()) {
      this.rotate();

      if(!this.isMiddleRotor()) {
        this.rightModule.rotate();
      }
    }
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

    console.log(outerRingCharacter + ' => ' + innerRingCharacter);

    return this.rightModule.rightSignal(innerRingIndex);
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

  keyPress(character) {
    var inputIndex = this.alphabet.findIndex(function(element) {
      return element == character;
    });

    return this.leftModule.leftSignal(inputIndex);
  }

  rightSignal(index) {
    return this.alphabet[index];
  }
}

class Lampboard {
  constructor() {
    this.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    this.displayCharacter = '';
  }

  moduleType() {
    return 'lampboard';
  }

  setLeftModule(leftModule) {
    this.leftModule = leftModule;
  }

  rightSignal(index) {
    this.displayCharacter = this.alphabet[index];
  }

  getDisplayCharacter() {
    return this.displayCharacter;
  }
}

class Enigma {
  constructor() {
    this.keyboard = new Keyboard();
    this.lampboard = new Lampboard();
    this.rotorsInstalled = false;
    this.reflectorsInstalled = false;
  }

  installRotors(leftRotor, middleRotor, rightRotor) {
    this.leftRotor = leftRotor;
    this.middleRotor = middleRotor;
    this.rightRotor = rightRotor;

    this.leftRotor.setRightModule(this.middleRotor);
    this.middleRotor.setRightModule(this.rightRotor);
    this.rightRotor.setRightModule(this.lampboard);

    this.middleRotor.setLeftModule(this.leftRotor);
    this.rightRotor.setLeftModule(this.middleRotor);
    this.keyboard.setLeftModule(this.rightRotor);
    this.lampboard.setLeftModule(this.rightRotor);

    this.setRotorPositions(0, 0, 0);
    this.setRingPositions(0, 0, 0);

    this.rotorsInstalled = true;
  }

  installReflector(reflector) {
    this.reflector = reflector;

    this.reflector.setRightModule(this.leftRotor);
    this.leftRotor.setLeftModule(this.reflector);

    this.reflectorsInstalled = true;
  }

  setRotorPositions(leftRotorPosition, middleRotorPosition, rightRotorPosition) {
    this.leftRotor.setRotorPosition(leftRotorPosition);
    this.middleRotor.setRotorPosition(middleRotorPosition);
    this.rightRotor.setRotorPosition(rightRotorPosition);
  }

  setRingPositions(leftRingPosition, middleRingPosition, rightRingPosition) {
    this.leftRotor.setRingPosition(leftRingPosition);
    this.middleRotor.setRingPosition(middleRingPosition);
    this.rightRotor.setRingPosition(rightRingPosition);
  }

  checkSetup() {
    var status = '';
    if(!this.rotorsInstalled) {
      status += 'Need to install rotors!\n';
    }

    if(!this.reflectorsInstalled) {
      status += 'Need to install reflector!\n';
    }

    return status;
  }

  actuateRotors() {
    this.leftRotor.actuate();
    this.middleRotor.actuate();
    this.rightRotor.actuate();
  }

  keyPress(character) {
    var status = this.checkSetup();

    if(status != '') {
      return status;
    }

    this.actuateRotors(); 

    var leftCharacter = this.leftRotor.getDisplayCharacter();
    var middleCharacter = this.middleRotor.getDisplayCharacter();
    var rightCharacter = this.rightRotor.getDisplayCharacter();
    console.log(leftCharacter + middleCharacter + rightCharacter);

    this.keyboard.keyPress(character);
  }

  readLampboard() {
    return this.lampboard.getDisplayCharacter();
  }
}

var rotorI = new Rotor('EKMFLGDQVZNTOWYHXUSPAIBRCJ', 16);
var rotorII = new Rotor('AJDKSIRUXBLHWTMCQGZNPYFVOE', 4);
var rotorIII = new Rotor('BDFHJLCPRTXVZNYEIWGAKMUSQO', 21);
var rotorIV = new Rotor('ESOVPZJAYQUIRHXLNFTGKDCMWB', 9);
var rotorV = new Rotor('VZBRGITYUPSDNHLXAWMJQOFECK', 25);

var reflectorB = new Reflector('YRUHQSLDPXNGOKMIEBFZCWVJAT');
var reflectorC = new Reflector('FVPJIAOYEDRZXWGCTKUQSBNMHL');

var enigma = new Enigma();
enigma.installRotors(rotorI, rotorII, rotorIII);
enigma.installReflector(reflectorB);
enigma.setRotorPositions(7, 3, 23);
enigma.setRingPositions(21, 9, 1);

var keyPress = function(e) {
  var inputLetter = String.fromCharCode(e.which);
  var outputText = document.getElementById('outputTextArea');

  enigma.keyPress(inputLetter);
  var outputLetter = enigma.readLampboard();
  outputText.value = outputText.value + outputLetter;
};
