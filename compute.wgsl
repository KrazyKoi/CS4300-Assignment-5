struct Particle {
  pos: vec2f,
  vel: vec2f,
  lifetime: f32,
  rotation: f32
};

@group(0) @binding(0) var<uniform> res:   vec2f;
@group(0) @binding(1) var<storage, read_write> state: array<Particle>;

fn cellindex( cell:vec3u ) -> u32 {
  let size = 8u;
  return cell.x + (cell.y * size) + (cell.z * size * size);
}

@compute
@workgroup_size(8,8)

fn cs(@builtin(global_invocation_id) cell:vec3u)  {
  let i = cellindex( cell );
  let p = state[ i ];
  var next = p;
  next.lifetime -= 0.16;
  if(next.lifetime <= 20.0){
    let cos_n = cos(next.rotation);
    let sin_n = sin(next.rotation);
    next.vel = vec2f(
      next.vel.x * cos_n - next.vel.y * sin_n,
      next.vel.x * sin_n + next.vel.y * cos_n
    );
  }
  next.pos = p.pos + (2. / res) * next.vel;
  if( next.pos.x >= 1. ) { next.pos.x -= 2.; }
  if( next.pos.y >= 1. ) { next.pos.y -= 2.; }
  if( next.pos.x < -1. ) { next.pos.x += 2.; }
  if( next.pos.y < -1. ) { next.pos.y += 2.; }
  state[i] = next;
}
