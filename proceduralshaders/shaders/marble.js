function get3DSource() {
    return {
        vertex: `
attribute vec4 a_position;
attribute vec3 a_normal;

uniform mat4 u_matrix;

varying vec3 v_position;
varying vec3 v_normal;

void main() {
    gl_Position = u_matrix * a_position;
    v_normal = a_normal;
    v_position = a_position.xyz;
}        
        `,
        fragment: `
precision mediump float;

float PI = 3.14159;

varying vec3 v_position;
varying vec3 v_normal;

uniform vec3 u_light;
uniform vec4 u_color;
uniform vec3 u_view;

float ambientStrength = .01;
vec3 ambientColor = vec3(1., 1., 1.);

float lightStrength = 6.;
vec3 lightColor = vec3(1., 1., 1.);

float specularity = .4;
float roughness = .1;
float reflectance = .31;

float random (vec3 xyz) {
    return fract(sin(dot(xyz,
                         vec3(12.9898,78.233,68.213)))*
        43758.5453123);
}

vec3  hash3( vec3 p ) {
	p = vec3( dot(p, vec3(127.1, 311.7, 248.5)),
		      dot(p, vec3(267.1, 157.6, 348.1)),
		      dot(p, vec3(197.7, 243.8, 149.3))  );
	return fract(sin(p)*43758.5453);
}

// 3-D scalar noise
float noise(vec3 xyz) {
	vec3 i = floor(xyz);
	vec3 fr = fract(xyz);
	vec3 u = fr * fr * (3. - 2. * fr);
	
	float a = random(i);
	float b = random(i + vec3(1.,0.,0.));
	float c = random(i + vec3(0.,1.,0.));
	float d = random(i + vec3(1.,1.,0.));
	float e = random(i + vec3(0.,0.,1.));
	float f = random(i + vec3(1.,0.,1.));
	float g = random(i + vec3(0.,1.,1.));
	float h = random(i + vec3(1.,1.,1.));
	
	float ab = mix(a, b, u.x);
	float cd = mix(c, d, u.x);
	float abcd = mix(ab, cd, u.y);
	
	float ef = mix(e, f, u.x);
	float gh = mix(g, h, u.x);
	float efgh = mix(ef, gh, u.y);
	
	float abcdefgh = mix(abcd, efgh, u.z);
	
	float dir = mix(.5,abcdefgh,.5);
	
	return dir;
}

// 3-D vector noise
vec3 noise3(vec3 xyz) {
	vec3 i = floor(xyz);
	vec3 fr = fract(xyz);
	vec3 u = fr * fr * (3. - 2. * fr);
	
	vec3 a = hash3(i);
	vec3 b = hash3(i + vec3(1.,0.,0.));
	vec3 c = hash3(i + vec3(0.,1.,0.));
	vec3 d = hash3(i + vec3(1.,1.,0.));
	vec3 e = hash3(i + vec3(0.,0.,1.));
	vec3 f = hash3(i + vec3(1.,0.,1.));
	vec3 g = hash3(i + vec3(0.,1.,1.));
	vec3 h = hash3(i + vec3(1.,1.,1.));
	
	vec3 ab = mix(a, b, u.x);
	vec3 cd = mix(c, d, u.x);
	vec3 abcd = mix(ab, cd, u.y);
	
	vec3 ef = mix(e, f, u.x);
	vec3 gh = mix(g, h, u.x);
	vec3 efgh = mix(ef, gh, u.y);
	
	vec3 abcdefgh = mix(abcd, efgh, u.z);
	
	vec3 dir = mix(vec3(.5),abcdefgh,.5);
	
	return dir;
}

// Fractal Brownian Motion Noise
float fbm(vec3 xyz) {
	float y = 0.;
	
	const int octaves = 16;
	float lacunarity = 2.;
	float gain = .5;
	
	float amplitude = .5;
	float frequency = 1.;
	
	for (int i = 0; i < octaves; i++) {
		y += amplitude * noise(frequency * xyz);
		frequency *= lacunarity;
		amplitude *= gain;
	}
	
	return y;
}

// Fractal Brownian Motion Vector Noise
vec3 fbm3(vec3 xyz) {
	vec3 y = vec3(0.);
	
	const int octaves = 16;
	float lacunarity = 2.;
	float gain = .5;
	
	float amplitude = .5;
	float frequency = 1.;
	
	for (int i = 0; i < octaves; i++) {
		y += amplitude * noise3(frequency * xyz);
		frequency *= lacunarity;
		amplitude *= gain;
	}
	
	return y;
}

float ggx(vec3 N, vec3 H, float a) {
    float a2 = a*a;
    float NdotH = max(dot(N,H), 0.);
    float NdotH2 = NdotH * NdotH;
    float d = NdotH2 * (a2-1.) + 1.;
    float denom = PI * d * d;
    return a2 / denom;
}

float gg(vec3 N, vec3 V, float k) {
    float NV = max(dot(N,V), .00001);
    return NV / mix(1., NV, k);
}

float g(vec3 N, vec3 V, vec3 L, float k) {
    return gg(N, V, k) * gg(N, L, k);
}

float fresnel(vec3 H, vec3 V, float f0) {
    float HV = max(dot(H,V),0.);
    float x = pow(1.-HV, 5.);
    return f0 + (1.-f0)*x;
}

void main() {
    vec3 white = vec3(1.,1.,1.);
    vec3 blue = vec3(0.,0.,.1);
    
    vec3 distortion = 2. * (fbm3(2. * v_position) - vec3(1.));
    float noiseTexture = fbm(15. * distortion);
    noiseTexture = smoothstep(.2, .58, noiseTexture);
    vec3 COLOR = mix(blue, white, noiseTexture);
    
    vec3 bump = .02 * 2. * (fbm3(15. * v_position)-vec3(1.));
    
    vec3 normal = normalize(v_normal + bump);
    vec3 lightDir = normalize(u_light);
    
    float light = max(dot(normal, lightDir), 0.);
    vec3 viewDir = normalize(u_view-v_position);
    vec3 reflectDir = reflect(-lightDir, normal);
    vec3 halfN = normalize(viewDir+lightDir);
    
    float wout = max(dot(viewDir,normal), .0001);
    float win = max(dot(lightDir,normal), .0001);
    
    float distr = ggx(normal, halfN, roughness);
    
    float k = roughness * roughness / 2.;
    float geo = g(normal, viewDir, lightDir, k);
    float fres = fresnel(halfN, viewDir, reflectance);
    float spec = distr * geo * fres / 4. / wout / win;
    
    vec3 AMBIENT = ambientStrength * ambientColor * COLOR;
    vec3 DIFFUSE = lightStrength * light * lightColor * COLOR / PI;
    vec3 SPECULAR = lightStrength * light * spec * lightColor;
    vec3 OUT = AMBIENT + mix(DIFFUSE, SPECULAR, specularity);
    
    OUT = OUT / (OUT + vec3(1.));
    OUT = pow(OUT, vec3(1./2.2));
    
    gl_FragColor = vec4(OUT, 1.);
}
        `
    }; 
}
