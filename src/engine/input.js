/*
 * File: input.js
 *  
 * interfaces with HTML5 to to receive keyboard events
 * 
 * For a complete list of key codes, see
 * https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
 * 
 * 
 * Modified by Brandon DeGuia, Pranshu Bhardwaj, and Tony Le for CSS 452 Final Project Winter 2023
 * Now supports inputs from an XBox standard layout controller
 * 
 * For documentation on how this file works, see
 * 
 * For documentation on how the JavaScript Gamepad class works, see
 * https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API 
 */
"use strict";

// Event handler functions *****************************************************************************************************

function onKeyDown(event) {
    mIsKeyPressed[event.keyCode] = true;
}

function onKeyUp(event) {
    mIsKeyPressed[event.keyCode] = false;
}

// MAIN FUNCTIONS **************************************************************************************************************

function cleanUp() {}  // nothing to do for now

function init() {
    keyboardInit();
    controllerInit();
}

function update() {
    keyboardUpdate();
    controllerUpdate();
}

// KEYBOARD FUNCTIONS **********************************************************************************************************

// Key code constants
const keys = {
    // arrows
    Left: 37,
    Up: 38,
    Right: 39,
    Down: 40,

    // space bar
    Space: 32,

    // numbers 
    Zero: 48,
    One: 49,
    Two: 50,
    Three: 51,
    Four: 52,
    Five : 53,
    Six : 54,
    Seven : 55,
    Eight : 56,
    Nine : 57,

    // Alphabets
    A : 65,
    B : 66,
    C : 67,
    D : 68,
    E : 69,
    F : 70,
    G : 71,
    H : 72,
    I : 73,
    J : 74,
    K : 75,
    L : 76,
    M : 77,
    N : 78,
    O : 79,
    P : 80,
    Q : 81,
    R : 82,
    S : 83,
    T : 84,
    U : 85,
    V : 86,
    W : 87,
    X : 88,
    Y : 89,
    Z : 90,

    LastKeyCode: 222
}

// Previous key state
let mKeyPreviousState = []; // a new array
// The pressed keys.
let  mIsKeyPressed = [];
// Click events: once an event is set, it will remain there until polled
let  mIsKeyClicked = [];

function keyboardInit() {
    let i;
    for (i = 0; i < keys.LastKeyCode; i++) {
        mIsKeyPressed[i] = false;
        mKeyPreviousState[i] = false;
        mIsKeyClicked[i] = false;
    }

    // register handlers 
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('keydown', onKeyDown);
}

function keyboardUpdate() {
    let i;
    for (i = 0; i < keys.LastKeyCode; i++) {
        mIsKeyClicked[i] = (!mKeyPreviousState[i]) && mIsKeyPressed[i];
        mKeyPreviousState[i] = mIsKeyPressed[i];
    }
}

// Function for GameEngine programmer to test if a key is pressed down
function isKeyPressed(keyCode) {
    return mIsKeyPressed[keyCode];
}

function isKeyClicked(keyCode) {
    return mIsKeyClicked[keyCode];
}

// CONTROLLER FUNCTIONS ********************************************************************************************************

const buttons = {
    // letter buttons
    A: 0,
    B: 1,
    X: 2,
    Y: 3,
    // bumper buttons (above triggers)
    LeftBumper: 4,
    RightBumper: 5,
    // trigger buttons (move this into its own array later)
    LeftTrigger: 6,
    RightTrigger: 7,
    // control buttons
    Back: 8,
    Start: 9,
    // joysticks can be pressed inwards
    LeftJoystickButton: 10,
    RightJoystickButton: 11,
    // plus pad
    PlusPadUp: 12,
    PlusPadDown: 13,
    PlusPadLeft: 14,
    PlusPadRight: 15,


    LastButtonCode: 15
}

// left = 0 and right = 1 is a convention for development sake
const joysticks = {
    Left: 0,
    Right: 1
}

// joystick data is an array of length 4
// private enum so developers do not confuse which index is which joystick
const joysticks_private = {
    LeftX: 0,
    LeftY: 1,
    RightX: 2,
    RightY: 3,

    LastJoystickCode: 3
}

const triggers = {
    LeftTrigger: 6,
    RightTrigger: 7
}

let controllers = [];

// NOTE: all below arrays will be MULTI-DIMENSIONAL
// previous state for buttons
let mButtonPreviousState = [];
// if button is currently being pressed
let  mIsButtonPressed = [];
// if button was clicked that frame
let  mIsButtonClicked = [];
// if button was released that frame
let mIsButtonReleased = [];
// x y positions of the joysticks
let mJoystickState =  [];

// number of controllers
let mNumControllers = 0;

