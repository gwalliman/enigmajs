var mod26 = function(input) {
  while(input < 0) {
    input += 26;
  }

  return input % 26;
}

class Rotor {
  constructor(number, mapping, actuationPosition) {
    this.rotorNumber = number;
    this.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    this.translation = mapping.split('');
    this.actuationPosition = actuationPosition;
  }

  leftSignal(inputIndex) {
    console.log('LEFT SIGNAL');
    var outerRingIndex = mod26(inputIndex + this.rotorPosition);
    var outerRingCharacter = this.alphabet[outerRingIndex];
    var innerRingCharacter = this.translation[outerRingIndex];
    var innerRingIndex = mod26(this.alphabet.findIndex(function(element) {
      return element == innerRingCharacter;
    }) - this.rotorPosition);
    console.log(outerRingIndex);
    console.log(outerRingCharacter);
    console.log(innerRingCharacter);
    console.log(innerRingIndex);
    return innerRingIndex;
  }

  rightSignal(inputIndex) {
    console.log('RIGHT SIGNAL');
    var innerRingIndex = mod26(inputIndex + this.rotorPosition);
    var innerRingCharacter = this.alphabet[innerRingIndex];
    var translationIndex = this.translation.findIndex(function(element) {
      return element == innerRingCharacter;
    });
    var translationCharacter = this.alphabet[translationIndex];
    console.log(innerRingIndex); console.log(innerRingCharacter);
    console.log(translationIndex);
    console.log(translationCharacter);
    return mod26(translationIndex - this.rotorPosition);
  }

  setRotorToRight(rotorToRight) {
    this.rotorToRight = rotorToRight;
  }

  getActuationPosition() {
    return this.actuationPosition;
  }

  getRotorPosition() {
    return this.rotorPosition;
  }

  setRotorPosition(rotorPosition) {
    this.rotorPosition = mod26(rotorPosition);
  }

  actuate() {
    console.log('ACTUATE ' + this.rotorNumber);
    if(this.rotorToRight != null) {
      console.log(this.rotorToRight.rotorNumber + ' ' + this.rotorToRight.getActuationPosition());
      console.log(this.rotorToRight.rotorNumber + ' ' + this.rotorToRight.getRotorPosition());
    }
    else {
      console.log(this.getRotorPosition());
    }

    if(this.rotorToRight == null) {
      console.log('ACTUATING ' + this.rotorNumber);
      this.setRotorPosition(this.rotorPosition + 1);
      return;
    }

    if(this.rotorToRight.getActuationPosition() == this.rotorToRight.getRotorPosition()) {
      console.log('ACTUATING ' + this.rotorNumber);
      this.setRotorPosition(this.rotorPosition + 1);
      if(this.rotorToRight.rotorNumber != 1) {
      console.log('ACTUATING ' + this.rotorToRight.rotorNumber);
        this.rotorToRight.setRotorPosition(this.rotorToRight.rotorPosition + 1);
      }

      return;
    }
  }
}

class Reflector {
  constructor(mapping) {
    this.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    this.translation = mapping.split('');
  };

  signal(inputIndex) {
    var outerRingCharacter = this.alphabet[inputIndex];
    var innerRingCharacter = this.translation[inputIndex];
    var innerRingIndex = this.alphabet.findIndex(function(element) {
      return element == innerRingCharacter;
    });
    console.log(outerRingCharacter);
    console.log(innerRingIndex);
    console.log(innerRingCharacter);
    return innerRingIndex;
  };
}

var rotorI = new Rotor(1, 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', 16);
var rotorII = new Rotor(2, 'AJDKSIRUXBLHWTMCQGZNPYFVOE', 4);
var rotorIII = new Rotor(3, 'BDFHJLCPRTXVZNYEIWGAKMUSQO', 21);
var reflectorB = new Reflector('YRUHQSLDPXNGOKMIEBFZCWVJAT');

var rightRotor = rotorI;
var middleRotor = rotorII;
var leftRotor = rotorIII;
var reflector = reflectorB;

rightRotor.setRotorPosition(14);
middleRotor.setRotorPosition(2);
middleRotor.setRotorToRight(rightRotor);
leftRotor.setRotorPosition(7);
leftRotor.setRotorToRight(middleRotor);

var keyboard = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

var keyPress = function(e) {
  var inputText = document.getElementById('inputTextArea');
  var outputText = document.getElementById('outputTextArea');

  var inputLetter = String.fromCharCode(e.which);
  var inputIndex = keyboard.findIndex(function(element) {
    return element == inputLetter;
  });

  leftRotor.actuate();
  middleRotor.actuate();
  rightRotor.actuate();
  var intermediateCharacter1 = rightRotor.leftSignal(inputIndex);
  var intermediateCharacter2 = middleRotor.leftSignal(intermediateCharacter1);
  var intermediateCharacter3 = leftRotor.leftSignal(intermediateCharacter2);
  var intermediateCharacter4 = reflector.signal(intermediateCharacter3);
  var intermediateCharacter5 = leftRotor.rightSignal(intermediateCharacter4);
  var intermediateCharacter6 = middleRotor.rightSignal(intermediateCharacter5);
  var finalIndex = rightRotor.rightSignal(intermediateCharacter6);

  outputText.value = outputText.value + keyboard[finalIndex];
  inputText.value = ''; 
};


