import { vec3, vec4, mat4 } from 'gl-matrix';

function dotPlane (plane:vec4, x:number, y:number, z:number) {
    return (
        plane[0] * x +
        plane[1] * y +
        plane[2] * z +
        plane[3]) < 0;
}

export class Frustum {
    public planes:number[][] = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ];
    public points:vec3[] = [
        vec3.create(),
        vec3.create(),
        vec3.create(),
        vec3.create(),
        vec3.create(),
        vec3.create(),
        vec3.create(),
        vec3.create(),
    ];
    public matrix:mat4 = mat4.create();
    public invMatrix:mat4 = mat4.create();

    public bounds = [vec3.create(), vec3.create()];

    public setMatrix (m:mat4, minv?:mat4) {
        mat4.copy(this.matrix, m);
        if (minv) {
            mat4.copy(this.invMatrix, minv);
        } else {
            mat4.invert(this.invMatrix, m);
        }

        const frustumPoints = this.points;
        const loBounds = this.bounds[0];
        const hiBounds = this.bounds[1];
        loBounds[0] = loBounds[1] = loBounds[2] = Infinity;
        hiBounds[0] = hiBounds[1] = hiBounds[2] = -Infinity;
        for (let i = 0; i < 8; ++i) {
            const p = vec3.set(
                frustumPoints[i],
                i & 1 ? 1 : -1,
                i & 2 ? 1 : -1,
                i & 4 ? 1 : -1);
            vec3.transformMat4(p, p, this.invMatrix);
            vec3.min(loBounds, loBounds, p);
            vec3.max(hiBounds, hiBounds, p);
        }

        const frustumPlanes = this.planes;
        for (let d = 0; d < 3; ++d) {
            const p0 = frustumPlanes[2 * d];
            const p1 = frustumPlanes[2 * d + 1];
            for (let j = 0; j < 4; ++j) {
                const x = m[4 * j + d];
                const w = m[4 * j + 3];
                p0[j] = w - x;
                p1[j] = w + x;
            }
        }
    }

    public testBox (
        lox:number, loy:number, loz:number,
        hix:number, hiy:number, hiz:number) {
        const {
            planes,
            points,
        } = this;

        // it's asinine, but inlining this function speeds up
        for (let i = 0; i < 6; i++) {
            const pl = planes[i];
            const px = pl[0];
            const py = pl[1];
            const pz = pl[2];
            const pw = pl[3];
            if (px * lox + py * loy + pz * loz < -pw &&
                px * hix + py * loy + pz * loz < -pw &&
                px * lox + py * hiy + pz * loz < -pw &&
                px * hix + py * hiy + pz * loz < -pw &&
                px * lox + py * loy + pz * hiz < -pw &&
                px * hix + py * loy + pz * hiz < -pw &&
                px * lox + py * hiy + pz * hiz < -pw &&
                px * hix + py * hiy + pz * hiz < -pw) {
                return false;
            }
        }

        let out = 0;
        out = 0; for (let i = 0; i < 8; i++) { out += ((points[i][0] < lox) ? 1 : 0); } if (out === 8) { return false; }
        out = 0; for (let i = 0; i < 8; i++) { out += ((points[i][0] > hix) ? 1 : 0); } if (out === 8) { return false; }
        out = 0; for (let i = 0; i < 8; i++) { out += ((points[i][1] < loy) ? 1 : 0); } if (out === 8) { return false; }
        out = 0; for (let i = 0; i < 8; i++) { out += ((points[i][1] > hiy) ? 1 : 0); } if (out === 8) { return false; }
        out = 0; for (let i = 0; i < 8; i++) { out += ((points[i][2] < loz) ? 1 : 0); } if (out === 8) { return false; }
        out = 0; for (let i = 0; i < 8; i++) { out += ((points[i][2] > hiz) ? 1 : 0); } if (out === 8) { return false; }

        return true;
    }
}