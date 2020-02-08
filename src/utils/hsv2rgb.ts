// based on http://www.kasperkamperman.com/blog/arduino/arduino-programming-hsb-to-rgb/
// which is based on http://www.codeproject.com/miscctrl/CPicker.asp
const TAU = Math.PI * 2;
const round = Math.round;
const min = Math.min;
const max = Math.max;
const ceil = Math.ceil;

function set(r, g, b, out) {
    out[0] = round(r * 255);
    out[1] = round(g * 255);
    out[2] = round(b * 255);
}

function clamp(v, l, u) {
    return max(l, min(v, u));
}

export function hsv2rgb(h:number, s:number, v:number, out?:number[]) {
    out = out || [0, 0, 0];
    h = h % 360;
    s = clamp(s, 0, 1);
    v = clamp(v, 0, 1);

    // Grey
    if (!s) {
        out[0] = out[1] = out[2] = ceil(v * 255);
    } else {
        const b = ((1 - s) * v);
        const vb = v - b;
        const hm = h % 60;
        switch ((h / 60) | 0) {
        case 0: set(v, vb * h / 60 + b, b, out); break;
        case 1: set(vb * (60 - hm) / 60 + b, v, b, out); break;
        case 2: set(b, v, vb * hm / 60 + b, out); break;
        case 3: set(b, vb * (60 - hm) / 60 + b, v, out); break;
        case 4: set(vb * hm / 60 + b, b, v, out); break;
        case 5: set(v, b, vb * (60 - hm) / 60 + b, out); break;
        }
    }
    return out;
}