export enum Keys {
    Left = 0,
    Right = 1,
    Up = 2,
    Down = 3,
    Space = 4,
    Crouch = 5,
    LeftClick = 6,
    RightClick = 7,

    E = 8,
    R = 9,
    T = 10,
    F = 11,
    Q = 12,

    Esc = 13,

    Number1,
    Number2,
    Number3,
    Number4,
    Number5,
    Number6,
    Number7,
    Number8,
    Number9,
    Number0,

    KeyCount,
}

export const KeyBindings = {
    37: Keys.Left,
    65: Keys.Left,

    38: Keys.Up,
    87: Keys.Up,

    39: Keys.Right,
    68: Keys.Right,

    40: Keys.Down,
    83: Keys.Down,

    67: Keys.Crouch,
    32: Keys.Space,

    69: Keys.E,
    82: Keys.R,
    84: Keys.T,
    70: Keys.F,
    81: Keys.Q,

    48: Keys.Number0,
    49: Keys.Number1,
    50: Keys.Number2,
    51: Keys.Number3,
    52: Keys.Number4,
    53: Keys.Number5,
    54: Keys.Number6,
    55: Keys.Number7,
    56: Keys.Number8,
    57: Keys.Number9,
    27: Keys.Esc,
};