#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

void main( void ) {

    vec2 p = -.5 + gl_FragCoord.xy / resolution.xy;
    p.x *= resolution.x/resolution.y;
    
    float angle = atan(p.y, p.x) * 2.0 + time * 5.0 + length(p);
    float color = (sin(length(p) * (atan(p.y, p.x) * sin(time) * 10.0 + time * 1.618) * (20.0) + 5.0 + time * 5.0) + 1.0) / 2.0;
    // float realColor = (1.0 - step(13.0, length(p) * 20.0)) * color;
    float realColor = color;
    float angular = sin(angle);

    gl_FragColor = vec4(realColor, 76.0 / 256.0 * realColor * angular, 0.0, 1.0);
}