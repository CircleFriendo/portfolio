var webgl = {


    createShader: function (gl, type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);  
    },

    createProgram: function (gl, vertexShader, fragmentShader) {
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        gl.detachShader(program, vertexShader);
        gl.deleteShader(vertexShader);
        gl.detachShader(program, fragmentShader);
        gl.deleteShader(fragmentShader);
        
        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            
            return program;
        }
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    },

    compileProgram: function(gl, source) {
        var vertexShader = this.createShader(gl, gl.VERTEX_SHADER, source.vertex);
        var fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, source.fragment);
        return this.createProgram(gl, vertexShader, fragmentShader);
    },

    resizeCanvasToDisplaySize: function (canvas) {
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;
        
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    },
    
    attribute: function (gl, program, name, size, data) {
        var location = gl.getAttribLocation(program, name);
        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        return {
            location: location,
            buffer: buffer,
            size: size
        };
    },
    
    initializeProgram: function (gl, program) {
        this.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        gl.useProgram(program);
    },
    
    bindAttribute: function (gl, attribute) {
        var type = gl.FLOAT;
        var normalize = false;
        var stride = 0;
        var offset = 0;
        
        gl.enableVertexAttribArray(attribute.location);
        gl.bindBuffer(gl.ARRAY_BUFFER, attribute.buffer);
        gl.vertexAttribPointer(attribute.location, attribute.size, type, normalize, stride, offset);
    },
    
    draw: function (gl, count) {
        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.drawArrays(primitiveType, offset, count);
    }
}