function controllerInit() {
    for (let i = 0; i < 4; i++) {
        mIsButtonPressed[i] = [];
        mIsButtonClicked[i] = [];
        mIsButtonReleased[i] = [];
        mJoystickState[i] = [];
        mButtonPreviousState[i] = [];
    }


    window.addEventListener("gamepadconnected", (e) => {
        console.log(e.gamepad.id + " connected");

        // init all arrs for this controller
        let buttonPressedArr = [];
        let buttonClickedArr = [];
        let buttonReleaseArr = [];
        let joystickStateArr = [];
        let previousStateArr = [];

        // base population for arrs for this controller
        for (let i = 0; i <= buttons.LastButtonCode; i++) {
            buttonPressedArr[i] = false;
            buttonClickedArr[i] = false;
            buttonReleaseArr[i] = false;
            previousStateArr[i] = false;
        }
        for (let i = 0; i <= joysticks_private.LastJoystickCode; i++) {
            joystickStateArr[i] = 0;
        }

        // insert arrs into multi-dimensional arr
        mIsButtonPressed[e.index] = buttonPressedArr;
        mIsButtonClicked[e.index] = buttonClickedArr;
        mIsButtonReleased[e.index] = buttonReleaseArr;
        mJoystickState[e.index] = joystickStateArr;
        mButtonPreviousState[e.index] = previousStateArr;
        mNumControllers++;
    });
    window.addEventListener("gamepaddisconnected", (e) => {
        console.log(e.gamepad.id + " disconnected");
        
        // remove all entries for this controller
        mIsButtonPressed[e.index] = [];
        mIsButtonClicked[e.index] = [];
        mIsButtonReleased[e.index] = [];
        mJoystickState[e.index] = [];
        mButtonPreviousState[e.index] = [];

        mNumControllers--;
    });
}

function controllerUpdate() {
    // get controller data every tick
    controllers = navigator.getGamepads();
    // loop supports 4 controllers, arrays only support 1 controller
    // implementation can be extended to multiple controllers by adding multi-dimensional arrays
    for (let i = 0; i < controllers.length; i++) {
        if (controllers[i] == null) {
            continue;
        }
        // get all controller state data
        for (let j = 0; j < controllers[i].buttons.length; j++) {
            mIsButtonPressed[i][j] = controllers[i].buttons[j].pressed; // button pressed

            mIsButtonClicked[i][j] = (!mButtonPreviousState[i][j]) && mIsButtonPressed[i][j]; // button clicked
            mIsButtonReleased[i][j] = mButtonPreviousState[i][j] && !mIsButtonPressed[i][j]; // button released MUST be saved HERE or else previousState and isPressed will NEVER line up!!
            mButtonPreviousState[i][j] = mIsButtonPressed[i][j]; // previous state
        }
        // get all controller joystick data
        for (let j = 0; j <= joysticks_private.LastJoystickCode; j++) {
            mJoystickState[i][j] = controllers[i].axes[j];
        }
    }
}

function getNumControllers() {
    return mNumControllers;
}

function isButtonPressed(index, buttonCode) {
    if (getNumControllers() == 0) {
        return null;
    }
    if (index >= getNumControllers()) {
        return null;
    }
    return mIsButtonPressed[index][buttonCode];
}

function isButtonClicked(index, buttonCode) {
    if (getNumControllers() == 0) {
        return null;
    }
    if (index >= getNumControllers()) {
        return null;
    }
    return mIsButtonClicked[index][buttonCode];
}

function isButtonReleased(index, buttonCode) {
    if (getNumControllers() == 0) {
        return null;
    }
    if (index >= getNumControllers()) {
        return null;
    }
    return mIsButtonReleased[index][buttonCode];
}

function isJoystickActive(index, joystickCode) {
    let x = getJoystickPosX(index, joystickCode);
    let y = getJoystickPosY(index, joystickCode);
    // padding is needed because analog joysticks can never be 0 exactly
    if (
        x > 0.75 ||
        x < -0.75 ||
        y > 0.75 ||
        y < -0.75
    ) {
        return true;
    }
    return false;
}

function getJoystickPosX(index, joystickCode) {
    if (getNumControllers() == 0) {
        return null;
    }
    if (index >= getNumControllers()) {
        return null;
    }
    let val = 0;
    if (joystickCode == 0) {
        val = mJoystickState[index][joysticks_private.LeftX]
    } else if (joystickCode == 1) {
       val =  mJoystickState[index][joysticks_private.RightX];
    }
    return val;
}

function getJoystickPosY(index, joystickCode) {
    if (getNumControllers() == 0) {
        return null;
    }
    if (index >= getNumControllers()) {
        return null;
    }
    let val = 0;
    if (joystickCode == 0) {
        val = mJoystickState[index][joysticks_private.LeftY]
    } else if (joystickCode == 1) {
       val =  mJoystickState[index][joysticks_private.RightY];
    }
    return -val;
}


export {
    init, cleanUp, update, 
    
    keys,
    isKeyClicked,
    isKeyPressed,

    buttons,
    joysticks,
    isButtonClicked,
    isButtonPressed,
    isButtonReleased,
    isJoystickActive,
    getJoystickPosX,
    getJoystickPosY,
    getNumControllers
}
