/// function from: https://dannywoodz.wordpress.com/2014/12/16/webgl-from-scratch-loading-a-mesh/

function loadMeshData(string) {
    var lines = string.split("\n");
    
    var data = {
        vertices: [],
        uvs: [],
        normals: [],
        tangents: [],
        
        vertexlist: [],
        uvlist: [],
        normallist: []
    }   
    
    for (var i=0; i<lines.length; i++) {
        var parts = lines[i].trimRight().split(' ');
        if (parts.length == 0) continue;
        
        switch(parts[0])
        {
            case 'v': 
                data.vertexlist.push(
                    [
                        parseFloat(parts[1]),
                        parseFloat(parts[2]),
                        parseFloat(parts[3])
                    ]);
                break;
            
            case 'vt':
                data.uvlist.push(
                    [
                        parseFloat(parts[1]),
                        parseFloat(parts[2])
                    ]);
                break;
            
            case 'vn': 
                data.normallist.push(
                    [
                        parseFloat(parts[1]),
                        parseFloat(parts[2]),
                        parseFloat(parts[3])
                    ]);
                break;
            
            case 'f':
                processFace(data, parts);
                break;
            
        }    
    }
    
    var vertexCount = data.vertices.length / 3;
    
    return {
        primitiveType: 'TRIANGLES',
        vertices: new Float32Array(data.vertices),
        uvs: new Float32Array(data.uvs),
        normals: new Float32Array(data.normals), 
        tangents: new Float32Array(data.tangents),
        vertexCount: vertexCount        
    };
}

function processFace(data, parts) {
    var f1 = parts[1].split('/');
    var f2 = parts[2].split('/');
    var f3 = parts[3].split('/');
    var f4 = parts[4].split('/');
    
    //quads
    processTriangle(data, f1, f2, f3);
    processTriangle(data, f1, f3, f4);
       
}

function processTriangle(data, f1, f2, f3) {
    
    var tangent = calculateTangent(data, f1, f2, f3);
    
    //vertices
    Array.prototype.push.apply(
        data.vertices, data.vertexlist[parseInt(f1[0])-1]
    );
    Array.prototype.push.apply(
        data.vertices, data.vertexlist[parseInt(f2[0])-1]
    );
    Array.prototype.push.apply(
        data.vertices, data.vertexlist[parseInt(f3[0])-1]
    );
    
    //uvs
    Array.prototype.push.apply(
        data.uvs, data.uvlist[parseInt(f1[1])-1]
    );
    Array.prototype.push.apply(
        data.uvs, data.uvlist[parseInt(f2[1])-1]
    );
    Array.prototype.push.apply(
        data.uvs, data.uvlist[parseInt(f3[1])-1]
    );
    
    //normals
    Array.prototype.push.apply(
        data.normals, data.normallist[parseInt(f1[2])-1]
    );
    Array.prototype.push.apply(
        data.normals, data.normallist[parseInt(f2[2])-1]
    );
    Array.prototype.push.apply(
        data.normals, data.normallist[parseInt(f3[2])-1]
    );   
    
    //tangents
    Array.prototype.push.apply(
        data.tangents, tangent
    );
    Array.prototype.push.apply(
        data.tangents, tangent
    );
    Array.prototype.push.apply(
        data.tangents, tangent
    );   
}

function calculateTangent(data, f1, f2, f3) {
    var v1 = data.vertexlist[parseInt(f1[0])-1];
    var v2 = data.vertexlist[parseInt(f2[0])-1];
    var v3 = data.vertexlist[parseInt(f3[0])-1];
    var uv1 = data.uvlist[parseInt(f1[1])-1];
    var uv2 = data.uvlist[parseInt(f2[1])-1];
    var uv3 = data.uvlist[parseInt(f3[1])-1];
    
    var x1 = v2[0] - v1[0];
    var x2 = v3[0] - v1[0];
    var y1 = v2[1] - v1[1];
    var y2 = v3[1] - v1[1];
    var z1 = v2[2] - v1[2];
    var z2 = v3[2] - v1[2];
    
    var s1 = uv2[0] - uv1[0];
    var s2 = uv3[0] - uv1[0];
    var t1 = uv2[1] - uv1[1];
    var t2 = uv3[1] - uv1[1];
    
    var r = 1.0 / (s1 * t2 - s2 * t1);
    
    return [(t2 * x1 - t1 * x2) * r,
            (t2 * y1 - t1 * y2) * r,
            (t2 * z1 - t1 * z2) * r];    
}