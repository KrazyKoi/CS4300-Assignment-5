import { default as gulls } from '../../gulls.js'
import { default as Mouse } from './mouse.js'

const sg = await gulls.init(),
      render_shader  = await gulls.import( './render.wgsl' ),
      compute_shader = await gulls.import( './compute.wgsl' )

Mouse.init()

const NUM_PARTICLES = 512, 
      NUM_PROPERTIES = 6, 
      state = new Float32Array( NUM_PARTICLES * NUM_PROPERTIES )

const lifetime = document.querySelector('#lifetime')
var lifetime_u = lifetime.value

function onStartup() {
  for( let i = 0; i < NUM_PARTICLES * NUM_PROPERTIES; i+= NUM_PROPERTIES ) {
    let angle = Math.random() * 2 * Math.PI
    state[ i ] = 0
    state[ i + 1 ] = 0
    state[ i + 2 ] = Math.cos(angle)
    state[ i + 3 ] = Math.sin(angle)
    state[ i + 4 ] = Math.random() * lifetime_u + 30.0
    state[ i + 5 ] = Math.random() * 0.08 - 0.04
  }
}

onStartup()

const state_b = sg.buffer( state ),
      frame_u = sg.uniform( 0 ),
      res_u   = sg.uniform([ sg.width, sg.height ]) 

document.body.onmousedown = function() {
  onStartup()
  state_b.write(state)
}

const render = await sg.render({
  shader: render_shader,
  data: [
    frame_u,
    res_u,
    state_b
  ],
  onframe() { 
    frame_u.value++;
   },
  count: NUM_PARTICLES,
  blend: true
})


const dc = Math.ceil( NUM_PARTICLES / 64 )

const compute = sg.compute({
  shader: compute_shader,
  data:[
    res_u,
    state_b
  ],
  dispatchCount: [ dc, dc, 1 ] 

})

lifetime.oninput = () => lifetime_u = lifetime.value

sg.run( compute, render )