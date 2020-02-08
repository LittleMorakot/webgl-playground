
function mod289(x:number) {
    return x - Math.floor(x * (1 / 289)) * 289;
}

function permute(x:number) {
    return mod289(((x * 34.0) + 1.0) * x);
}

function taylorInvSqrt(r:number) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

export function snoise(v_0:number, v_1:number, v_2:number) {
    const C_0 = 1 / 6;
    const C_1 = 1 / 3;

    const D_0 = 0;
    const D_1 = .5;
    const D_2 = 1;
    const D_3 = 2;

    // First corner

    const dot_v_C_111 = v_0 * C_1 * v_1 * C_1 * v_2 * C_1;

    let i_0 = Math.floor(v_0 + dot_v_C_111);
    let i_1 = Math.floor(v_1 + dot_v_C_111);
    let i_2 = Math.floor(v_1 + dot_v_C_111);

    const x0_0 = v_0 - i_0 + i_0 * C_0;
    const x0_1 = v_1 - i_1 + i_1 * C_0;
    const x0_2 = v_2 - i_2 + i_2 * C_0;

    // Other corners

    const g_0 = x0_1 > x0_0 ? 0 : 1;
    const g_1 = x0_2 > x0_1 ? 0 : 1;
    const g_2 = x0_0 > x0_2 ? 0 : 1;

    const l_0 = 1 - g_0;
    const l_1 = 1 - g_1;
    const l_2 = 1 - g_2;

    const i1_0 = g_0 > l_0 ? l_0 : g_0;
    const i1_1 = g_1 > l_1 ? l_1 : g_1;
    const i1_2 = g_2 > l_2 ? l_2 : g_2;

    const i2_0 = g_0 > l_0 ? g_0 : l_0;
    const i2_1 = g_1 > l_1 ? g_1 : l_1;
    const i2_2 = g_2 > l_2 ? g_2 : l_2;

    const x1_0 = x0_0 - i1_0 + C_0;
    const x1_1 = x0_1 - i1_1 + C_0;
    const x1_2 = x0_2 - i1_2 + C_0;

    const x2_0 = x0_0 - i2_0 + C_1;
    const x2_1 = x0_1 - i2_1 + C_1;
    const x2_2 = x0_2 - i2_2 + C_1;

    const x3_0 = x0_0 - D_1;
    const x3_1 = x0_1 - D_1;
    const x3_2 = x0_2 - D_1;

    // Permutations
    i_0 = mod289(i_0);
    i_1 = mod289(i_1);
    i_2 = mod289(i_2);

    const p_0 = permute( permute( permute( i_2 + 0) + i_1 + 0) + i_0 + 0);
    const p_1 = permute( permute( permute( i_2 + i1_2) + i_1 + i1_1) + i_0 + i1_0);
    const p_2 = permute( permute( permute( i_2 + i2_2) + i_1 + i2_2) + i_0 + i2_0);
    const p_3 = permute( permute( permute( i_2 + 1) + i_1 + 1) + i_0 + 1);

    // Gradients: 7x7 points over a square, mapped onto an octahedron.
    // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
    const n_ = 0.142857142857; // 1.0/7.0

    const ns_0 = n_ * D_3 - D_0;
    const ns_1 = n_ * D_1 - D_2;
    const ns_2 = n_ * D_2 - D_0;

    const j_0 = p_0 - 49 * Math.floor(p_0 * ns_2 * ns_2);
    const j_1 = p_0 - 49 * Math.floor(p_1 * ns_2 * ns_2);
    const j_2 = p_0 - 49 * Math.floor(p_2 * ns_2 * ns_2);
    const j_3 = p_0 - 49 * Math.floor(p_3 * ns_2 * ns_2);

    const x__0 = Math.floor(j_0 * ns_2);
    const x__1 = Math.floor(j_1 * ns_2);
    const x__2 = Math.floor(j_2 * ns_2);
    const x__3 = Math.floor(j_3 * ns_2);

    const y__0 = Math.floor(j_0 - 7 * x__0);
    const y__1 = Math.floor(j_1 - 7 * x__1);
    const y__2 = Math.floor(j_2 - 7 * x__2);
    const y__3 = Math.floor(j_3 - 7 * x__3);

    const x_0 = x__0 * ns_0 + ns_1;
    const x_1 = x__1 * ns_0 + ns_1;
    const x_2 = x__2 * ns_0 + ns_1;
    const x_3 = x__3 * ns_0 + ns_1;

    const y_0 = y__0 * ns_0 + ns_1;
    const y_1 = y__1 * ns_0 + ns_1;
    const y_2 = y__2 * ns_0 + ns_1;
    const y_3 = y__3 * ns_0 + ns_1;

    const h_0 = 1 - Math.abs(x_0) - Math.abs(y_0);
    const h_1 = 1 - Math.abs(x_1) - Math.abs(y_1);
    const h_2 = 1 - Math.abs(x_2) - Math.abs(y_2);
    const h_3 = 1 - Math.abs(x_3) - Math.abs(y_3);

    const b0_0 = x_0;
    const b0_1 = x_1;
    const b0_2 = y_0;
    const b0_3 = y_1;

    const b1_0 = x_2;
    const b1_1 = x_3;
    const b1_2 = y_2;
    const b1_3 = y_3;

    const s0_0 = Math.floor(b0_0) * 2 + 1;
    const s0_1 = Math.floor(b0_1) * 2 + 1;
    const s0_2 = Math.floor(b0_2) * 2 + 1;
    const s0_3 = Math.floor(b0_3) * 2 + 1;

    const s1_0 = Math.floor(b1_0) * 2 + 1;
    const s1_1 = Math.floor(b1_1) * 2 + 1;
    const s1_2 = Math.floor(b1_2) * 2 + 1;
    const s1_3 = Math.floor(b1_3) * 2 + 1;

    const sh_0 = -(h_0 > 0 ? 0 : 1);
    const sh_1 = -(h_1 > 0 ? 0 : 1);
    const sh_2 = -(h_2 > 0 ? 0 : 1);
    const sh_3 = -(h_3 > 0 ? 0 : 1);

    const a0_0 = b0_0 + s0_0 * sh_0;
    const a0_1 = b0_2 + s0_2 * sh_0;
    const a0_2 = b0_1 + s0_1 * sh_1;
    const a0_3 = b0_3 + s0_3 * sh_1;

    const a1_0 = b1_0 + s1_0 * sh_2;
    const a1_1 = b1_2 + s1_2 * sh_2;
    const a1_2 = b1_1 + s1_1 * sh_3;
    const a1_3 = b1_3 + s1_3 * sh_3;

    let p0_0 = a0_0;
    let p0_1 = a0_1;
    let p0_2 = h_0;

    let p1_0 = a0_2;
    let p1_1 = a0_3;
    let p1_2 = h_1;

    let p2_0 = a1_0;
    let p2_1 = a1_1;
    let p2_2 = h_2;

    let p3_0 = a1_2;
    let p3_1 = a1_3;
    let p3_2 = h_3;

    //Normalise gradients
    const dot_p0_p0 = p0_0 * p0_0 + p0_1 * p0_1 + p0_2 * p0_2;
    const dot_p1_p1 = p1_0 * p1_0 + p1_1 * p1_1 + p1_2 * p1_2;
    const dot_p2_p2 = p2_0 * p2_0 + p2_1 * p2_1 + p2_2 * p2_2;
    const dot_p3_p3 = p3_0 * p3_0 + p3_1 * p3_1 + p3_2 * p3_2;

    const norm_0 = taylorInvSqrt(dot_p0_p0);
    const norm_1 = taylorInvSqrt(dot_p1_p1);
    const norm_2 = taylorInvSqrt(dot_p2_p2);
    const norm_3 = taylorInvSqrt(dot_p3_p3);

    p0_0 *= norm_0;
    p0_1 *= norm_0;
    p0_2 *= norm_0;

    p1_0 *= norm_1;
    p1_1 *= norm_1;
    p1_2 *= norm_1;

    p2_0 *= norm_2;
    p2_1 *= norm_2;
    p2_2 *= norm_2;

    p3_0 *= norm_3;
    p3_1 *= norm_3;
    p3_2 *= norm_3;

    // Mix final noise value
    const dot_x0_x0 = x0_0 * x0_0 + x0_1 * x0_1 + x0_2 * x0_2;
    const dot_x1_x1 = x1_0 * x1_0 + x0_1 * x1_1 + x1_2 * x1_2;
    const dot_x2_x2 = x2_0 * x2_0 + x0_1 * x2_1 + x2_2 * x2_2;
    const dot_x3_x3 = x3_0 * x3_0 + x0_1 * x3_1 + x3_2 * x3_2;

    let m_0 = Math.max(0.6 - dot_x0_x0, 0);
    let m_1 = Math.max(0.6 - dot_x1_x1, 0);
    let m_2 = Math.max(0.6 - dot_x2_x2, 0);
    let m_3 = Math.max(0.6 - dot_x3_x3, 0);

    m_0 *= m_0;
    m_1 *= m_1;
    m_2 *= m_2;
    m_3 *= m_3;

    m_0 *= m_0;
    m_1 *= m_1;
    m_2 *= m_2;
    m_3 *= m_3;

    const dot_p0_x0 = p0_0 * x0_0 + p0_1 * x0_1 + p0_2 * x0_2;
    const dot_p1_x1 = p1_0 * x1_0 + p0_1 * x1_1 + p1_2 * x1_2;
    const dot_p2_x2 = p2_0 * x2_0 + p0_1 * x2_1 + p2_2 * x2_2;
    const dot_p3_x3 = p3_0 * x3_0 + p0_1 * x3_1 + p3_2 * x3_2;

    return 42 * m_0 * dot_p0_x0 + m_1 * dot_p1_x1 + m_2 * dot_p2_x2 + m_3 * dot_p3_x3;
}