Crafty.c('Player', {
	init: function () {
		this.requires('Fourway, Color, DOM, MouseFollow, Keyboard, Collision')
			.attr({ x:290, y:190, w:20, h:20, z:1 })
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

			// Die if hit by enemy bullet
			var b = this.hit('Bullet');
			if (b) {
				if (b[0].obj.enemy) {
					this.removeComponent('MouseFollow', false);
					this.destroy();
					b[0].obj.destroy();
				}
			}
		})

		this.bind('clickedscreen', function (e) {
			// If the player left clicks the screen, fire a bullet in the direction we are facing
			// TODO: replace height and width with actual generic calculations
			if (e.mouseButton === Crafty.mouseButtons.LEFT) {
				Crafty.e('Bullet').bullet(this.x + 9, this.y + 9, this.rotation, false);
				//Crafty.e('Bullet').bullet(x + 9, y + 9, rotation - 20, false);
				//Crafty.e('Bullet').bullet(x + 9, y + 9, rotation, false);
				//Crafty.e('Bullet').bullet(x + 9, y + 9, rotation + 20, false);
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

		this.enemy = false;
	},

	bullet: function (x, y, direction, enemy) {
		this.x = x;
		this.y = y;
		this.enemy = enemy;

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
				// Only die if not enemy bullet
				if (!b[0].obj.enemy) {
					// Get angle of bullet, convert to radians
					//var angle = b[0].obj.rotation * (Math.PI / 180);

					// Particle effect
					Crafty.e('Particles').particles(this.x + this.w/2, this.y + this.h/2, 300, 0.5, 10, 0.01, true);

					// Remove entities
					this.destroy();
					b[0].obj.destroy();

					/*// Update score
					Crafty('Score').each(function() {
						this.score += 100;
						this.text('Score: ' + this.score);
					});*/
				}
			}

			// Kill self if no player alive
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

Crafty.c('ShootingEnemy', {
	init: function () {
		this.requires('FollowingEnemy');
	},

	shootingenemy: function (x, y, speed) {
		// Call parent constructor
		this.followingenemy(x, y, speed);

		this.bind('EnterFrame', function (e) {
			if (e.frame % 60 === 0) {
				Crafty.e('Bullet').bullet(this.x + 3, this.y + 3, this.rotation, true);
			}
		});
	}
});

Crafty.c('Particles', {
	init: function () {
		// Deep clone
		this._Particles = Crafty.clone(this._Particles);
	},

	particles: function (x, y, timetolive, speed, duration, deceleration, follow) {
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
		//this._Particles.timetolivelow = timetolivelow;
		//this._Particles.timetolivehigh = timetolivehigh;
		this._Particles.timetolive = timetolive;
		this._Particles.speed = speed;
		this._Particles.duration = duration;
		this._Particles.decelerationMax = deceleration;
		this._Particles.follow = follow;

		// Destroy the particle engine when the component is removed or destroyed
		this.bind('Remove', function () {
			Crafty.stage.elem.removeChild(c);
		}).bind("RemoveComponent", function (id) {
			if (id === "particles")
				Crafty.stage.elem.removeChild(c);
		});

		// Local variables for flashing animation
		var flashing = false;
		var flashingCounter = 0;
		var flashes = 0;
		var visible = true;
		this.bind('EnterFrame', function () {
			// TODO: We need to implement selective redraw at some point...maybe
			ctx.clearRect(0, 0, Crafty.viewport.width, Crafty.viewport.height);

			// Update particles
			this._Particles.update();
			
			// Render them!
			if (visible) { this._Particles.render(ctx); }

			// Loop through each particle, if any of them are still enabled, 
			// keep running the engine, else destroy it to save resources
			//var alive = false;
			/*for (var i = 0; i < this._Particles.particles.length; i++) {
				if (this._Particles.particles[i].enabled == true) {
					alive = true;
					break;
				}
			};*/

			if (flashing) {
					flashingCounter++;
					if (flashingCounter === 20 && visible === false) {
						visible = true;
						flashingCounter = 0;
						flashes++;
					} else if (flashingCounter === 20 && visible === true) {
						visible = false;
						flashingCounter = 0;
					}
			}
			if (this._Particles.frame >= this._Particles.timetolive) {
				flashing = true;
			}
			if (flashes === 3) {
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
		decelerationMax: 0,
		follow: true,

		timetolive: 0,

		// Object to create a particle from
		// TODO: Add comment here to describe all params
		particle: {
			x: 0,
			y: 0,
			velocityX: 0,
			velocityY: 0,
			deceleration: 0,
			angle: 0,
			frame: 0,
			timetolive: 0,
			enabled: true,
			color: '',
			flashing: false,
			flashingCounter: 0,
			flashes: 0,
			visible: true
		},

		update: function (frame) {
			// If the particle engine is running, start generating new particles
			if (this.running && this.particles.length <= 200) {
				/* Generate some particles... add five particles this frame
				 * Build an object with random angle and random timetolive
				 * between the two boundaries, and generate a random color
				 * we can also calculate the x and y velocity as this will
				 * not change throughout the duration of the particle's
				 * existence, then push this into our array of particles */
				for (var i = 0; i < 5; i++) {
					var newParticle = Object.create(this.particle);
					newParticle.angle = Crafty.math.randomNumber(0, 2 * Math.PI);
					//newParticle.timetolive = Crafty.math.randomInt(this.timetolivelow, this.timetolivehigh);
					//newParticle.timetolive = this.timetolive;
					newParticle.color = 'rgb(255, ' + Crafty.math.randomInt(20, 160) + ', 0)';
					newParticle.velocityX = this.speed * Math.sin(newParticle.angle);
					newParticle.velocityY = this.speed * Math.cos(newParticle.angle);
					newParticle.deceleration = Crafty.math.randomNumber(0, this.decelerationMax);

					this.particles.push(newParticle);
				};
			}

			// Update the position of each particle in the list
			for (var i = 0; i < this.particles.length; i++) {
				// Update (x, y) position
				this.particles[i].x += this.particles[i].velocityX;
				this.particles[i].y += this.particles[i].velocityY;

				/*// Apply deceleration to the particle based on it's angle
				if (this.particles[i].velocityX > 0.4 || this.particles[i].velocityY > 0.4) {
					this.particles[i].velocityX -= this.particles[i].deceleration * Math.sin(this.particles[i].angle);
					this.particles[i].velocityY -= this.particles[i].deceleration * Math.cos(this.particles[i].angle);
				}*/

				if (this.follow === true) {
					// Make them follow the player, and check for collision, update player and stuff...
					var p = Crafty('Player');

					// Accelerate towards player, limit v...
					if (p.x > this.particles[i].x) {
						if (this.particles[i].velocityX < 2) { this.particles[i].velocityX += 0.04; }
					}
					if (p.x < this.particles[i].x) {
						if (this.particles[i].velocityX > -2) { this.particles[i].velocityX -= 0.04; }
					}
					if (p.y > this.particles[i].y) {
						if (this.particles[i].velocityY < 2) { this.particles[i].velocityY += 0.04; }
					}
					if (p.y < this.particles[i].y) {
						if (this.particles[i].velocityY > -2) { this.particles[i].velocityY -= 0.04; }
					}

					if (this.particles[i].enabled && this.particles[i].x > p.x && this.particles[i].x < p.x + p.w && this.particles[i].y > p.y && this.particles[i].y < p.y + p.h) {
						this.particles[i].enabled = false;
						// Update score
						Crafty('Score').each(function() {
							this.score += 1;
							this.text('Score: ' + this.score);
						});
					}
				}

				// Increment the number of frames this particle has been alive for,
				// if this is greater than the particle's timetolive, start a
				// flashing animation, after a while it will be destroyed
				this.particles[i].frame++;
				if (this.particles[i].frame >= this.particles[i].timetolive) {
					//this.particles[i].enabled = false;
				}

				/*// Do flashing animation for dying particles
				if (this.particles[i].flashing && this.particles[i].enabled) {
					this.particles[i].flashingCounter++;
					if (this.particles[i].flashingCounter === 30 && this.particles[i].visible === true) {
						this.particles[i].visible = false;
						this.particles[i].flashingCounter = 0;
						this.particles[i].flashes++;
					} else if (this.particles[i].flashingCounter === 30 && this.particles[i].visible === false) {
						this.particles[i].visible = true;
						this.particles[i].flashingCounter = 0;
					}
				}

				// Kill particles
				if (this.particles[i].flashes === 3) {
					this.particles[i].enabled = false;
				}*/
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

Crafty.c('Starfield', {
	init: function () {
		// Deep copy
		this._Stars = Crafty.clone(this._Stars);
	},

	starfield: function () {
		// Create our own canvas to draw on, set the size and add it to the stage
		var c, ctx;

		c = document.createElement("canvas");
		c.width = Crafty.viewport.width;
		c.height = Crafty.viewport.height;
		c.style.position = 'absolute';

		Crafty.stage.elem.appendChild(c);

		ctx = c.getContext('2d');

		// Destroy the particle engine when the component is removed or destroyed
		this.bind('Remove', function () {
			Crafty.stage.elem.removeChild(c);
		}).bind("RemoveComponent", function (id) {
			if (id === "starfield")
				Crafty.stage.elem.removeChild(c);
		});

		this.bind('EnterFrame', function (e) {
			// Clear the canvas
			ctx.clearRect(0, 0, Crafty.viewport.width, Crafty.viewport.height);

			// Update and render the stars
			this._Stars.update(e.frame);
			this._Stars.render(ctx);
		});
	},

	_Stars: {
		stars: [],

		star: {
			x: 0,
			y: 0,
			speed: 0,
			size: 0
		},

		update: function (frame) {
			if (frame % 5 == 0) {
				// Generate a new star
				var newStar = Object.create(this.star);
				newStar.x = Crafty.math.randomInt(0, Crafty.viewport.width);
				newStar.speed = Crafty.math.randomInt(1, 2);
				newStar.size = newStar.speed;
				this.stars.push(newStar);
			}

			for (var i = 0; i < this.stars.length; i++) {
				this.stars[i].y += this.stars[i].speed;

				if (this.stars[i].y > Crafty.viewport.height + 100) {
					this.stars.remove(i);
				}
			};
		},

		render: function (ctx) {
			ctx.fillStyle = 'white';

			// Render each star
			for (var i = 0; i < this.stars.length; i++) {
				ctx.fillRect(this.stars[i].x, this.stars[i].y, this.stars[i].size, this.stars[i].size);
			};
		}
	}
});
