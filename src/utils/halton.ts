export function halton (i_:number, b:number) {
    let f = 1;
    let r = 0;

    for (let i = i_; i > 0; i = (i / b) | 0) {
        f /= b;
        r += f * (i % b);
    }

    return r;
}