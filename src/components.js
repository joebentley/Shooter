Crafty.c('Player', {
	init: function () {
		this.requires('Fourway, Color, DOM, MouseFollow, Keyboard, Collision')
			.attr({ x:300, y:200, w:20, h:20, z:1 })
			.color('rgb(20, 125, 40)')
			.fourway(2);

		this.origin('center');

		this.bind('EnterFrame', function () {
			// Stop movement on screen edge
			if (this.x < 0) {
				this.x = 0;
			}
			else if (this.x + this.w > 600) {
				this.x = 600 - this.w;
			}
			if (this.y < 0) {
				this.y = 0;
			}
			else if (this.y + this.h > 400) {
				this.y = 400 - this.h;
			}

			// Destroy this and the MouseFollow entity if hit enemy
			if (this.hit('Enemy')) {
				this.removeComponent('MouseFollow', false);
				this.destroy();
			}
		})
	}
});

Crafty.c('MouseFollow', {
	init: function () {
		this.requires('2D');
		
		var mouseX = 0;
		var mouseY = 0;

		var x = 0;
		var y = 0;
		var rotation = 0;

		this.bind('mousemovement', function (e) {
			mouseX = Crafty.mousePos.x;
			mouseY = Crafty.mousePos.y;
		});

		this.bind('clickedscreen', function (e) {
			// If the player left clicks the screen, fire a bullet in the direction we are facing
			// TODO: replace height and width with actual generic calculations
			if (e.mouseButton === Crafty.mouseButtons.LEFT) {
				Crafty.e('Bullet').bullet(x + 9, y + 9, rotation);
			}
		})

		this.bind('EnterFrame', function () {
			// Use trig to find rotation amount, we add 90 to line the 0 value with the y-axis instead of the x-axis
			this.rotation = (Math.atan2(mouseY - this.y, mouseX - this.x) * 180 / Math.PI) + 90;

			x = this.x;
			y = this.y;
			rotation = this.rotation;
		});
	}
});

Crafty.c('Bullet', {
	init: function () {
		this.requires('2D, Color, DOM')
			.attr({ x:0, y:0, w:3, h:3, z:0 })
			.color('rgb(255, 255, 0)');

		this.origin('center');
	},

	bullet: function (x, y, direction) {
		this.x = x;
		this.y = y;

		var speed = 5;

		this.bind('EnterFrame', function () {
			this.rotation = direction;

			this.x += Math.sin(direction * (Math.PI / 180)) * speed;
			this.y -= Math.cos(direction * (Math.PI / 180)) * speed;

			// TODO: Get rid of hardcoded screen width and height
			if (this.x < -100 || this.x > 700 || this.y < -100 || this.y > 500) {
				this.destroy();
			}
		})
	}
});

Crafty.c('Enemy', {
	init: function () {
		this.requires('2D, Color, DOM, Collision')
			.attr({ x:0, y:0, w:15, h:15, z:1 })
			.color('rgb(255, 0, 0)');

		this.origin('center');

		this.bind('EnterFrame', function () {
			// If hit by bullet, destroy the enemy and the bullet and increment the player's score
			var b = this.hit('Bullet')
			if (b) {
				// Particle effect
				Crafty.e('Particles').particles(this.x + this.w/2, this.y + this.h/2, 50, 80, 1, 10);

				// Remove entities
				this.destroy();
				b[0].obj.destroy();

				// Update score
				Crafty('Score').each(function() {
					this.score += 100;
					this.text('Score: ' + this.score);
				});
			}

			if (Crafty('Player').length == 0) {
				this.destroy();
			}
		});
	},

	enemy: function (x, y) {
		this.x = x;
		this.y = y;
	}
});

Crafty.c('FollowingEnemy', {
	init: function () {
		this.requires('Enemy');
	},

	followingenemy: function (x, y, speed) {
		this.x = x;
		this.y = y;
		var s = speed;

		this.bind('EnterFrame', function () {
			var playerX = Crafty('Player').x;
			var playerY = Crafty('Player').y;

			// Find angle between enemy and player
			this.rotation = (Math.atan2(playerY - this.y, playerX - this.x) * 180 / Math.PI) + 90;

			this.x += Math.sin(this.rotation * (Math.PI / 180)) * s;
			this.y -= Math.cos(this.rotation * (Math.PI / 180)) * s;
		});
	}
});

