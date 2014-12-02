var Shader = require("./shader");
var Runtime = require("../runtime/src/runtime");

var Program = function() {

    this.vertexShader = null;
    this.fragmentShader = null;

    this._linkerResult = null;
    this._programCode = null;
}

Program.prototype = {
    constructor: Program,

    // Public

    shaderWithType: function(type)
    {
        if (type === GLSL.Shader.Type.Vertex)
            return this.vertexShader;

        if (type === GLSL.Shader.Type.Fragment)
            return this.fragmentShader;

        console.assert("Unknown shader type requested: ", type);
    },

    // This will replace the existing vertex or fragment shader with a new shader.
    insertShader: function(shader)
    {
        console.assert(shader !== this.vertexShader && shader !== this.fragmentShader, "Already added shader to program", this);
        if (shader.type === Shader.Type.Fragment)
            this.fragmentShader = shader;
        else if (shader.type === Shader.Type.Vertex)
            this.vertexShader = shader;

        this._linkerResult = false;
        this._programCode = null;
    },

    runWithEnvironment: function(env)
    {
        if (!this.vertexShader)
            throw new Error("Couldn't run shader program: no vertex shader specified.");

        if (!this.vertexShader.typecheck())
            throw new Error("Couldn't run shader program: typechecking failed for vertex shader program.");

        if (!this.fragmentShader)
            throw new Error("Couldn't run shader program: no fragment shader specified.");

        if (!this.fragmentShader.typecheck())
            throw new Error("Couldn't run shader program: typechecking failed for fragment shader program.");

        if (!this._linkerResult)
            this._linkShaders();

        if (!this._linkerResult)
            throw new Error("Couldn't run shader program: linking failed.");

        if (!this._validateEnvironment(env))
            throw new Error("Couldn't run shader program: environment validation failed.");

        // TODO: these should be glued together with a "program" executable, which
        // handles rasterization etc.
        // TODO: Maybe we want a different entry point to run only one shader, or provide a dummy.

        var vertexExecutable = this.vertexShader.executable;
        vertexExecutable.call(null, GLSL, env);

        var fragmentExecutable = this.fragmentShader.executable;
        fragmentExecutable.call(null, GLSL, env);
    },

    // Private

    _validateEnvironment: function(env)
    {
        console.assert(env instanceof Environment, env);
        // TODO: check environment for necessary shader inputs

        return true;
    },

    _linkShaders: function()
    {
        // TODO: check that inputs and outputs match between vertex and fragment shader

        return true;
    }
};

module.exports = Program;