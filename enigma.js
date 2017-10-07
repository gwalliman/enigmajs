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

    var alphabetString = '';
    var translationString = '';
    for(var x = 0; x < this.alphabet.length; x++) {
      var originalCharacter = this.alphabet[x];
      var soughtCharacter = this.translation[x];
      var originalCharacterPosition = findCharacter(this.alphabet, originalCharacter);
      var soughtCharacterPosition = findCharacter(this.alphabet, soughtCharacter);
      var offset = mod26(soughtCharacterPosition - originalCharacterPosition);
      this.offsets.push(offset);
      this.offsetsTranslation[soughtCharacterPosition] = -offset;
      
      alphabetString += originalCharacter;
      translationString += soughtCharacter;
    }

    console.log(alphabetString);
    console.log(this.offsets);
    console.log(this.offsetsTranslation);
    console.log(translationString);
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

  leftSignal(inputIndex) {
    var outerRingIndex = mod26(inputIndex + this.rotorPosition + this.ringPosition);
    var offset = this.offsets[outerRingIndex];
    return this.leftModule.leftSignal(mod26(inputIndex + offset));
  }

  rightSignal(inputIndex) {
    var innerRingIndex = mod26(inputIndex + this.rotorPosition + this.ringPosition);
    var offset = this.offsetsTranslation[innerRingIndex];
    return this.rightModule.rightSignal(mod26(inputIndex + offset));
  }

  getActuationPosition() {
    return this.actuationPosition;
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

class Enigma {
  constructor() {
    this.keyboard = new Keyboard();
    this.rotorsInstalled = false;
    this.reflectorsInstalled = false;
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
    this.keyboard.setLeftModule(this.rightRotor);

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

  keyPress(character) {
    var status = this.checkSetup();
    if(status != '') {
      return status;
    }

    var leftCharacter = this.leftRotor.actuate();
    var middleCharacter = this.middleRotor.actuate();
    var rightCharacter = this.rightRotor.actuate();

    console.log(leftCharacter + middleCharacter + rightCharacter);

    return this.keyboard.keyPress(character);
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
enigma.setRingPositions(0, 0, 0);

var keyPress = function(e) {
  var inputLetter = String.fromCharCode(e.which);
  var outputText = document.getElementById('outputTextArea');

  var outputLetter = enigma.keyPress(inputLetter);
  outputText.value = outputText.value + outputLetter;
};