Crafty.c('Particles', {
	init: function () {
		// Deep clone
		this._Particles = Crafty.clone(this._Particles);
	},

	particles: function (x, y, timetolivelow, timetolivehigh, speed, duration) {
		// Create our own canvas to draw on, set the size and add it to the stage
		var c, ctx;

		c = document.createElement("canvas");
		c.width = Crafty.viewport.width;
		c.height = Crafty.viewport.height;
		c.style.position = 'absolute';

		Crafty.stage.elem.appendChild(c);

		ctx = c.getContext('2d');

		// Set up particle and params
		this._Particles.particle.x = x;
		this._Particles.particle.y = y;
		this._Particles.timetolivelow = timetolivelow;
		this._Particles.timetolivehigh = timetolivehigh;
		this._Particles.speed = speed;
		this._Particles.duration = duration;

		// Destroy the particle engine when the component is removed or destroyed
		this.bind('Remove', function () {
			Crafty.stage.elem.removeChild(c);
		}).bind("RemoveComponent", function (id) {
			if (id === "particles")
				Crafty.stage.elem.removeChild(c);
		});

		this.bind('EnterFrame', function () {
			// TODO: We need to implement selective redraw at some point...maybe
			ctx.clearRect(0, 0, Crafty.viewport.width, Crafty.viewport.height);

			// Update particles
			this._Particles.update();
			
			// Render them!
			this._Particles.render(ctx);

			// Loop through each particle, if any of them are still enabled, 
			// keep running the engine, else destroy it to save resources
			var alive = false;
			for (var i = 0; i < this._Particles.particles.length; i++) {
				if (this._Particles.particles[i].enabled == true) {
					alive = true;
					break;
				}
			};
			if (!alive) {
				this.destroy();
			}
		});
	},

	_Particles: {
		// Our list of particles
		particles: [],

		// Current frame
		frame: 0,

		// Whether the particle engine should keep generating particles
		running: true,

		// Params
		timetolivelow: 0,
		timetolivehigh: 0,
		speed: 0,
		duration: 0,

		// Object to create a particle from
		particle: {
			x: 0,
			y: 0,
			angle: 0,
			frame: 0,
			timetolive: 0,
			enabled: true,
			color: ''
		},

		update: function (frame) {
			// If the particle engine is running, start generating new particles
			if (this.running) {
				/* Generate some particles... add five particles this frame
				 * Build an object with random angle and random timetolive
				 * between the two boundaries, and generate a random color
				 * then push this into our array of particles */
				for (var i = 0; i < 5; i++) {
					var newParticle = Object.create(this.particle);
					newParticle.angle = Crafty.math.randomNumber(0, 2 * Math.PI);
					newParticle.timetolive = Crafty.math.randomInt(this.timetolivelow, this.timetolivehigh);
					newParticle.color = 'rgb(255, ' + Crafty.math.randomInt(20, 160) + ', 0)';
					this.particles.push(newParticle);
				};
			}

			// Update the position of each particle in the list
			for (var i = 0; i < this.particles.length; i++) {
				// Use trig and the particles angle to calculate how much to change the (x, y) by each frame
				this.particles[i].x += this.speed * Math.sin(this.particles[i].angle);
				this.particles[i].y += this.speed * Math.cos(this.particles[i].angle);

				/* Increment the number of frames this particle has been alive for, if this is greater
				 * than the particle's timetolive, disable the particle from being rendered */
				this.particles[i].frame++;
				if (this.particles[i].frame >= this.particles[i].timetolive) {
					this.particles[i].enabled = false;
				}
			};

			// Disable the particle engine if duration has been reached
			if (this.frame >= this.duration) {
				this.running = false;
			}
			this.frame++;
		},

		render: function (ctx) {
			// Render each particle
			for (var i = 0; i < this.particles.length; i++) {
				if (this.particles[i].enabled) {
					ctx.fillStyle = this.particles[i].color;
					ctx.fillRect(this.particles[i].x, this.particles[i].y, 2, 2);
				}
			};
		}
	}
});
