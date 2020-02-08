// port from GLSL code base on https://github.com/ashima/webgl-noise/blob/master/src/noise2D.glsl

//JS SNOISE PORT

export function snoise2d(x, y) {

    let C0 = 0.211324865405187;
    let C1 = -0.577350269189626;
    const C2 = 1.79284291400159;
    const OVER_289 = 1 / 289;

    let tmp = (x + y) * 0.366025403784439;
    let i_0 = Math.floor(x + tmp);
    let a0_0 = Math.floor(y + tmp);

    tmp = (i_0 + a0_0) * C0;
    const x0_0 = x - i_0 + tmp;
    const x0_1 = y - a0_0 + tmp;

    const t_0 = x0_0 > x0_1 ? 1 : 0;
    const t_1 = 1 - t_0;

    const x12_0 = x0_0 + C0 - t_0;
    const x12_1 = x0_1 + C0 - t_1;
    const x12_2 = x0_0 + C1;
    const x12_3 = x0_1 + C1;

    i_0 -= Math.floor(i_0 * OVER_289) * 289;
    a0_0 -= Math.floor(a0_0 * OVER_289) * 289;

    tmp = 0;
    C0 = 0.024390243902439;
    C1 = 0.85373472095314;

    let m = .5 - x12_0 * x12_0 - x12_1 * x12_1;
    if (m > 0) {
        let a0_1 = a0_0 + t_1;
        a0_1 *= (a0_1 * 34) + 1;
        a0_1 = (a0_1 - Math.floor(a0_1 * OVER_289) * 289) + i_0 + t_0;
        a0_1 *= (a0_1 * 34) + 1;
        a0_1 = (a0_1 - Math.floor(a0_1 * OVER_289) * 289) * C0;
        a0_1 = (a0_1 - Math.floor(a0_1)) * 2 - 1;
        const h_1 = Math.abs(a0_1) - 0.5;
        a0_1 = a0_1 - Math.floor(a0_1 + 0.5);
        tmp += (m * m * m * m) * (C2 - C1 * (a0_1 * a0_1 + h_1 * h_1)) * (a0_1 * x12_0 + h_1 * x12_1);
    }

    m = .5 - x12_2 * x12_2 - x12_3 * x12_3;
    if (m > 0) {
        let a0_2 = a0_0 + 1;
        a0_2 *= (a0_2 * 34) + 1;
        a0_2 = (a0_2 - Math.floor(a0_2 * OVER_289) * 289) + i_0 + 1;
        a0_2 *= (a0_2 * 34) + 1;
        a0_2 = (a0_2 - Math.floor(a0_2 * OVER_289) * 289) * C0;
        a0_2 = (a0_2 - Math.floor(a0_2)) * 2 - 1;
        const h_2 = Math.abs(a0_2) - 0.5;
        a0_2 = a0_2 - Math.floor(a0_2 + 0.5);
        tmp += (m * m * m * m) * (C2 - C1 * (a0_2 * a0_2 + h_2 * h_2)) *  (a0_2 * x12_2 + h_2 * x12_3);
    }

    m = .5 - x0_0 * x0_0 - x0_1 * x0_1;
    if (m > 0) {
        a0_0 *= (a0_0 * 34) + 1;
        a0_0 = (a0_0 - Math.floor(a0_0 * OVER_289) * 289) + i_0;
        a0_0 *= (a0_0 * 34) + 1;
        a0_0 = (a0_0 - Math.floor(a0_0 * OVER_289) * 289) * C0;
        a0_0 = (a0_0 - Math.floor(a0_0)) * 2 - 1;
        const h_0 = Math.abs(a0_0) - 0.5;
        a0_0 = a0_0 - Math.floor(a0_0 + 0.5);
        tmp += (m * m * m * m) * (C2 - C1 * (a0_0 * a0_0 + h_0 * h_0)) * (a0_0 * x0_0 + h_0 * x0_1);
    }

    return tmp * 130;
}