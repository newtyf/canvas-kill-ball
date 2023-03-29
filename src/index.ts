import { gsap } from "gsap";

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const c = canvas.getContext("2d") as CanvasRenderingContext2D;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const music = new Audio("/explosion.wav");

let points: number = 0;
const element = <HTMLParagraphElement>document.querySelector("#points");
element.innerText = `points: ${points}`;

/**
 * TODO: acces and play video of camera
    const video = document.querySelector("#video") as HTMLVideoElement;
    navigator.mediaDevices.getUserMedia({video: true}).then(stream => {
      video.srcObject = stream
      video.play()
    })
 */

class Player {
  x: number;
  y: number;
  radius: number;
  color: string;

  constructor(x: number, y: number, radius: number, color: string) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw(): void {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.color;
    c.fill();
  }
}
class Projectile extends Player {
  movement: { x: number; y: number };
  velocity: number;

  constructor(
    x: number,
    y: number,
    radius: number,
    color: string,
    movement: { x: number, y: number },
    velocity: number
  ) {
    super(x, y, radius, color);
    this.movement = movement;
    this.velocity = velocity;
  }

  update(): void {
    this.draw();
    this.x = this.x + this.movement.x * this.velocity;
    this.y = this.y + this.movement.y * this.velocity;
  }
}
class Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  movement: { x: number, y: number };
  velocity: number;
  
  constructor(x: number, y: number, radius: number, color: string, movement: {x:number, y:number}, velocity: number) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.movement = movement
    this.velocity = velocity
  }

  draw(): void {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.color;
    c.fill();
  }

  update(): void {
    this.draw();
    this.x = this.x + this.movement.x * this.velocity;
    this.y = this.y + this.movement.y * this.velocity;
  }


}
class Enemy extends Projectile { }

const player = new Player(canvas.width / 2, canvas.height / 2, 10, "white");
let projectiles: Projectile[] = [];
let enemies: Enemy[] = [];
let particles: Particle[] = []

window.addEventListener("click", (event: MouseEvent) => {
  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  );
  const movement = {
    x: Math.cos(angle),
    y: Math.sin(angle),
  };
  const projectile = new Projectile(
    canvas.width / 2,
    canvas.height / 2,
    10,
    "white",
    movement,
    3
  );
  projectiles.push(projectile);
});

function spawnEnemies(time: number = 1000): number {
  const interval = setInterval(() => {
    let x: number;
    let y: number;
    const radius = Math.random() * (40 - 10) + 10;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }
    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
    const velocity = 1;

    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    const movement = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
    enemies.push(new Enemy(x, y, radius, color, movement, velocity));
  }, time);

  return interval;
}

let intervalId: number = spawnEnemies();
let animationId: number;
function animate() {
  animationId = requestAnimationFrame(animate);
  c.fillStyle = "rgba(0, 0, 0, .1)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();
  projectiles.forEach((projectile, index) => {
    projectile.update();
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    }
  });
  enemies.forEach((enemy, enemyIndex) => {
    enemy.update();

    const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);

    // TODO: end game
    if (distance - player.radius - enemy.radius < 1) {
      cancelAnimationFrame(animationId);
      clearInterval(intervalId);
    }

    projectiles.forEach((projectile, projectileIndex) => {
      const distance = Math.hypot(
        projectile.x - enemy.x,
        projectile.y - enemy.y
      );

      // when
      if (distance - player.radius - projectile.radius < 1) {
        if (enemy.radius >= 25) {
          gsap.to(enemy, {
            radius: enemy.radius / 2,
          });
          setTimeout(() => {
            projectiles.splice(projectileIndex, 1);
            music.currentTime = 0;
            music.play();
          }, 0);
        } else {
          setTimeout(() => {
            enemies.splice(enemyIndex, 1);
            projectiles.splice(projectileIndex, 1);
            music.currentTime = 0;
            music.play();
            particles.push(new Particle(enemy.x, enemy.y, 5, enemy.color, {x: 1, y: 1}, 5 ), new Particle(enemy.x, enemy.y, 5, enemy.color, {x: -1, y: -1}, 5 ), new Particle(enemy.x, enemy.y, 5, enemy.color, {x: 1, y: 0}, 5 ), new Particle(enemy.x, enemy.y, 5, enemy.color, {x: 0, y: 1}, 5 ),new Particle(enemy.x, enemy.y, 5, enemy.color, {x: -1, y: 0}, 5 ), new Particle(enemy.x, enemy.y, 5, enemy.color, {x: 0, y: -1}, 5 ))
            points++;
            element.innerText = `points: ${points}`;
          }, 0);
        }

        if (points === 50) {
          clearInterval(intervalId);
          spawnEnemies(800);
        }
      }
    });
  });
  particles.forEach(particle => {
    console.log(particles)
    particle.update()
  })
}
animate();
