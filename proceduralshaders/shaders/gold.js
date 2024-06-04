function get3DSource() {
    return {
        vertex: `
attribute vec4 a_position;
attribute vec2 a_uv;
attribute vec3 a_normal;

uniform mat4 u_matrix;

varying vec3 v_position;
varying vec2 v_uv;
varying vec3 v_normal;

void main() {
    gl_Position = u_matrix * a_position;
    v_normal = a_normal;
    v_uv = a_uv;
    v_position = a_position.xyz;
}        
        `,
        fragment: `
precision mediump float;
float PI = 3.14159;
        ` + pbr + `
varying vec3 v_position;
varying vec2 v_uv;
varying vec3 v_normal;

uniform vec3 u_light;
uniform vec4 u_color;
uniform vec3 u_view;

float ambientStrength = .01;
vec3 ambientColor = vec3(1., 1., 1.);

float lightStrength = 15.;
vec3 lightColor = vec3(1., 1., 1.);

float roughness = .2;
float metallic = 1.0;


void main() {
    vec3 COLOR = u_color.rgb;
    
    //COLOR = vec3(v_uv, 0.);
    
    vec3 normal = normalize(v_normal);
    vec3 lightDir = normalize(u_light);
    vec3 viewDir = normalize(u_view-v_position);
    
    vec3 AMBIENT = ambientStrength * ambientColor * COLOR;
    
    vec3 OUT = AMBIENT + pbr(normal, lightDir, viewDir, lightColor, lightStrength, COLOR, metallic, roughness);
    
    OUT = OUT / (OUT + vec3(1.));
    OUT = pow(OUT, vec3(1./2.2));
    
    gl_FragColor = vec4(OUT, 1.);
}
    `
    }; 
}

var pbr = `
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

vec3 fresnel(vec3 H, vec3 V, vec3 f0) {
    float HV = max(dot(H,V),0.);
    float x = pow(1.-HV, 5.);
    return f0 + (1.-f0)*x;
}

vec3 pbr(vec3 N, vec3 L, vec3 V, vec3 Lcolor, float Lstrength, vec3 albedo, float m, float a) {
    
    float light = max(dot(N, L), 0.);
    vec3 halfN = normalize(V+L);
    
    float wout = max(dot(V,N), .0001);
    float win = max(dot(L,N), .0001);
    
    float distr = ggx(N, halfN, a);
    
    float k = a * a / 2.;
    float geo = g(N, V, L, k);
    
    vec3 F0 = mix(vec3(.04), albedo, m);
    
    vec3 fres = fresnel(halfN, V, F0);
    vec3 spec = distr * geo * fres / 4. / wout / win;
    
    vec3 kS = fres;
    vec3 kD = (vec3(1.)-kS)*(1.-m);
    
    vec3 d = Lstrength * light * Lcolor * albedo / PI;
    vec3 s = Lstrength * light * spec * Lcolor;
    
    return kD * d + kS * s;
}
`
