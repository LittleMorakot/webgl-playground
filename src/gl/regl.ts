import { GLState } from './state/state';

export type REGL = any;

function _moduleLoader<ModType> (_:(regl, requireREGL:REGLLoader) => ModType) : ModType {
    return <ModType><any>void 0;
}

export interface REGLProfileData {
    count:number;
    cpuTime:number;
    gpuTime:number;
}

export interface REGLLoader {
    require:typeof _moduleLoader;
    profile:(name:string, opts:any) => (x?:any, y?:any, z?:any) => void;
    cache:(
        name:string,
        flags:{ [symbol:string]:(state:GLState) => boolean},
        commandSpec:any) => (state:GLState) => (args:any) => void;
    stats:() => { [name:string]:REGLProfileData };
    floatBuffer:{
        type:string;
        filter:string;
    };
}

export function createREGLCache(regl, profile:boolean) : REGLLoader {
    const definitionCache:any[] = [];
    const valueCache:any[] = [];

    const commandCache:{ [id:string]:any[] } = {};

    let type = 'half float';
    let filter = 'linear';
    if (regl.hasExtension('OES_texture_half_float')) {
        if (!regl.hasExtension('OES_texture_half_float_linear')) {
            filter = 'nearest';
        }
    } else if (regl.hasExtension('OES_texture_float')) {
        type = 'float';
        if (!regl.hasExtension('OES_texture_float_linear')) {
            filter = 'nearest';
        }
    } else {
        type = 'uint8';
    }

    // check that framebuffer configuration is renderable
    // on some phones they say half float is supported, but they really aren't
    if (type !== 'uint8') {
        const gl:WebGLRenderingContext = regl._gl;
        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        const color = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, color);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, (type === 'float' ? gl.FLOAT : 0x8D61), null);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, color, 0);
        if (gl.getError() || gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            type = 'uint8';
            filter = 'linear';
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.deleteFramebuffer(fbo);
        gl.deleteTexture(color);
        regl._refresh();
    }

    const loader:REGLLoader = {
        profile:(name, opts) => {
            const cmd = regl(Object.assign({ profile }, opts));
            commandCache[name] = [cmd];
            return cmd;
        },
        cache:cacheCommand,
        require:requireModule,
        stats:() => {
            const result:{ [id:string]:REGLProfileData } = {};
            Object.keys(commandCache).map((key) => {
                const commands = commandCache[key];
                const x = {
                    count: 0,
                    cpuTime: 0,
                    gpuTime: 0,
                };
                for (let i = 0; i < commands.length; ++i) {
                    x.count += commands[i].stats.count;
                    x.cpuTime += commands[i].stats.cpuTime;
                    x.gpuTime += commands[i].stats.gpuTime;
                }
                result[key] = x;
            });
            return result;
        },
        floatBuffer: {
            type,
            filter,
        },
    };

    function cacheCommand (
        name:string,
        flags:{ [symbol:string]:(state:GLState) => boolean },
        commandSpec:any,
        onFail?:(state:GLState) => void) {
        const commandList:any[] = [];
        let baseFrag = commandSpec.frag;
        const baseVert = commandSpec.vert;

        if (regl.hasExtension('OES_standard_derivatives')) {
            baseFrag = '#extension GL_OES_standard_derivatives : enable\n' + baseFrag;
        }
        if (regl.hasExtension('EXT_shader_texture_lod')) {
            baseFrag = '#extension GL_EXT_shader_texture_lod : enable\n' + baseFrag;
        }

        commandCache[name] = commandList;

        const flagSymbol = Object.keys(flags);
        const flagTest = flagSymbol.map((sym) => flags[sym]);
        const numFlags = flagSymbol.length;
        const flagCache = new Array(1 << numFlags);

        function generatePrefix (code:number) {
            const result:string[] = [];
            for (let i = 0; i < flagSymbol.length; ++i) {
                if (code & (1 << i)) {
                    result.push(`#define ${flagSymbol[i]} 1`);
                }
            }
            return result.join('\n') + '\n';
        }

        function generateCommand (code:number) {
            const cmd = regl({
                ...commandSpec,
                frag: generatePrefix(code) + baseFrag,
                vert: generatePrefix(code) + baseVert,
                profile,
            });
            flagCache[code] = cmd;
            commandList.push(cmd);
            return cmd;
        }

        function getCommand (state:GLState) {
            let code = 0;
            for (let i = 0; i < flagTest.length; ++i) {
                if ((flagTest[i])(state)) {
                    code |= 1 << i;
                }
            }
            return flagCache[code] || generateCommand(code);
        }

        return getCommand;
    }

    function requireModule<ModuleType> (
        moduleDefinition:(regl:REGL, requireRegl:REGLLoader) => ModuleType) : ModuleType {
        const idx = definitionCache.indexOf(moduleDefinition);
        if (idx >= 0) {
            return valueCache[idx];
        }
        const moduleValue = moduleDefinition(regl, loader);
        definitionCache.push(moduleDefinition);
        valueCache.push(moduleValue);
        return moduleValue;
    }

    return loader;
}